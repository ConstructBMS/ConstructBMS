import React from 'react';
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  EyeIcon,
  PhotoIcon,
  DocumentTextIcon,
  CogIcon,
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import type { RibbonTab } from '../GanttRibbon';

// Types for output operations
export interface OutputOperation {
  data?: any;
  type: 'print-profile' | 'export-format' | 'show-preview' | 'page-range' | 'include-legend' | 'save-profile' | 'print-export';
}

// Print profile interface
export interface PrintProfile {
  description: string;
  id: string;
  isDefault: boolean;
  name: string;
  settings: {
    includeGrid: boolean;
    includeLegend: boolean;
    includeTimeline: boolean;
    margins: {
      bottom: number;
      left: number;
      right: number;
      top: number;
    };
    orientation: 'portrait' | 'landscape';
    pageSize: string;
    quality: 'draft' | 'normal' | 'high';
    scale: number;
  };
}

// Export format options
export interface ExportFormat {
  description: string;
  extension: string;
  icon: React.ComponentType<any>;
  id: string;
  label: string;
  mimeType: string;
}

// Page range interface
export interface PageRange {
  custom: boolean;
  end: number;
  start: number;
}

// Output state interface
export interface OutputState {
  exportFormat: string;
  includeGrid: boolean;
  includeLegend: boolean;
  includeTimeline: boolean;
  pageRange: PageRange;
  quality: 'draft' | 'normal' | 'high';
  selectedProfile: string;
  showPreview: boolean;
}

interface OutputTabProps {
  availableProfiles?: PrintProfile[];
  currentOutputState?: OutputState;
  onOutputOperation: (operation: OutputOperation) => void;
  onOutputStateChange?: (newState: Partial<OutputState>) => void;
  userRole: string;
}

