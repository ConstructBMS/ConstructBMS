import { demoModeService } from './demoModeService';

export interface TaskColorRule {
  color: string;
  description: string;
  id: string;
  label: string;
  priority: number;
  type: 'custom' | 'tag' | 'status' | 'default';
}

export interface TaskStatus {
  color: string;
  demo?: boolean;
  id: string;
  name: string;
}

export interface TaskTag {
  color: string;
  demo?: boolean;
  id: string;
  name: string;
}

export interface TaskColorInfo {
  color: string;
  rule: TaskColorRule;
  source: 'custom' | 'tag' | 'status' | 'default';
}

class TaskBarColorService {
  private readonly defaultColors = {
    task: 'bg-slate-400',
    milestone: 'bg-fuchsia-500',
    phase: 'bg-gray-700',
  };

  private readonly statusColors: Record<string, string> = {
    'not-started': 'bg-gray-400',
    'in-progress': 'bg-blue-500',
    completed: 'bg-green-500',
    'on-hold': 'bg-yellow-500',
    cancelled: 'bg-red-500',
  };

  /**
   * Get task bar color based on priority rules
   */
  getTaskBarColor(
    task: any,
    taskStatuses: TaskStatus[],
    taskTags: TaskTag[]
  ): TaskColorInfo {
    // Priority 1: Custom color override
    if (task.customColor) {
      return {
        color: task.customColor,
        rule: {
          id: 'custom',
          type: 'custom',
          color: task.customColor,
          label: 'Custom Color',
          description: 'User-defined custom color',
          priority: 1,
        },
        source: 'custom',
      };
    }

    // Priority 2: Tag color (first tag with color)
    if (task.tags && Array.isArray(task.tags) && task.tags.length > 0) {
      for (const tagId of task.tags) {
        const tag = taskTags.find(t => t.id === tagId);
        if (tag && tag.color) {
          return {
            color: tag.color,
            rule: {
              id: `tag-${tag.id}`,
              type: 'tag',
              color: tag.color,
              label: `${tag.name} (Tag)`,
              description: `Color from tag: ${tag.name}`,
              priority: 2,
            },
            source: 'tag',
          };
        }
      }
    }

    // Priority 3: Status color
    if (task.statusId) {
      const status = taskStatuses.find(s => s.id === task.statusId);
      if (status && status.color) {
        return {
          color: status.color,
          rule: {
            id: `status-${status.id}`,
            type: 'status',
            color: status.color,
            label: status.name,
            description: `Color from status: ${status.name}`,
            priority: 3,
          },
          source: 'status',
        };
      }
    }

    // Priority 4: Default type color
    const defaultColor =
      this.defaultColors[task.type as keyof typeof this.defaultColors] ||
      this.defaultColors.task;
    return {
      color: defaultColor,
      rule: {
        id: `default-${task.type}`,
        type: 'default',
        color: defaultColor,
        label: `${task.type} (Default)`,
        description: `Default color for ${task.type} type`,
        priority: 4,
      },
      source: 'default',
    };
  }

  /**
   * Get baseline bar color (lighter shade of task color)
   */
  getBaselineBarColor(taskColor: string): string {
    // Convert task color to lighter shade for baseline
    if (taskColor.startsWith('bg-')) {
      const colorName = taskColor.replace('bg-', '');
      const colorParts = colorName.split('-');

      if (colorParts.length === 2) {
        const [color, shade] = colorParts;
        const shadeNum = parseInt(shade);

        // Make it lighter by reducing shade number
        const lighterShade = Math.max(100, shadeNum - 200);
        return `bg-${color}-${lighterShade}`;
      }
    }

    // Fallback to a light gray
    return 'bg-gray-200';
  }

