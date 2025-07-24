import React from 'react';
import { DocumentIcon } from '@heroicons/react/24/outline';
import ProjectSaveSection from './ProjectSaveSection';
import ImportExportSection from './ImportExportSection';
import AstaImportExportSection from './AstaImportExportSection';
import PrintExportSection from './PrintExportSection';
import TwoWaySyncSection from './TwoWaySyncSection';
import ProjectMetadataSection from './ProjectMetadataSection';

export type ProjectStatus = 'draft' | 'active' | 'on-hold' | 'completed' | 'archived';

interface FileTabProps {
  autoSaveEnabled: boolean;
  currentStatus: ProjectStatus;
  // Global state
  disabled?: boolean;
  lastSyncTime?: string;
  
  loading?: {
    archive?: boolean;
    autoSave?: boolean;
    csv?: boolean;
    
    image?: boolean;
    // Import & Export
    import?: boolean;
    log?: boolean;
    pdf?: boolean;
    pdfCustom?: boolean;
    print?: boolean;
    
    // Print & Export
    printView?: boolean;
    // Project Metadata
    properties?: boolean;
    
    // Project Save
    save?: boolean;
    status?: boolean;
    
    // 2-Way Sync
    sync?: boolean;
    template?: boolean;
    timeline?: boolean;
  };
  onArchiveProject: () => void;
  onChangeProjectStatus: (status: ProjectStatus) => void;
  onExportCSV: () => void;
  onExportImage: () => void;
  onExportPDF: () => void;
  
  onExportPDFCustom: () => void;
  onExportTimeline?: () => void;
  
  // 2-Way Sync Section
  onSyncWithAsta: () => void;
  // Project Metadata Section
  onOpenProjectProperties: () => void;
  // Project Save Section
  onSaveChanges: () => void;
  syncStatus?: 'success' | 'error' | 'pending' | 'none';
  
  onSaveAsTemplate: () => void;
  projectName?: string;
  onTaskOperation?: (operation: any) => void;
  
  onViewSyncLog: () => void;
  // Print & Export Section
  onPrintView: () => void;
  onPrintTimeline?: () => void;
  // Asta Import/Export Section
  projectId?: string;
  
  onToggleAutoSave: () => void;
  // Import & Export Section
  onImportProject: () => void;
}

const FileTab: React.FC<FileTabProps> = ({
  // Project Save Section
  onSaveChanges,
  onSaveAsTemplate,
  onToggleAutoSave,
  autoSaveEnabled,
  
  // Import & Export Section
  onImportProject,
  onExportPDF,
  onExportCSV,
  onExportImage,
  onExportTimeline,
  onPrintTimeline,
  
  // Print & Export Section
  onPrintView,
  onExportPDFCustom,
  
  // 2-Way Sync Section
  onSyncWithAsta,
  onViewSyncLog,
  lastSyncTime,
  syncStatus,
  
  // Asta Import/Export Section
  projectId = 'demo',
  projectName = 'Project',
  onTaskOperation,
  
  // Project Metadata Section
  onOpenProjectProperties,
  onChangeProjectStatus,
  onArchiveProject,
  currentStatus,
  
  // Global state
  disabled = false,
  loading = {}
}) => {
  return (
    <div className="ribbon-tab">
      <div className="ribbon-tab-header">
        <DocumentIcon className="w-5 h-5" />
        <span className="ribbon-tab-label">File</span>
      </div>
      
      <div className="ribbon-tab-content">
        <div className="ribbon-sections">
          <ProjectSaveSection
            onSaveChanges={onSaveChanges}
            onSaveAsTemplate={onSaveAsTemplate}
            onToggleAutoSave={onToggleAutoSave}
            autoSaveEnabled={autoSaveEnabled}
            disabled={disabled}
            loading={{
              save: loading.save,
              template: loading.template,
              autoSave: loading.autoSave
            }}
          />
          
          <ImportExportSection
            onImportProject={onImportProject}
            onExportPDF={onExportPDF}
            onExportCSV={onExportCSV}
            onExportImage={onExportImage}
            onExportTimeline={onExportTimeline}
            onPrintTimeline={onPrintTimeline}
            disabled={disabled}
            loading={{
              import: loading.import,
              pdf: loading.pdf,
              csv: loading.csv,
              image: loading.image,
              timeline: loading.timeline,
              print: loading.print
            }}
          />
          
          <AstaImportExportSection
            projectId={projectId}
            projectName={projectName}
            onTaskOperation={onTaskOperation}
          />
          
          <PrintExportSection
            onPrintView={onPrintView}
            onExportPDF={onExportPDFCustom}
            disabled={disabled}
            loading={{
              print: loading.printView,
              pdf: loading.pdfCustom
            }}
          />
          
          <TwoWaySyncSection
            onSyncWithAsta={onSyncWithAsta}
            onViewSyncLog={onViewSyncLog}
            lastSyncTime={lastSyncTime}
            syncStatus={syncStatus}
            disabled={disabled}
            loading={{
              sync: loading.sync,
              log: loading.log
            }}
          />
          
          <ProjectMetadataSection
            onOpenProjectProperties={onOpenProjectProperties}
            onChangeProjectStatus={onChangeProjectStatus}
            onArchiveProject={onArchiveProject}
            currentStatus={currentStatus}
            disabled={disabled}
            loading={{
              properties: loading.properties,
              status: loading.status,
              archive: loading.archive
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FileTab; 