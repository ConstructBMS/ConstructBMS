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
  // Project Save Section
  onSaveChanges: () => void;
  onSaveAsTemplate: () => void;
  onToggleAutoSave: () => void;
  autoSaveEnabled: boolean;
  
  // Import & Export Section
  onImportProject: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onExportImage: () => void;
  onExportTimeline?: () => void;
  onPrintTimeline?: () => void;
  
  // Print & Export Section
  onPrintView: () => void;
  onExportPDFCustom: () => void;
  
  // 2-Way Sync Section
  onSyncWithAsta: () => void;
  onViewSyncLog: () => void;
  lastSyncTime?: string;
  syncStatus?: 'success' | 'error' | 'pending' | 'none';
  
  // Asta Import/Export Section
  projectId?: string;
  projectName?: string;
  onTaskOperation?: (operation: any) => void;
  
  // Project Metadata Section
  onOpenProjectProperties: () => void;
  onChangeProjectStatus: (status: ProjectStatus) => void;
  onArchiveProject: () => void;
  currentStatus: ProjectStatus;
  
  // Global state
  disabled?: boolean;
  loading?: {
    // Project Save
    save?: boolean;
    template?: boolean;
    autoSave?: boolean;
    
    // Import & Export
    import?: boolean;
    pdf?: boolean;
    csv?: boolean;
    image?: boolean;
    timeline?: boolean;
    print?: boolean;
    
    // Print & Export
    printView?: boolean;
    pdfCustom?: boolean;
    
    // 2-Way Sync
    sync?: boolean;
    log?: boolean;
    
    // Project Metadata
    properties?: boolean;
    status?: boolean;
    archive?: boolean;
  };
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