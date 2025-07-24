import { persistentStorage } from './persistentStorage';
import { demoModeService } from './demoModeService';

export interface RibbonAuditResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  details: {
    tabs: TabAuditResult[];
    permissions: PermissionAuditResult[];
    storage: StorageAuditResult;
    demoMode: DemoModeAuditResult;
    localStorage: LocalStorageAuditResult;
  };
}

export interface TabAuditResult {
  tabId: string;
  label: string;
  visible: boolean;
  permissionRequired?: string;
  permissionGranted: boolean;
  sections: SectionAuditResult[];
  errors: string[];
}

export interface SectionAuditResult {
  sectionId: string;
  label: string;
  visible: boolean;
  tools: ToolAuditResult[];
  errors: string[];
}

export interface ToolAuditResult {
  toolId: string;
  label: string;
  type: 'button' | 'dropdown' | 'toggle' | 'modal';
  enabled: boolean;
  permissionRequired?: string;
  permissionGranted: boolean;
  demoModeRestricted: boolean;
  errors: string[];
}

export interface PermissionAuditResult {
  permission: string;
  granted: boolean;
  requiredBy: string[];
}

export interface StorageAuditResult {
  supabaseTables: {
    table: string;
    accessible: boolean;
    hasData: boolean;
    demoDataCount: number;
  }[];
  localStorageUsage: {
    found: boolean;
    keys: string[];
  };
  errors: string[];
}

export interface DemoModeAuditResult {
  isDemoMode: boolean;
  restrictions: {
    maxTags: number;
    maxStatuses: number;
    maxThemes: number;
    maxCustomFields: number;
    importDisabled: boolean;
    syncDisabled: boolean;
    exportWatermarked: boolean;
  };
  violations: string[];
}

export interface LocalStorageAuditResult {
  found: boolean;
  keys: string[];
  violations: string[];
}

class RibbonAuditService {
  private readonly requiredSupabaseTables = [
    'programme_settings',
    'timeline_settings',
    'project_tags',
    'task_statuses',
    'custom_fields',
    'bar_styles',
    'style_rules',
    'export_settings',
    'sync_logs',
    'project_properties'
  ];

  private readonly ribbonTabs = [
    { id: 'file', label: 'File', permission: 'programme.save' },
    { id: 'home', label: 'Home' },
    { id: 'project', label: 'Project' },
    { id: 'view', label: 'View' },
    { id: 'allocation', label: 'Allocation' },
    { id: '4d', label: '4D' },
    { id: 'format', label: 'Format', permission: 'programme.format.view' },
    { id: 'admin', label: 'Admin', permission: 'programme.admin.manage' }
  ];

  private readonly formatSections = [
    { id: 'critical-path', label: 'Critical Path Highlighting', permission: 'programme.format.view' },
    { id: 'milestone-styling', label: 'Milestone Styling', permission: 'programme.format.edit' },
    { id: 'gantt-zoom-scale', label: 'Gantt Zoom & Scale', permission: 'programme.format.view' },
    { id: 'task-row-styling', label: 'Task Row Styling', permission: 'programme.format.edit' },
    { id: 'grid-column-controls', label: 'Grid Column Controls', permission: 'programme.format.edit' },
    { id: 'timeline-gridlines-markers', label: 'Timeline Gridlines & Markers', permission: 'programme.format.edit' },
    { id: 'print-export-styling', label: 'Print/Export Styling', permission: 'programme.export.view' },
    { id: 'custom-bar-styles', label: 'Custom Bar Styles', permission: 'programme.format.edit' }
  ];

  private readonly fileSections = [
    { id: 'project-save', label: 'Project Save', permission: 'programme.save' },
    { id: 'import-export', label: 'Import & Export', permission: 'programme.save' },
    { id: 'two-way-sync', label: '2-Way Sync', permission: 'programme.import' },
    { id: 'project-metadata', label: 'Project Metadata', permission: 'programme.admin' }
  ];

  private readonly adminSections = [
    { id: 'tags-labels', label: 'Tags & Labels', permission: 'programme.admin.manage' },
    { id: 'task-statuses', label: 'Task Statuses', permission: 'programme.admin.manage' },
    { id: 'theme-config', label: 'Theme Config', permission: 'programme.admin.manage' },
    { id: 'custom-fields', label: 'Custom Fields', permission: 'programme.admin.manage' }
  ];

