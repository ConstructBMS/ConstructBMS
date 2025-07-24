import { persistentStorage } from './persistentStorage';

export interface BarStyle {
  border: string;
  demo?: boolean;
  fill: string;
  id: string;
  name: string;
  pattern: 'solid' | 'dashed' | 'dotted' | 'gradient';
  projectId: string;
  userId: string;
}

export interface StyleRule {
  demo?: boolean;
  field: string;
  id: string;
  name: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  priority: number;
  projectId: string;
  styleId: string;
  userId: string;
  value: string;
}

export interface CustomBarStylesSettings {
  defaultStyle: string;
  demo?: boolean;
  enabled: boolean;
}

export interface CustomBarStylesConfig {
  demo?: boolean;
  enabled: boolean;
  maxRules: number;
  maxStyles: number;
}

// Default ConstructBMS custom bar styles settings
const defaultSettings: CustomBarStylesSettings = {
  enabled: true,
  defaultStyle: 'default'
};

class CustomBarStylesService {
  private configKey = 'customBarStylesConfig';
  private settingsKey = 'customBarStylesSettings';
  private stylesKey = 'customBarStyles';
  private rulesKey = 'customBarStyleRules';

  // Default configuration
  private defaultConfig: CustomBarStylesConfig = {
    enabled: true,
    maxStyles: 20,
    maxRules: 50,
    demo: false
  };

  // Default bar styles
  private defaultBarStyles: BarStyle[] = [
    {
      id: 'default',
      name: 'Default',
      fill: '#3B82F6',
      border: '#1E40AF',
      pattern: 'solid',
      projectId: 'system',
      userId: 'system'
    },
    {
      id: 'critical',
      name: 'Critical',
      fill: '#EF4444',
      border: '#DC2626',
      pattern: 'solid',
      projectId: 'system',
      userId: 'system'
    },
    {
      id: 'milestone',
      name: 'Milestone',
      fill: '#8B5CF6',
      border: '#7C3AED',
      pattern: 'solid',
      projectId: 'system',
      userId: 'system'
    }
  ];