  /**
   * Get all color rules for legend
   */
  getAllColorRules(
    taskStatuses: TaskStatus[],
    taskTags: TaskTag[]
  ): TaskColorRule[] {
    const rules: TaskColorRule[] = [];

    // Add default type colors
    Object.entries(this.defaultColors).forEach(([type, color]) => {
      rules.push({
        id: `default-${type}`,
        type: 'default',
        color,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} (Default)`,
        description: `Default color for ${type} type`,
        priority: 4,
      });
    });

    // Add status colors
    taskStatuses.forEach(status => {
      if (status.color) {
        rules.push({
          id: `status-${status.id}`,
          type: 'status',
          color: status.color,
          label: status.name,
          description: `Color from status: ${status.name}`,
          priority: 3,
        });
      }
    });

    // Add tag colors
    taskTags.forEach(tag => {
      if (tag.color) {
        rules.push({
          id: `tag-${tag.id}`,
          type: 'tag',
          color: tag.color,
          label: `${tag.name} (Tag)`,
          description: `Color from tag: ${tag.name}`,
          priority: 2,
        });
      }
    });

    // Add custom color rule
    rules.push({
      id: 'custom',
      type: 'custom',
      color: '#6366f1', // Example custom color
      label: 'Custom Color',
      description: 'User-defined custom color (highest priority)',
      priority: 1,
    });

    // Sort by priority
    return rules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Validate custom color
   */
  validateCustomColor(color: string): { error?: string; isValid: boolean } {
    // Check if it's a valid hex color
    if (color.startsWith('#')) {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexRegex.test(color)) {
        return { isValid: false, error: 'Invalid hex color format' };
      }
      return { isValid: true };
    }

    // Check if it's a valid Tailwind class
    if (color.startsWith('bg-')) {
      const tailwindColors = [
        'slate',
        'gray',
        'zinc',
        'neutral',
        'stone',
        'red',
        'orange',
        'amber',
        'yellow',
        'lime',
        'green',
        'emerald',
        'teal',
        'cyan',
        'sky',
        'blue',
        'indigo',
        'violet',
        'purple',
        'fuchsia',
        'pink',
        'rose',
      ];

      const colorName = color.replace('bg-', '').split('-')[0];
      if (!tailwindColors.includes(colorName)) {
        return { isValid: false, error: 'Invalid Tailwind color name' };
      }
      return { isValid: true };
    }

    return {
      isValid: false,
      error: 'Color must be hex (#RRGGBB) or Tailwind class (bg-color-shade)',
    };
  }

  /**
   * Get color priority description
   */
  getColorPriorityDescription(): string {
    return `Color Priority Rules:
1. Custom Color Override (highest priority)
2. Tag Color (first tag with color)
3. Status Color (based on task status)
4. Type Default Color (lowest priority)`;
  }

  /**
   * Get demo mode restrictions
   */
  getDemoModeRestrictions(): string[] {
    return [
      'Maximum 1 tag with color per task',
      'Custom colors not allowed',
      'All colors from demo tags/statuses only',
      'Legend shows "DEMO MODE" label',
    ];
  }

  /**
   * Check if task has valid color configuration for demo mode
   */
  async validateTaskColorForDemoMode(
    task: any
  ): Promise<{ error?: string; isValid: boolean }> {
    const isDemoMode = await demoModeService.getDemoMode();

    if (!isDemoMode) {
      return { isValid: true };
    }

    // Check for custom color (not allowed in demo)
    if (task.customColor) {
      return {
        isValid: false,
        error: 'Custom colors not allowed in demo mode',
      };
    }

    // Check for multiple colored tags (max 1 in demo)
    if (task.tags && Array.isArray(task.tags) && task.tags.length > 1) {
      return {
        isValid: false,
        error: 'Maximum 1 tag with color allowed in demo mode',
      };
    }

    return { isValid: true };
  }

  /**
   * Get color display name
   */
  getColorDisplayName(color: string): string {
    if (color.startsWith('bg-')) {
      const colorName = color.replace('bg-', '').split('-')[0];
      return colorName.charAt(0).toUpperCase() + colorName.slice(1);
    }

    if (color.startsWith('#')) {
      return 'Custom Color';
    }

    return color;
  }

  /**
   * Get color description
   */
  getColorDescription(color: string): string {
    if (color.startsWith('bg-')) {
      const parts = color.replace('bg-', '').split('-');
      if (parts.length === 2) {
        const [colorName, shade] = parts;
        return `${colorName.charAt(0).toUpperCase() + colorName.slice(1)} shade ${shade}`;
      }
      return color.replace('bg-', '');
    }

    if (color.startsWith('#')) {
      return 'Custom hex color';
    }

    return 'Unknown color format';
  }

  /**
   * Get all available Tailwind colors
   */
  getAvailableTailwindColors(): Array<{
    class: string;
    name: string;
    shades: string[];
  }> {
    return [
      { name: 'Slate', class: 'slate', shades: ['400', '500', '600', '700'] },
      { name: 'Gray', class: 'gray', shades: ['400', '500', '600', '700'] },
      { name: 'Red', class: 'red', shades: ['400', '500', '600', '700'] },
      { name: 'Orange', class: 'orange', shades: ['400', '500', '600', '700'] },
      { name: 'Yellow', class: 'yellow', shades: ['400', '500', '600', '700'] },
      { name: 'Green', class: 'green', shades: ['400', '500', '600', '700'] },
      { name: 'Blue', class: 'blue', shades: ['400', '500', '600', '700'] },
      { name: 'Purple', class: 'purple', shades: ['400', '500', '600', '700'] },
      { name: 'Pink', class: 'pink', shades: ['400', '500', '600', '700'] },
      {
        name: 'Fuchsia',
        class: 'fuchsia',
        shades: ['400', '500', '600', '700'],
      },
      { name: 'Indigo', class: 'indigo', shades: ['400', '500', '600', '700'] },
      { name: 'Teal', class: 'teal', shades: ['400', '500', '600', '700'] },
    ];
  }
}

export const taskBarColorService = new TaskBarColorService();
