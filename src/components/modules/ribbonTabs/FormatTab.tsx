import React from 'react';
import {
  PaintBrushIcon,
  SwatchIcon,
  DocumentTextIcon,
  ArrowsPointingOutIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
  CogIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import type { RibbonTab } from '../GanttRibbon';

// Types for format operations
export interface FormatOperation {
  type: 'bar-coloring' | 'font-settings' | 'bar-height' | 'milestone-style' | 'float-style' | 'save-preferences' | 'display-options' | 'advanced-formatting';
  data?: any;
}

// Bar coloring options
export interface BarColoringOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  colors?: {
    critical: string;
    normal: string;
    completed: string;
    delayed: string;
  };
}

// Font options
export interface FontOption {
  id: string;
  label: string;
  family: string;
  size: number;
  preview: string;
}

// Format state interface
export interface FormatState {
  barColoring: string; // 'critical' | 'status' | 'resource'
  fontFamily: string;
  fontSize: number;
  barHeight: number;
  showMilestoneAsDiamond: boolean;
  showFloatAsTrail: boolean;
  customColors?: {
    critical: string;
    normal: string;
    completed: string;
    delayed: string;
    resource1: string;
    resource2: string;
    resource3: string;
  };
}

interface FormatTabProps {
  onFormatOperation: (operation: FormatOperation) => void;
  userRole: string;
  currentFormatState?: FormatState;
  onFormatStateChange?: (newState: Partial<FormatState>) => void;
}