  /**
   * Perform comprehensive ribbon audit
   */
  async performAudit(): Promise<RibbonAuditResult> {
    const result: RibbonAuditResult = {
      success: true,
      errors: [],
      warnings: [],
      details: {
        tabs: [],
        permissions: [],
        storage: { supabaseTables: [], localStorageUsage: { found: false, keys: [] }, errors: [] },
        demoMode: { isDemoMode: false, restrictions: {}, violations: [] },
        localStorage: { found: false, keys: [], violations: [] }
      }
    };

    try {
      // Audit tabs
      result.details.tabs = await this.auditTabs();
      
      // Audit permissions
      result.details.permissions = await this.auditPermissions();
      
      // Audit storage
      result.details.storage = await this.auditStorage();
      
      // Audit demo mode
      result.details.demoMode = await this.auditDemoMode();
      
      // Audit localStorage usage
      result.details.localStorage = await this.auditLocalStorage();

      // Compile errors and warnings
      this.compileAuditResults(result);
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Audit failed: ${error}`);
    }

    return result;
  }

  /**
   * Audit ribbon tabs
   */
  private async auditTabs(): Promise<TabAuditResult[]> {
    const results: TabAuditResult[] = [];

    for (const tab of this.ribbonTabs) {
      const result: TabAuditResult = {
        tabId: tab.id,
        label: tab.label,
        visible: true,
        permissionRequired: tab.permission,
        permissionGranted: !tab.permission || await this.checkPermission(tab.permission),
        sections: [],
        errors: []
      };

      // Audit sections based on tab
      switch (tab.id) {
        case 'format':
          result.sections = await this.auditFormatSections();
          break;
        case 'file':
          result.sections = await this.auditFileSections();
          break;
        case 'admin':
          result.sections = await this.auditAdminSections();
          break;
        default:
          result.sections = [];
      }

      results.push(result);
    }

    return results;
  }

  /**
   * Audit Format tab sections
   */
  private async auditFormatSections(): Promise<SectionAuditResult[]> {
    const results: SectionAuditResult[] = [];

    for (const section of this.formatSections) {
      const result: SectionAuditResult = {
        sectionId: section.id,
        label: section.label,
        visible: true,
        tools: [],
        errors: []
      };

      // Define tools for each section
      switch (section.id) {
        case 'critical-path':
          result.tools = [
            { toolId: 'critical-path-toggle', label: 'Critical Path Toggle', type: 'toggle', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] },
            { toolId: 'critical-path-color', label: 'Critical Path Color', type: 'dropdown', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] },
            { toolId: 'critical-path-legend', label: 'Critical Path Legend', type: 'button', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: false, errors: [] }
          ];
          break;
        case 'milestone-styling':
          result.tools = [
            { toolId: 'milestone-icon', label: 'Milestone Icon', type: 'dropdown', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] },
            { toolId: 'milestone-color', label: 'Milestone Color', type: 'dropdown', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] },
            { toolId: 'milestone-label', label: 'Milestone Label', type: 'toggle', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] }
          ];
          break;
        // Add other sections...
      }

      results.push(result);
    }

    return results;
  }

  /**
   * Audit File tab sections
   */
  private async auditFileSections(): Promise<SectionAuditResult[]> {
    const results: SectionAuditResult[] = [];

    for (const section of this.fileSections) {
      const result: SectionAuditResult = {
        sectionId: section.id,
        label: section.label,
        visible: true,
        tools: [],
        errors: []
      };

      // Define tools for each section
      switch (section.id) {
        case 'project-save':
          result.tools = [
            { toolId: 'save-changes', label: 'Save Changes', type: 'button', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: false, errors: [] },
            { toolId: 'save-as-template', label: 'Save As Template', type: 'button', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: false, errors: [] },
            { toolId: 'auto-save-toggle', label: 'Auto-Save Toggle', type: 'toggle', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] }
          ];
          break;
        case 'import-export':
          result.tools = [
            { toolId: 'import-project', label: 'Import Project', type: 'modal', enabled: true, permissionRequired: 'programme.import', permissionGranted: await this.checkPermission('programme.import'), demoModeRestricted: true, errors: [] },
            { toolId: 'export-pdf', label: 'Export as PDF', type: 'button', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] },
            { toolId: 'export-csv', label: 'Export as CSV', type: 'button', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] },
            { toolId: 'export-image', label: 'Export as Image', type: 'button', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] }
          ];
          break;
        // Add other sections...
      }

      results.push(result);
    }

    return results;
  }

  /**
   * Audit Admin tab sections
   */
  private async auditAdminSections(): Promise<SectionAuditResult[]> {
    const results: SectionAuditResult[] = [];

    for (const section of this.adminSections) {
      const result: SectionAuditResult = {
        sectionId: section.id,
        label: section.label,
        visible: true,
        tools: [],
        errors: []
      };

      // Define tools for each section
      switch (section.id) {
        case 'tags-labels':
          result.tools = [
            { toolId: 'manage-tags', label: 'Manage Tags', type: 'modal', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] },
            { toolId: 'color-palette', label: 'Colour Palette', type: 'dropdown', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] }
          ];
          break;
        case 'task-statuses':
          result.tools = [
            { toolId: 'edit-status-list', label: 'Edit Status List', type: 'modal', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] },
            { toolId: 'set-default-status', label: 'Set Default Status', type: 'dropdown', enabled: true, permissionRequired: section.permission, permissionGranted: await this.checkPermission(section.permission), demoModeRestricted: true, errors: [] }
          ];
          break;
        // Add other sections...
      }

      results.push(result);
    }

    return results;
  }

  /**
   * Audit permissions
   */
  private async auditPermissions(): Promise<PermissionAuditResult[]> {
    const permissions = [
      'programme.save',
      'programme.import',
      'programme.export.view',
      'programme.format.view',
      'programme.format.edit',
      'programme.admin',
      'programme.admin.manage'
    ];

    const results: PermissionAuditResult[] = [];

    for (const permission of permissions) {
      const granted = await this.checkPermission(permission);
      const requiredBy = this.findPermissionUsage(permission);
      
      results.push({
        permission,
        granted,
        requiredBy
      });
    }

    return results;
  }

  /**
   * Audit storage
   */
  private async auditStorage(): Promise<StorageAuditResult> {
    const result: StorageAuditResult = {
      supabaseTables: [],
      localStorageUsage: { found: false, keys: [] },
      errors: []
    };

    // Check Supabase tables
    for (const table of this.requiredSupabaseTables) {
      try {
        const accessible = await this.checkSupabaseTableAccess(table);
        const hasData = await this.checkSupabaseTableHasData(table);
        const demoDataCount = await this.countDemoDataInTable(table);
        
        result.supabaseTables.push({
          table,
          accessible,
          hasData,
          demoDataCount
        });
      } catch (error) {
        result.errors.push(`Error checking table ${table}: ${error}`);
      }
    }

    // Check localStorage usage
    result.localStorageUsage = await this.checkLocalStorageUsage();

    return result;
  }

  /**
   * Audit demo mode
   */
  private async auditDemoMode(): Promise<DemoModeAuditResult> {
    const isDemoMode = await demoModeService.isDemoMode();
    
    const result: DemoModeAuditResult = {
      isDemoMode,
      restrictions: {
        maxTags: isDemoMode ? 3 : 20,
        maxStatuses: isDemoMode ? 3 : 10,
        maxThemes: isDemoMode ? 1 : 5,
        maxCustomFields: isDemoMode ? 2 : 15,
        importDisabled: isDemoMode,
        syncDisabled: isDemoMode,
        exportWatermarked: isDemoMode
      },
      violations: []
    };

    // Check for demo mode violations
    if (isDemoMode) {
      const violations = await this.checkDemoModeViolations();
      result.violations = violations;
    }

    return result;
  }

  /**
   * Audit localStorage usage
   */
  private async auditLocalStorageUsage(): Promise<LocalStorageAuditResult> {
    const result: LocalStorageAuditResult = {
      found: false,
      keys: [],
      violations: []
    };

    try {
      // Check if localStorage is being used
      const localStorageKeys = Object.keys(localStorage);
      const ribbonRelatedKeys = localStorageKeys.filter(key => 
        key.includes('ribbon') || 
        key.includes('programme') || 
        key.includes('gantt') || 
        key.includes('format') ||
        key.includes('admin') ||
        key.includes('file')
      );

      if (ribbonRelatedKeys.length > 0) {
        result.found = true;
        result.keys = ribbonRelatedKeys;
        result.violations.push('localStorage usage detected - should use Supabase instead');
      }
    } catch (error) {
      result.violations.push(`Error checking localStorage: ${error}`);
    }

    return result;
  }

  /**
   * Check permission (mock implementation)
   */
  private async checkPermission(permission: string): Promise<boolean> {
    // This would integrate with the actual permission system
    // For now, return true for testing
    return true;
  }

  /**
   * Find where a permission is used
   */
  private findPermissionUsage(permission: string): string[] {
    const usage: string[] = [];
    
    // Check tabs
    for (const tab of this.ribbonTabs) {
      if (tab.permission === permission) {
        usage.push(`Tab: ${tab.label}`);
      }
    }

    // Check sections
    for (const section of [...this.formatSections, ...this.fileSections, ...this.adminSections]) {
      if (section.permission === permission) {
        usage.push(`Section: ${section.label}`);
      }
    }

    return usage;
  }

  /**
   * Check Supabase table access
   */
  private async checkSupabaseTableAccess(table: string): Promise<boolean> {
    try {
      // This would check if the table exists and is accessible
      // For now, return true for testing
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if Supabase table has data
   */
  private async checkSupabaseTableHasData(table: string): Promise<boolean> {
    try {
      // This would check if the table has any data
      // For now, return false for testing
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Count demo data in table
   */
  private async countDemoDataInTable(table: string): Promise<number> {
    try {
      // This would count records with demo: true
      // For now, return 0 for testing
      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check localStorage usage
   */
  private async checkLocalStorageUsage(): Promise<{ found: boolean; keys: string[] }> {
    try {
      const keys = Object.keys(localStorage);
      const ribbonKeys = keys.filter(key => 
        key.includes('ribbon') || 
        key.includes('programme') || 
        key.includes('gantt')
      );
      
      return {
        found: ribbonKeys.length > 0,
        keys: ribbonKeys
      };
    } catch (error) {
      return { found: false, keys: [] };
    }
  }

  /**
   * Check demo mode violations
   */
  private async checkDemoModeViolations(): Promise<string[]> {
    const violations: string[] = [];
    
    // Check for violations of demo mode restrictions
    // This would check actual data against demo limits
    
    return violations;
  }

  /**
   * Compile audit results
   */
  private compileAuditResults(result: RibbonAuditResult): void {
    // Check for errors in tabs
    for (const tab of result.details.tabs) {
      if (tab.errors.length > 0) {
        result.errors.push(`Tab ${tab.label}: ${tab.errors.join(', ')}`);
      }
      
      for (const section of tab.sections) {
        if (section.errors.length > 0) {
          result.errors.push(`Section ${section.label}: ${section.errors.join(', ')}`);
        }
        
        for (const tool of section.tools) {
          if (tool.errors.length > 0) {
            result.errors.push(`Tool ${tool.label}: ${tool.errors.join(', ')}`);
          }
        }
      }
    }

    // Check for permission issues
    const permissionIssues = result.details.permissions.filter(p => !p.granted);
    if (permissionIssues.length > 0) {
      result.warnings.push(`Permission issues: ${permissionIssues.map(p => p.permission).join(', ')}`);
    }

    // Check for storage issues
    if (result.details.storage.errors.length > 0) {
      result.errors.push(`Storage issues: ${result.details.storage.errors.join(', ')}`);
    }

    // Check for localStorage violations
    if (result.details.localStorage.found) {
      result.errors.push(`localStorage usage detected: ${result.details.localStorage.keys.join(', ')}`);
    }

    // Check for demo mode violations
    if (result.details.demoMode.violations.length > 0) {
      result.warnings.push(`Demo mode violations: ${result.details.demoMode.violations.join(', ')}`);
    }

    // Set overall success
    result.success = result.errors.length === 0;
  }

  /**
   * Generate audit report
   */
  async generateAuditReport(): Promise<string> {
    const audit = await this.performAudit();
    
    let report = `# Ribbon System Audit Report\n\n`;
    report += `**Overall Status:** ${audit.success ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    if (audit.errors.length > 0) {
      report += `## Errors\n`;
      audit.errors.forEach(error => {
        report += `- ❌ ${error}\n`;
      });
      report += `\n`;
    }
    
    if (audit.warnings.length > 0) {
      report += `## Warnings\n`;
      audit.warnings.forEach(warning => {
        report += `- ⚠️ ${warning}\n`;
      });
      report += `\n`;
    }
    
    report += `## Tab Status\n`;
    for (const tab of audit.details.tabs) {
      const status = tab.errors.length === 0 ? '✅' : '❌';
      report += `${status} **${tab.label}** (${tab.sections.length} sections)\n`;
    }
    
    report += `\n## Demo Mode\n`;
    report += `- **Active:** ${audit.details.demoMode.isDemoMode ? 'Yes' : 'No'}\n`;
    if (audit.details.demoMode.isDemoMode) {
      report += `- **Restrictions:** ${JSON.stringify(audit.details.demoMode.restrictions, null, 2)}\n`;
    }
    
    report += `\n## Storage\n`;
    report += `- **Supabase Tables:** ${audit.details.storage.supabaseTables.length}\n`;
    report += `- **localStorage Usage:** ${audit.details.localStorage.found ? '❌ Found' : '✅ None'}\n`;
    
    return report;
  }
}

export const ribbonAuditService = new RibbonAuditService(); 