const useOutputTab = (
  onOutputOperation: (operation: OutputOperation) => void,
  userRole: string,
  currentOutputState?: OutputState,
  onOutputStateChange?: (newState: Partial<OutputState>) => void,
  availableProfiles?: PrintProfile[]
): RibbonTab => {
  // Check if user can perform actions (not viewer)
  const isViewer = userRole === 'viewer';
  const canEdit = userRole !== 'viewer';

  // Export format options
  const exportFormats: ExportFormat[] = [
    {
      id: 'pdf',
      label: 'PDF',
      description: 'Portable Document Format',
      icon: DocumentTextIcon,
      extension: 'pdf',
      mimeType: 'application/pdf'
    },
    {
      id: 'png',
      label: 'PNG',
      description: 'Portable Network Graphics',
      icon: PhotoIcon,
      extension: 'png',
      mimeType: 'image/png'
    },
    {
      id: 'jpg',
      label: 'JPG',
      description: 'JPEG Image Format',
      icon: PhotoIcon,
      extension: 'jpg',
      mimeType: 'image/jpeg'
    }
  ];

  // Quality options
  const qualityOptions = [
    { id: 'draft', label: 'Draft', description: 'Fast, lower quality' },
    { id: 'normal', label: 'Normal', description: 'Balanced quality and speed' },
    { id: 'high', label: 'High', description: 'Best quality, slower' }
  ];

  // Create ribbon tab configuration
  const outputTab: RibbonTab = {
    id: 'output',
    label: 'Output',
    icon: DocumentArrowDownIcon,
    groups: [
      // Print Profiles Group
      {
        id: 'print-profiles',
        title: 'Print Profiles',
        buttons: [
          {
            id: 'print-profile',
            label: 'Print Profile',
            icon: PrinterIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit,
            tooltip: 'Select print profile',
            dropdownItems: (availableProfiles || []).map(profile => ({
              id: profile.id,
              label: profile.name,
              icon: PrinterIcon,
              action: () => {
                onOutputOperation({ 
                  type: 'print-profile', 
                  data: { profileId: profile.id } 
                });
                onOutputStateChange?.({ selectedProfile: profile.id });
              },
              disabled: false,
              separator: false
            })) as any
          },
          {
            id: 'save-profile',
            label: 'Save Profile',
            icon: DocumentDuplicateIcon,
            type: 'button',
            action: () => onOutputOperation({ 
              type: 'save-profile', 
              data: { action: 'save' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Save current settings as profile'
          },
          {
            id: 'manage-profiles',
            label: 'Manage',
            icon: CogIcon,
            type: 'button',
            action: () => onOutputOperation({ 
              type: 'save-profile', 
              data: { action: 'manage' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Manage print profiles'
          }
        ]
      },

      // Export Options Group
      {
        id: 'export-options',
        title: 'Export Options',
        buttons: [
          {
            id: 'export-format',
            label: 'Export Format',
            icon: DocumentArrowDownIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit,
            tooltip: 'Select export format',
            dropdownItems: exportFormats.map(format => ({
              id: format.id,
              label: format.label,
              icon: format.icon,
              action: () => {
                onOutputOperation({ 
                  type: 'export-format', 
                  data: { format: format.id } 
                });
                onOutputStateChange?.({ exportFormat: format.id });
              },
              disabled: false,
              separator: false
            })) as any
          },
          {
            id: 'quality',
            label: 'Quality',
            icon: AdjustmentsHorizontalIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit,
            tooltip: 'Set export quality',
            dropdownItems: qualityOptions.map(option => ({
              id: option.id,
              label: option.label,
              icon: AdjustmentsHorizontalIcon,
              action: () => {
                onOutputOperation({ 
                  type: 'export-format', 
                  data: { quality: option.id } 
                });
                onOutputStateChange?.({ quality: option.id as any });
              },
              disabled: false,
              separator: false
            })) as any
          },
          {
            id: 'show-preview',
            label: 'Show Preview',
            icon: EyeIcon,
            type: 'toggle',
            action: () => {
              const newValue = !currentOutputState?.showPreview;
              onOutputOperation({ 
                type: 'show-preview', 
                data: { show: newValue } 
              });
              onOutputStateChange?.({ showPreview: newValue });
            },
            disabled: isViewer || !canEdit,
            tooltip: 'Show export preview',
            isActive: currentOutputState?.showPreview || false
          }
        ]
      },

      // Content Options Group
      {
        id: 'content-options',
        title: 'Content Options',
        buttons: [
          {
            id: 'include-legend',
            label: 'Include Legend',
            icon: InformationCircleIcon,
            type: 'toggle',
            action: () => {
              const newValue = !currentOutputState?.includeLegend;
              onOutputOperation({ 
                type: 'include-legend', 
                data: { include: newValue } 
              });
              onOutputStateChange?.({ includeLegend: newValue });
            },
            disabled: isViewer || !canEdit,
            tooltip: 'Include legend in export',
            isActive: currentOutputState?.includeLegend || false
          },
          {
            id: 'include-grid',
            label: 'Include Grid',
            icon: AdjustmentsHorizontalIcon,
            type: 'toggle',
            action: () => {
              const newValue = !currentOutputState?.includeGrid;
              onOutputOperation({ 
                type: 'include-legend', 
                data: { includeGrid: newValue } 
              });
              onOutputStateChange?.({ includeGrid: newValue });
            },
            disabled: isViewer || !canEdit,
            tooltip: 'Include grid in export',
            isActive: currentOutputState?.includeGrid || false
          },
          {
            id: 'include-timeline',
            label: 'Include Timeline',
            icon: DocumentTextIcon,
            type: 'toggle',
            action: () => {
              const newValue = !currentOutputState?.includeTimeline;
              onOutputOperation({ 
                type: 'include-legend', 
                data: { includeTimeline: newValue } 
              });
              onOutputStateChange?.({ includeTimeline: newValue });
            },
            disabled: isViewer || !canEdit,
            tooltip: 'Include timeline in export',
            isActive: currentOutputState?.includeTimeline || false
          }
        ]
      },

      // Page Range Group
      {
        id: 'page-range',
        title: 'Page Range',
        buttons: [
          {
            id: 'page-range',
            label: 'Page Range',
            icon: DocumentTextIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit,
            tooltip: 'Select page range',
            dropdownItems: [
              { id: 'all', label: 'All Pages', icon: DocumentTextIcon, action: () => onOutputOperation({ type: 'page-range', data: { range: 'all' } }), disabled: false, separator: false },
              { id: 'current', label: 'Current Page', icon: DocumentTextIcon, action: () => onOutputOperation({ type: 'page-range', data: { range: 'current' } }), disabled: false, separator: false },
              { id: 'custom', label: 'Custom Range', icon: DocumentTextIcon, action: () => onOutputOperation({ type: 'page-range', data: { range: 'custom' } }), disabled: false, separator: false }
            ] as any
          },
          {
            id: 'page-setup',
            label: 'Page Setup',
            icon: CogIcon,
            type: 'button',
            action: () => onOutputOperation({ 
              type: 'page-range', 
              data: { action: 'page-setup' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Configure page setup'
          }
        ]
      },

      // Export Actions Group
      {
        id: 'export-actions',
        title: 'Export Actions',
        buttons: [
          {
            id: 'export-now',
            label: 'Export Now',
            icon: DocumentArrowDownIcon,
            type: 'button',
            action: () => onOutputOperation({ 
              type: 'print-export', 
              data: { action: 'export' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Export immediately'
          },
          {
            id: 'print-now',
            label: 'Print Now',
            icon: PrinterIcon,
            type: 'button',
            action: () => onOutputOperation({ 
              type: 'print-export', 
              data: { action: 'print' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Print immediately'
          },
          {
            id: 'batch-export',
            label: 'Batch Export',
            icon: DocumentDuplicateIcon,
            type: 'button',
            action: () => onOutputOperation({ 
              type: 'print-export', 
              data: { action: 'batch' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Export multiple formats'
          }
        ]
      }
    ]
  };

  return outputTab;
};

// Default export function that returns the tab configuration
const OutputTab = (
  onOutputOperation: (operation: OutputOperation) => void,
  userRole: string,
  currentOutputState?: OutputState,
  onOutputStateChange?: (newState: Partial<OutputState>) => void,
  availableProfiles?: PrintProfile[]
): RibbonTab => {
  return useOutputTab(onOutputOperation, userRole, currentOutputState, onOutputStateChange, availableProfiles);
};

export default OutputTab; 