  /**
   * Get current configuration
   */
  async getConfig(): Promise<CustomBarStylesConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting custom bar styles config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<CustomBarStylesConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('Custom bar styles config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating custom bar styles config:', error);
      throw error;
    }
  }

  /**
   * Get custom bar styles settings for project
   */
  async getCustomBarStylesSettings(projectId: string): Promise<CustomBarStylesSettings> {
    try {
      const config = await this.getConfig();
      const settings = await persistentStorage.get(`${this.settingsKey}_${projectId}`);
      
      if (settings) {
        return settings;
      }
      
      // Return default settings if none exist
      return defaultSettings;
    } catch (error) {
      console.error('Error getting custom bar styles settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Save custom bar styles settings for project
   */
  async saveCustomBarStylesSettings(projectId: string, settings: Partial<CustomBarStylesSettings>): Promise<void> {
    try {
      const config = await this.getConfig();
      const currentSettings = await this.getCustomBarStylesSettings(projectId);
      
      await persistentStorage.set(`${this.settingsKey}_${projectId}`, {
        ...currentSettings,
        ...settings,
        demo: config.demo
      });
      
      console.log('Custom bar styles settings saved for project:', projectId);
    } catch (error) {
      console.error('Error saving custom bar styles settings:', error);
      throw error;
    }
  }

  /**
   * Get bar styles for project
   */
  async getBarStyles(projectId: string): Promise<BarStyle[]> {
    try {
      const config = await this.getConfig();
      const styles = await persistentStorage.get(`${this.stylesKey}_${projectId}`);
      
      if (styles) {
        return styles;
      }
      
      // Return default styles if none exist
      return this.defaultBarStyles;
    } catch (error) {
      console.error('Error getting bar styles:', error);
      return this.defaultBarStyles;
    }
  }

  /**
   * Save bar styles for project
   */
  async saveBarStyles(projectId: string, styles: BarStyle[]): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Apply demo mode limits
      if (config.demo) {
        if (styles.length > 2) {
          throw new Error('Maximum 2 styles allowed in demo mode');
        }
      } else {
        if (styles.length > config.maxStyles) {
          throw new Error(`Maximum ${config.maxStyles} styles allowed`);
        }
      }
      
      // Tag all styles with demo flag
      const taggedStyles = styles.map(style => ({
        ...style,
        demo: config.demo
      }));
      
      await persistentStorage.set(`${this.stylesKey}_${projectId}`, taggedStyles);
      console.log('Bar styles saved for project:', projectId);
    } catch (error) {
      console.error('Error saving bar styles:', error);
      throw error;
    }
  }

  /**
   * Get style rules for project
   */
  async getStyleRules(projectId: string): Promise<StyleRule[]> {
    try {
      const config = await this.getConfig();
      const rules = await persistentStorage.get(`${this.rulesKey}_${projectId}`);
      
      if (rules) {
        return rules;
      }
      
      // Return empty array if none exist
      return [];
    } catch (error) {
      console.error('Error getting style rules:', error);
      return [];
    }
  }

  /**
   * Save style rules for project
   */
  async saveStyleRules(projectId: string, rules: StyleRule[]): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Apply demo mode limits
      if (config.demo) {
        if (rules.length > 1) {
          throw new Error('Maximum 1 rule allowed in demo mode');
        }
      } else {
        if (rules.length > config.maxRules) {
          throw new Error(`Maximum ${config.maxRules} rules allowed`);
        }
      }
      
      // Tag all rules with demo flag and ensure proper priority ordering
      const taggedRules = rules.map((rule, index) => ({
        ...rule,
        priority: index + 1,
        demo: config.demo
      }));
      
      await persistentStorage.set(`${this.rulesKey}_${projectId}`, taggedRules);
      console.log('Style rules saved for project:', projectId);
    } catch (error) {
      console.error('Error saving style rules:', error);
      throw error;
    }
  }

  /**
   * Get CSS for custom bar styles
   */
  generateCustomBarStylesCSS(styles: BarStyle[], rules: StyleRule[]): string {
    return `
      /* Custom Bar Styles */
      
      /* Default bar style */
      .gantt-task-bar {
        background-color: #3B82F6;
        border: 1px solid #1E40AF;
        border-radius: 3px;
        transition: all 0.2s ease;
      }
      
      /* Custom bar styles */
      ${styles.map(style => `
        .gantt-task-bar[data-style="${style.id}"] {
          background-color: ${style.fill};
          border-color: ${style.border};
          ${style.pattern === 'dashed' ? 'border-style: dashed;' : ''}
          ${style.pattern === 'dotted' ? 'border-style: dotted;' : ''}
          ${style.pattern === 'gradient' ? `background: linear-gradient(45deg, ${style.fill}, ${style.border});` : ''}
        }
        
        .gantt-task-bar[data-style="${style.id}"]:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
      `).join('')}
      
      /* Style rule classes */
      ${rules.map(rule => `
        .gantt-task-bar[data-rule="${rule.id}"] {
          background-color: ${styles.find(s => s.id === rule.styleId)?.fill || '#3B82F6'};
          border-color: ${styles.find(s => s.id === rule.styleId)?.border || '#1E40AF'};
          ${styles.find(s => s.id === rule.styleId)?.pattern === 'dashed' ? 'border-style: dashed;' : ''}
          ${styles.find(s => s.id === rule.styleId)?.pattern === 'dotted' ? 'border-style: dotted;' : ''}
          ${styles.find(s => s.id === rule.styleId)?.pattern === 'gradient' ? `background: linear-gradient(45deg, ${styles.find(s => s.id === rule.styleId)?.fill || '#3B82F6'}, ${styles.find(s => s.id === rule.styleId)?.border || '#1E40AF'});` : ''}
        }
      `).join('')}
      
      /* Bar style variables */
      :root {
        --default-bar-fill: #3B82F6;
        --default-bar-border: #1E40AF;
        --custom-styles-count: ${styles.length};
        --custom-rules-count: ${rules.length};
      }
    `;
  }

  /**
   * Apply custom bar styles to DOM
   */
  applyCustomBarStyles(styles: BarStyle[], rules: StyleRule[]): void {
    try {
      // Remove existing style tag if it exists
      const existingStyle = document.getElementById('constructbms-custom-bar-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag
      const styleTag = document.createElement('style');
      styleTag.id = 'constructbms-custom-bar-styles';
      styleTag.textContent = this.generateCustomBarStylesCSS(styles, rules);
      
      document.head.appendChild(styleTag);
      
      // Update Gantt data attributes
      const ganttElements = document.querySelectorAll('.gantt-container, .timeline');
      ganttElements.forEach(element => {
        element.setAttribute('data-custom-styles', styles.length.toString());
        element.setAttribute('data-custom-rules', rules.length.toString());
      });
      
      console.log('Custom bar styles applied to DOM');
    } catch (error) {
      console.error('Error applying custom bar styles to DOM:', error);
    }
  }

  /**
   * Evaluate style rules for a task
   */
  evaluateStyleRules(task: any, rules: StyleRule[]): string | null {
    // Sort rules by priority (highest first)
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
    
    for (const rule of sortedRules) {
      if (this.matchesRule(task, rule)) {
        return rule.styleId;
      }
    }
    
    return null; // No matching rule
  }

  /**
   * Check if a task matches a style rule
   */
  private matchesRule(task: any, rule: StyleRule): boolean {
    const fieldValue = this.getFieldValue(task, rule.field);
    
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
      case 'contains':
        return fieldValue.toLowerCase().includes(rule.value.toLowerCase());
      case 'starts_with':
        return fieldValue.toLowerCase().startsWith(rule.value.toLowerCase());
      case 'ends_with':
        return fieldValue.toLowerCase().endsWith(rule.value.toLowerCase());
      case 'greater_than':
        return parseFloat(fieldValue) > parseFloat(rule.value);
      case 'less_than':
        return parseFloat(fieldValue) < parseFloat(rule.value);
      default:
        return false;
    }
  }

  /**
   * Get field value from task object
   */
  private getFieldValue(task: any, field: string): string {
    switch (field) {
      case 'name':
        return task.name || '';
      case 'type':
        return task.type || '';
      case 'status':
        return task.status || '';
      case 'tag':
        return task.tag || '';
      case 'assignee':
        return task.assignee || '';
      case 'priority':
        return task.priority || '';
      default:
        return task[field] || '';
    }
  }

  /**
   * Get pattern label
   */
  getPatternLabel(pattern: string): string {
    const labels = {
      solid: 'Solid',
      dashed: 'Dashed',
      dotted: 'Dotted',
      gradient: 'Gradient'
    };
    return labels[pattern as keyof typeof labels] || pattern;
  }

  /**
   * Get pattern description
   */
  getPatternDescription(pattern: string): string {
    const descriptions = {
      solid: 'Solid fill',
      dashed: 'Dashed border pattern',
      dotted: 'Dotted border pattern',
      gradient: 'Gradient fill'
    };
    return descriptions[pattern as keyof typeof descriptions] || pattern;
  }

  /**
   * Get operator label
   */
  getOperatorLabel(operator: string): string {
    const labels = {
      equals: 'Equals',
      contains: 'Contains',
      starts_with: 'Starts with',
      ends_with: 'Ends with',
      greater_than: 'Greater than',
      less_than: 'Less than'
    };
    return labels[operator as keyof typeof labels] || operator;
  }

  /**
   * Get operator description
   */
  getOperatorDescription(operator: string): string {
    const descriptions = {
      equals: 'Exact match',
      contains: 'Contains text',
      starts_with: 'Begins with text',
      ends_with: 'Ends with text',
      greater_than: 'Greater than value',
      less_than: 'Less than value'
    };
    return descriptions[operator as keyof typeof descriptions] || operator;
  }

  /**
   * Validate bar style
   */
  validateBarStyle(style: BarStyle): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];
    
    // Validate name
    if (!style.name.trim()) {
      errors.push('Style name is required');
    }
    
    // Validate colors
    if (!style.fill.match(/^#[0-9A-F]{6}$/i)) {
      errors.push('Invalid fill color format');
    }
    
    if (!style.border.match(/^#[0-9A-F]{6}$/i)) {
      errors.push('Invalid border color format');
    }
    
    // Validate pattern
    if (!['solid', 'dashed', 'dotted', 'gradient'].includes(style.pattern)) {
      errors.push('Invalid pattern option');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate style rule
   */
  validateStyleRule(rule: StyleRule): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];
    
    // Validate name
    if (!rule.name.trim()) {
      errors.push('Rule name is required');
    }
    
    // Validate field
    if (!['name', 'type', 'status', 'tag', 'assignee', 'priority'].includes(rule.field)) {
      errors.push('Invalid field option');
    }
    
    // Validate operator
    if (!['equals', 'contains', 'starts_with', 'ends_with', 'greater_than', 'less_than'].includes(rule.operator)) {
      errors.push('Invalid operator option');
    }
    
    // Validate value
    if (!rule.value.trim()) {
      errors.push('Rule value is required');
    }
    
    // Validate style ID
    if (!rule.styleId) {
      errors.push('Style must be selected');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get preview HTML for custom bar styles
   */
  getCustomBarStylesPreview(styles: BarStyle[], rules: StyleRule[]): string {
    return `
      <div class="custom-bar-styles-preview" style="
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        background-color: white;
        margin: 8px 0;
        overflow: hidden;
      ">
        <div style="
          padding: 8px 12px;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 500;
          font-size: 12px;
          color: #374151;
        ">
          Custom Bar Styles Preview - ${styles.length} styles, ${rules.length} rules
        </div>
        <div style="padding: 12px;">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${styles.map(style => `
              <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
              ">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="
                    width: 24px;
                    height: 12px;
                    border-radius: 2px;
                    background-color: ${style.fill};
                    border: 1px solid ${style.border};
                    ${style.pattern === 'dashed' ? 'border-style: dashed;' : ''}
                    ${style.pattern === 'dotted' ? 'border-style: dotted;' : ''}
                    ${style.pattern === 'gradient' ? `background: linear-gradient(45deg, ${style.fill}, ${style.border});` : ''}
                  "></div>
                  <span style="font-size: 12px; font-weight: 500;">${style.name}</span>
                </div>
                <span style="font-size: 10px; color: #6b7280;">${style.pattern}</span>
              </div>
            `).join('')}
          </div>
          
          ${rules.length > 0 ? `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
              <div style="font-size: 11px; font-weight: 500; margin-bottom: 8px; color: #374151;">
                Active Rules (${rules.length})
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${rules.map(rule => `
                  <div style="
                    font-size: 10px;
                    color: #6b7280;
                    padding: 4px 8px;
                    background-color: #f3f4f6;
                    border-radius: 3px;
                  ">
                    ${rule.name}: ${rule.field} ${rule.operator} "${rule.value}"
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Export custom bar styles as CSS
   */
  exportCustomBarStylesAsCSS(styles: BarStyle[], rules: StyleRule[]): string {
    return `/* ConstructBMS Custom Bar Styles */
${this.generateCustomBarStylesCSS(styles, rules)}

/* Usage Examples */
.gantt-task-bar[data-style="custom"] {
  /* Apply custom style */
}

/* Custom Variables */
:root {
  --custom-styles-count: ${styles.length};
  --custom-rules-count: ${rules.length};
}

/* Style Application */
.gantt-task-bar {
  /* Default style */
}

/* Custom style overrides */
${styles.map(style => `
.gantt-task-bar[data-style="${style.id}"] {
  background-color: ${style.fill};
  border-color: ${style.border};
  ${style.pattern === 'dashed' ? 'border-style: dashed;' : ''}
  ${style.pattern === 'dotted' ? 'border-style: dotted;' : ''}
  ${style.pattern === 'gradient' ? `background: linear-gradient(45deg, ${style.fill}, ${style.border});` : ''}
}
`).join('')}
`;
  }

  /**
   * Reset custom bar styles to defaults
   */
  async resetCustomBarStyles(projectId: string): Promise<void> {
    try {
      await persistentStorage.set(`${this.stylesKey}_${projectId}`, this.defaultBarStyles);
      await persistentStorage.set(`${this.rulesKey}_${projectId}`, []);
      console.log('Custom bar styles reset to defaults for project:', projectId);
    } catch (error) {
      console.error('Error resetting custom bar styles:', error);
      throw error;
    }
  }

  /**
   * Clear all custom bar styles settings
   */
  async clearAllCustomBarStylesSettings(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All custom bar styles settings cleared');
    } catch (error) {
      console.error('Error clearing custom bar styles settings:', error);
      throw error;
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const config = await this.getConfig();
      if (config.demo) {
        await this.clearAllCustomBarStylesSettings();
        await this.updateConfig({ demo: false });
        console.log('Demo custom bar styles data reset');
      }
    } catch (error) {
      console.error('Error resetting demo custom bar styles data:', error);
      throw error;
    }
  }
}

export const customBarStylesService = new CustomBarStylesService(); 