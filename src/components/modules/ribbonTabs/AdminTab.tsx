import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import TagsLabelsSection from './TagsLabelsSection';
import TaskStatusesSection from './TaskStatusesSection';
import ThemeConfigSection from './ThemeConfigSection';
import CustomFieldsSection from './CustomFieldsSection';

interface AdminTabProps {
  // Tags & Labels Section
  onOpenManageTags: () => void;
  onColorPaletteChange: (color: string) => void;
  currentColorPalette: string;
  
  // Task Statuses Section
  onOpenEditStatusList: () => void;
  onSetDefaultStatus: (status: string) => void;
  currentDefaultStatus: string;
  availableStatuses: Array<{ id: string; name: string; color: string }>;
  
  // Theme Config Section
  onThemePresetChange: (preset: string) => void;
  onOpenManageTheme: () => void;
  currentThemePreset: string;
  
  // Custom Fields Section
  onOpenAddField: () => void;
  onOpenFieldLibrary: () => void;
  onOpenFieldPosition: () => void;
  
  // Global state
  disabled?: boolean;
  loading?: {
    // Tags & Labels
    manage?: boolean;
    palette?: boolean;
    
    // Task Statuses
    edit?: boolean;
    default?: boolean;
    
    // Theme Config
    preset?: boolean;
    manage?: boolean;
    
    // Custom Fields
    add?: boolean;
    library?: boolean;
    position?: boolean;
  };
}

const AdminTab: React.FC<AdminTabProps> = ({
  // Tags & Labels Section
  onOpenManageTags,
  onColorPaletteChange,
  currentColorPalette,
  
  // Task Statuses Section
  onOpenEditStatusList,
  onSetDefaultStatus,
  currentDefaultStatus,
  availableStatuses,
  
  // Theme Config Section
  onThemePresetChange,
  onOpenManageTheme,
  currentThemePreset,
  
  // Custom Fields Section
  onOpenAddField,
  onOpenFieldLibrary,
  onOpenFieldPosition,
  
  // Global state
  disabled = false,
  loading = {}
}) => {
  return (
    <div className="ribbon-tab">
      <div className="ribbon-tab-header">
        <Cog6ToothIcon className="w-5 h-5" />
        <span className="ribbon-tab-label">Admin</span>
      </div>
      
      <div className="ribbon-tab-content">
        <div className="ribbon-sections">
          <TagsLabelsSection
            onOpenManageTags={onOpenManageTags}
            onColorPaletteChange={onColorPaletteChange}
            currentColorPalette={currentColorPalette}
            disabled={disabled}
            loading={{
              manage: loading.manage,
              palette: loading.palette
            }}
          />
          
          <TaskStatusesSection
            onOpenEditStatusList={onOpenEditStatusList}
            onSetDefaultStatus={onSetDefaultStatus}
            currentDefaultStatus={currentDefaultStatus}
            availableStatuses={availableStatuses}
            disabled={disabled}
            loading={{
              edit: loading.edit,
              default: loading.default
            }}
          />
          
          <ThemeConfigSection
            onThemePresetChange={onThemePresetChange}
            onOpenManageTheme={onOpenManageTheme}
            currentThemePreset={currentThemePreset}
            disabled={disabled}
            loading={{
              preset: loading.preset,
              manage: loading.manage
            }}
          />
          
          <CustomFieldsSection
            onOpenAddField={onOpenAddField}
            onOpenFieldLibrary={onOpenFieldLibrary}
            onOpenFieldPosition={onOpenFieldPosition}
            disabled={disabled}
            loading={{
              add: loading.add,
              library: loading.library,
              position: loading.position
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminTab; 