const useFormatTab = (
  onFormatOperation: (operation: FormatOperation) => void,
  userRole: string,
  currentFormatState?: FormatState,
  onFormatStateChange?: (newState: Partial<FormatState>) => void
): RibbonTab => {
  // Check if user can perform actions (not viewer)
  const isViewer = userRole === 'viewer';
  const canEdit = userRole !== 'viewer';

  // Mock icons for missing ones
  const DiamondIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );

  const PaletteIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
    </svg>
  );

  const FontFamilyIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );

  // Bar coloring options
  const barColoringOptions: BarColoringOption[] = [
    {
      id: 'critical',
      label: 'Critical',
      description: 'Color bars by critical path status',
      icon: SwatchIcon,
      colors: {
        critical: '#ef4444', // red-500
        normal: '#3b82f6',   // blue-500
        completed: '#10b981', // emerald-500
        delayed: '#f59e0b'   // amber-500
      }
    },
    {
      id: 'status',
      label: 'By Status',
      description: 'Color bars by task status',
      icon: ChartBarIcon,
      colors: {
        critical: '#dc2626', // red-600
        normal: '#2563eb',   // blue-600
        completed: '#059669', // emerald-600
        delayed: '#d97706'   // amber-600
      }
    },
    {
      id: 'resource',
      label: 'By Resource',
      description: 'Color bars by assigned resource',
      icon: PaletteIcon,
      colors: {
        critical: '#7c3aed', // violet-600
        normal: '#0891b2',   // cyan-600
        completed: '#16a34a', // green-600
        delayed: '#ea580c'   // orange-600
      }
    }
  ];

  // Font options
  const fontOptions: FontOption[] = [
    { id: 'arial', label: 'Arial', family: 'Arial, sans-serif', size: 12, preview: 'Aa' },
    { id: 'calibri', label: 'Calibri', family: 'Calibri, sans-serif', size: 12, preview: 'Aa' },
    { id: 'times', label: 'Times New Roman', family: 'Times New Roman, serif', size: 12, preview: 'Aa' },
    { id: 'verdana', label: 'Verdana', family: 'Verdana, sans-serif', size: 12, preview: 'Aa' },
    { id: 'tahoma', label: 'Tahoma', family: 'Tahoma, sans-serif', size: 12, preview: 'Aa' }
  ];

  // Font size options
  const fontSizeOptions = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32];

  // Bar height options
  const barHeightOptions = [12, 16, 20, 24, 28, 32, 36, 40];

  // Create ribbon tab configuration
  const formatTab: RibbonTab = {
    id: 'format',
    label: 'Format',
    icon: PaintBrushIcon,
    groups: [
      // Bar Styling Group
      {
        id: 'bar-styling',
        title: 'Bar Styling',
        buttons: [
          {
            id: 'bar-coloring',
            label: 'Bar Colouring',
            icon: SwatchIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit,
            tooltip: 'Set bar coloring scheme',
            dropdownItems: barColoringOptions.map(option => ({
              id: option.id,
              label: option.label,
              icon: option.icon,
              action: () => {
                onFormatOperation({ 
                  type: 'bar-coloring', 
                  data: { 
                    scheme: option.id,
                    colors: option.colors 
                  } 
                });
                onFormatStateChange?.({ barColoring: option.id });
              },
              disabled: false,
              separator: false
            })) as any
          },
          {
            id: 'bar-height',
            label: 'Bar Height',
            icon: ArrowsPointingOutIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit,
            tooltip: 'Set bar height',
            dropdownItems: barHeightOptions.map(height => ({
              id: `height-${height}`,
              label: `${height}px`,
              icon: ArrowsPointingOutIcon,
              action: () => {
                onFormatOperation({ 
                  type: 'bar-height', 
                  data: { height } 
                });
                onFormatStateChange?.({ barHeight: height });
              },
              disabled: false,
              separator: false
            })) as any
          },
          {
            id: 'custom-colors',
            label: 'Custom Colors',
            icon: PaletteIcon,
            type: 'button',
            action: () => onFormatOperation({ 
              type: 'bar-coloring', 
              data: { action: 'custom-colors' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Set custom bar colors'
          }
        ]
      },

      // Text Formatting Group
      {
        id: 'text-formatting',
        title: 'Text Formatting',
        buttons: [
          {
            id: 'font-family',
            label: 'Font Family',
            icon: DocumentTextIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit,
            tooltip: 'Set font family',
            dropdownItems: fontOptions.map(font => ({
              id: font.id,
              label: font.label,
              icon: DocumentTextIcon,
              action: () => {
                onFormatOperation({ 
                  type: 'font-settings', 
                  data: { 
                    family: font.family,
                    fontId: font.id 
                  } 
                });
                onFormatStateChange?.({ fontFamily: font.family });
              },
              disabled: false,
              separator: false
            })) as any
          },
          {
            id: 'font-size',
            label: 'Font Size',
            icon: FontFamilyIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit,
            tooltip: 'Set font size',
            dropdownItems: fontSizeOptions.map(size => ({
              id: `size-${size}`,
              label: `${size}pt`,
              icon: FontFamilyIcon,
              action: () => {
                onFormatOperation({ 
                  type: 'font-settings', 
                  data: { size } 
                });
                onFormatStateChange?.({ fontSize: size });
              },
              disabled: false,
              separator: false
            })) as any
          },
          {
            id: 'text-color',
            label: 'Text Color',
            icon: SwatchIcon,
            type: 'button',
            action: () => onFormatOperation({ 
              type: 'font-settings', 
              data: { action: 'text-color' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Set text color'
          }
        ]
      },

      // Display Options Group
      {
        id: 'display-options',
        title: 'Display Options',
        buttons: [
          {
            id: 'milestone-style',
            label: 'Milestone Diamond',
            icon: DiamondIcon,
            type: 'toggle',
            action: () => {
              const newValue = !currentFormatState?.showMilestoneAsDiamond;
              onFormatOperation({ 
                type: 'milestone-style', 
                data: { showAsDiamond: newValue } 
              });
              onFormatStateChange?.({ showMilestoneAsDiamond: newValue });
            },
            disabled: isViewer || !canEdit,
            tooltip: 'Show milestones as diamonds',
            isActive: currentFormatState?.showMilestoneAsDiamond || false
          },
          {
            id: 'float-style',
            label: 'Float Trail',
            icon: ChartBarIcon,
            type: 'toggle',
            action: () => {
              const newValue = !currentFormatState?.showFloatAsTrail;
              onFormatOperation({ 
                type: 'float-style', 
                data: { showAsTrail: newValue } 
              });
              onFormatStateChange?.({ showFloatAsTrail: newValue });
            },
            disabled: isViewer || !canEdit,
            tooltip: 'Show float as thin trail',
            isActive: currentFormatState?.showFloatAsTrail || false
          },
          {
            id: 'show-progress',
            label: 'Show Progress',
            icon: EyeIcon,
            type: 'toggle',
            action: () => onFormatOperation({ 
              type: 'display-options', 
              data: { action: 'toggle-progress' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Show progress bars',
            isActive: true // Default to true
          }
        ]
      },

      // Advanced Formatting Group
      {
        id: 'advanced-formatting',
        title: 'Advanced',
        buttons: [
          {
            id: 'grid-styling',
            label: 'Grid Style',
            icon: CogIcon,
            type: 'button',
            action: () => onFormatOperation({ 
              type: 'advanced-formatting', 
              data: { action: 'grid-styling' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Customize grid appearance'
          },
          {
            id: 'timeline-styling',
            label: 'Timeline Style',
            icon: ChartBarIcon,
            type: 'button',
            action: () => onFormatOperation({ 
              type: 'advanced-formatting', 
              data: { action: 'timeline-styling' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Customize timeline appearance'
          },
          {
            id: 'legend-styling',
            label: 'Legend Style',
            icon: EyeIcon,
            type: 'button',
            action: () => onFormatOperation({ 
              type: 'advanced-formatting', 
              data: { action: 'legend-styling' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Customize legend appearance'
          }
        ]
      },

      // Presets Group
      {
        id: 'presets',
        title: 'Presets',
        buttons: [
          {
            id: 'save-preset',
            label: 'Save Preset',
            icon: DocumentTextIcon,
            type: 'button',
            action: () => onFormatOperation({ 
              type: 'save-preferences', 
              data: { action: 'save-preset' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Save current format as preset'
          },
          {
            id: 'load-preset',
            label: 'Load Preset',
            icon: DocumentTextIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit,
            tooltip: 'Load saved format preset',
            dropdownItems: [
              { id: 'default', label: 'Default', icon: CogIcon, action: () => onFormatOperation({ type: 'save-preferences', data: { action: 'load-preset', preset: 'default' } }), disabled: false, separator: false },
              { id: 'professional', label: 'Professional', icon: CogIcon, action: () => onFormatOperation({ type: 'save-preferences', data: { action: 'load-preset', preset: 'professional' } }), disabled: false, separator: false },
              { id: 'colorful', label: 'Colorful', icon: CogIcon, action: () => onFormatOperation({ type: 'save-preferences', data: { action: 'load-preset', preset: 'colorful' } }), disabled: false, separator: false },
              { id: 'minimal', label: 'Minimal', icon: CogIcon, action: () => onFormatOperation({ type: 'save-preferences', data: { action: 'load-preset', preset: 'minimal' } }), disabled: false, separator: false }
            ] as any
          },
          {
            id: 'reset-formatting',
            label: 'Reset',
            icon: CogIcon,
            type: 'button',
            action: () => onFormatOperation({ 
              type: 'save-preferences', 
              data: { action: 'reset-formatting' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Reset to default formatting'
          }
        ]
      }
    ]
  };

  return formatTab;
};

// Default export function that returns the tab configuration
const FormatTab = (
  onFormatOperation: (operation: FormatOperation) => void,
  userRole: string,
  currentFormatState?: FormatState,
  onFormatStateChange?: (newState: Partial<FormatState>) => void
): RibbonTab => {
  return useFormatTab(onFormatOperation, userRole, currentFormatState, onFormatStateChange);
};

export default FormatTab; 