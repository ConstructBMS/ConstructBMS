import { supabase } from './supabase';
import { persistentStorage } from './persistentStorage';

// Types for bar styles
export interface BarStyleCondition {
  field: string;
  operator: '=' | '!=' | 'contains';
  value: string;
}

export interface BarStyle {
  barColor: string;
  borderColor: string;
  pattern?: 'dashed' | 'solid' | 'none';
  textColor: string;
}

export interface BarStyleRule {
  condition: BarStyleCondition;
  createdAt: string;
  createdBy: string;
  demo: boolean;
  id: string;
  isDefault: boolean;
  projectId: string;
  ruleName: string;
  style: BarStyle;
  updatedAt: string;
}

export interface BarStyleConfig {
  demo: boolean;
  enabled: boolean;
  maxRules: number;
}

// Default configuration
const defaultConfig: BarStyleConfig = {
  enabled: true,
  maxRules: 50,
  demo: false
};

// Default bar styles for special cases
const defaultBarStyles: BarStyleRule[] = [
  {
    id: 'critical-path',
    projectId: 'system',
    ruleName: 'Critical Path',
    condition: { field: 'isCritical', operator: '=', value: 'true' },
    style: {
      barColor: '#EF4444',
      borderColor: '#DC2626',
      textColor: '#FFFFFF',
      pattern: 'solid'
    },
    createdBy: 'system',
    isDefault: true,
    demo: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'milestone',
    projectId: 'system',
    ruleName: 'Milestones',
    condition: { field: 'type', operator: '=', value: 'milestone' },
    style: {
      barColor: '#8B5CF6',
      borderColor: '#7C3AED',
      textColor: '#FFFFFF',
      pattern: 'solid'
    },
    createdBy: 'system',
    isDefault: true,
    demo: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class BarStylesService {
  private configKey = 'barStylesConfig';

  /**
   * Get current configuration
   */
  async getConfig(): Promise<BarStyleConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || defaultConfig;
    } catch (error) {
      console.error('Error getting bar styles config:', error);
      return defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<BarStyleConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, newConfig);
      console.log('Bar styles config updated');
    } catch (error) {
      console.error('Error updating bar styles config:', error);
      throw error;
    }
  }

  /**
   * Get bar style rules for project
   */
  async getBarStyleRules(projectId: string): Promise<BarStyleRule[]> {
    try {
      const { data, error } = await supabase
        .from('programme_bar_styles')
        .select('*')
        .eq('project_id', projectId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching bar style rules:', error);
        return defaultBarStyles;
      }

      // Transform database format to our interface
      return data.map(rule => ({
        id: rule.id,
        projectId: rule.project_id,
        ruleName: rule.rule_name,
        condition: rule.condition,
        style: rule.style,
        createdBy: rule.created_by,
        isDefault: rule.is_default,
        demo: rule.demo,
        createdAt: rule.created_at,
        updatedAt: rule.updated_at
      }));
    } catch (error) {
      console.error('Error getting bar style rules:', error);
      return defaultBarStyles;
    }
  }

  /**
   * Create a new bar style rule
   */
  async createBarStyleRule(rule: Omit<BarStyleRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<BarStyleRule> {
    try {
      const config = await this.getConfig();
      
      // Check demo mode limits
      if (config.demo) {
        const existingRules = await this.getBarStyleRules(rule.projectId);
        const nonDefaultRules = existingRules.filter(r => !r.isDefault);
        if (nonDefaultRules.length >= 2) {
          throw new Error('Maximum 2 custom rules allowed in demo mode');
        }
      }

      const { data, error } = await supabase
        .from('programme_bar_styles')
        .insert({
          project_id: rule.projectId,
          rule_name: rule.ruleName,
          condition: rule.condition,
          style: rule.style,
          created_by: rule.createdBy,
          is_default: rule.isDefault,
          demo: config.demo
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating bar style rule:', error);
        throw error;
      }

      return {
        id: data.id,
        projectId: data.project_id,
        ruleName: data.rule_name,
        condition: data.condition,
        style: data.style,
        createdBy: data.created_by,
        isDefault: data.is_default,
        demo: data.demo,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error creating bar style rule:', error);
      throw error;
    }
  }

  /**
   * Update a bar style rule
   */
  async updateBarStyleRule(ruleId: string, updates: Partial<BarStyleRule>): Promise<BarStyleRule> {
    try {
      const updateData: any = {};
      
      if (updates.ruleName) updateData.rule_name = updates.ruleName;
      if (updates.condition) updateData.condition = updates.condition;
      if (updates.style) updateData.style = updates.style;
      if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;

      const { data, error } = await supabase
        .from('programme_bar_styles')
        .update(updateData)
        .eq('id', ruleId)
        .select()
        .single();

      if (error) {
        console.error('Error updating bar style rule:', error);
        throw error;
      }

      return {
        id: data.id,
        projectId: data.project_id,
        ruleName: data.rule_name,
        condition: data.condition,
        style: data.style,
        createdBy: data.created_by,
        isDefault: data.is_default,
        demo: data.demo,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error updating bar style rule:', error);
      throw error;
    }
  }

  /**
   * Delete a bar style rule
   */
  async deleteBarStyleRule(ruleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('programme_bar_styles')
        .delete()
        .eq('id', ruleId);

      if (error) {
        console.error('Error deleting bar style rule:', error);
        throw error;
      }

      console.log('Bar style rule deleted:', ruleId);
    } catch (error) {
      console.error('Error deleting bar style rule:', error);
      throw error;
    }
  }

  /**
   * Get the appropriate bar style for a task
   */
  getBarStyleForTask(task: any, rules: BarStyleRule[]): BarStyle | null {
    // Sort rules by priority: default rules first, then by creation date
    const sortedRules = [...rules].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // Find the first matching rule
    for (const rule of sortedRules) {
      if (this.matchesRule(task, rule.condition)) {
        return rule.style;
      }
    }

    return null; // No matching rule
  }

  /**
   * Check if a task matches a rule condition
   */
  private matchesRule(task: any, condition: BarStyleCondition): boolean {
    const fieldValue = this.getFieldValue(task, condition.field);
    
    switch (condition.operator) {
      case '=':
        return fieldValue === condition.value;
      case '!=':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(condition.value.toLowerCase());
      default:
        return false;
    }
  }

  /**
   * Get field value from task object
   */
  private getFieldValue(task: any, field: string): any {
    switch (field) {
      case 'isCritical':
        return task.isCritical || task.criticalPath || false;
      case 'type':
        return task.type || task.taskType || 'standard';
      case 'status':
        return task.status || task.taskStatus || 'not-started';
      case 'tagId':
        return task.tagId || task.tags || '';
      case 'assignee':
        return task.assignee || task.assignedTo || '';
      case 'priority':
        return task.priority || 'medium';
      default:
        return task[field] || '';
    }
  }

  /**
   * Generate CSS for bar styles
   */
  generateBarStylesCSS(rules: BarStyleRule[]): string {
    const cssRules = [];
    
    // Default bar style
    cssRules.push(`
      .gantt-task-bar {
        background-color: #3B82F6;
        border: 1px solid #1E40AF;
        border-radius: 3px;
        transition: all 0.2s ease;
      }
    `);

    // Custom bar styles
    rules.forEach(rule => {
      const { style } = rule;
      cssRules.push(`
        .gantt-task-bar[data-rule="${rule.id}"] {
          background-color: ${style.barColor} !important;
          border-color: ${style.borderColor} !important;
          color: ${style.textColor} !important;
          ${style.pattern === 'dashed' ? 'border-style: dashed;' : ''}
          ${style.pattern === 'dotted' ? 'border-style: dotted;' : ''}
        }
        
        .gantt-task-bar[data-rule="${rule.id}"]:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
      `);
    });

    return cssRules.join('\n');
  }

  /**
   * Apply bar styles to DOM
   */
  applyBarStyles(rules: BarStyleRule[]): void {
    try {
      // Remove existing style tag if it exists
      const existingStyle = document.getElementById('constructbms-bar-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag
      const styleTag = document.createElement('style');
      styleTag.id = 'constructbms-bar-styles';
      styleTag.textContent = this.generateBarStylesCSS(rules);
      
      document.head.appendChild(styleTag);
      
      console.log('Bar styles applied to DOM');
    } catch (error) {
      console.error('Error applying bar styles to DOM:', error);
    }
  }

  /**
   * Validate bar style rule
   */
  validateBarStyleRule(rule: Partial<BarStyleRule>): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];
    
    // Validate rule name
    if (!rule.ruleName?.trim()) {
      errors.push('Rule name is required');
    }
    
    // Validate condition
    if (!rule.condition) {
      errors.push('Condition is required');
    } else {
      if (!rule.condition.field) {
        errors.push('Condition field is required');
      }
      if (!['isCritical', 'type', 'status', 'tagId', 'assignee', 'priority'].includes(rule.condition.field)) {
        errors.push('Invalid condition field');
      }
      if (!['=', '!=', 'contains'].includes(rule.condition.operator)) {
        errors.push('Invalid condition operator');
      }
      if (!rule.condition.value?.trim()) {
        errors.push('Condition value is required');
      }
    }
    
    // Validate style
    if (!rule.style) {
      errors.push('Style is required');
    } else {
      if (!rule.style.barColor?.match(/^#[0-9A-F]{6}$/i)) {
        errors.push('Invalid bar color format');
      }
      if (!rule.style.borderColor?.match(/^#[0-9A-F]{6}$/i)) {
        errors.push('Invalid border color format');
      }
      if (!rule.style.textColor?.match(/^#[0-9A-F]{6}$/i)) {
        errors.push('Invalid text color format');
      }
      if (rule.style.pattern && !['dashed', 'solid', 'none'].includes(rule.style.pattern)) {
        errors.push('Invalid pattern option');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available condition fields
   */
  getAvailableFields(): { description: string, label: string; value: string; }[] {
    return [
      { value: 'isCritical', label: 'Critical Path', description: 'Tasks on critical path' },
      { value: 'type', label: 'Task Type', description: 'Task type (milestone, summary, etc.)' },
      { value: 'status', label: 'Status', description: 'Task status (not-started, in-progress, etc.)' },
      { value: 'tagId', label: 'Tag', description: 'Task tags' },
      { value: 'assignee', label: 'Assignee', description: 'Assigned user' },
      { value: 'priority', label: 'Priority', description: 'Task priority' }
    ];
  }

  /**
   * Get available operators
   */
  getAvailableOperators(): { description: string, label: string; value: string; }[] {
    return [
      { value: '=', label: 'Equals', description: 'Exact match' },
      { value: '!=', label: 'Not Equals', description: 'Does not match' },
      { value: 'contains', label: 'Contains', description: 'Contains text' }
    ];
  }

  /**
   * Get pattern options
   */
  getPatternOptions(): { description: string, label: string; value: string; }[] {
    return [
      { value: 'solid', label: 'Solid', description: 'Solid border' },
      { value: 'dashed', label: 'Dashed', description: 'Dashed border' },
      { value: 'none', label: 'None', description: 'No border' }
    ];
  }
}

// Export singleton instance
export const barStylesService = new BarStylesService(); 