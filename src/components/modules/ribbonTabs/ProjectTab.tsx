import React, { useState, useEffect } from 'react';
import InformationSection from './InformationSection';
import CalendarSection from './CalendarSection';
import ConstraintsSection from './ConstraintsSection';
import BaselinesSection from './BaselinesSection';
import PropertiesSection from './PropertiesSection';
import StructureSection from './StructureSection';
import ImportExportSection from './ImportExportSection';
import AuditSection from './AuditSection';
import VersionControls from './VersionControls';
import ProjectDetailsModal from './ProjectDetailsModal';
import ProjectNotesModal from './ProjectNotesModal';
import ProjectCalendarModal from './ProjectCalendarModal';
import ManageCalendarsModal from './ManageCalendarsModal';
import WorkingCalendarModal from '../WorkingCalendarModal';
import CalendarManagerModal from '../CalendarManagerModal';
import SetConstraintModal from './SetConstraintModal';
import ConstraintReportModal from './ConstraintReportModal';
import SetBaselineModal from './SetBaselineModal';
import ManageBaselinesModal from './ManageBaselinesModal';
import CompareBaselinesModal from './CompareBaselinesModal';
import CustomFieldsManagerModal from '../CustomFieldsManagerModal';
import EditFieldValuesModal from './EditFieldValuesModal';
import AutoIdSettingsModal from './AutoIdSettingsModal';
import SetWbsPrefixModal from './SetWbsPrefixModal';
import ImportAstaModal from './ImportAstaModal';
import ExportAstaModal from './ExportAstaModal';
import type { ProjectStatus } from './ProjectStatusDropdown';
import type { ProjectDetails } from './ProjectDetailsModal';
import type { ProjectNotes } from './ProjectNotesModal';
import type { Calendar } from './ApplyCalendarDropdown';
import type { TaskConstraint } from './SetConstraintModal';
import type { ConstrainedTask } from './ConstraintReportModal';
import type { Baseline } from './SetBaselineModal';
import type { CustomField, FieldTemplate } from './FieldTemplateDropdown';
import type { TaskIdSettings } from './AutoIdSettingsModal';
import type { WbsPrefixSettings } from './SetWbsPrefixModal';
import type { ParsedProgramme } from './ImportAstaModal';
import type { AstaExportSettings } from './ExportAstaModal';
import { ProjectInformationService } from '../../../services/projectInformationService';
import { calendarService } from '../../../services/calendarService';
import { programmeWorkingCalendarService, type ProgrammeCalendar } from '../../../services/programmeWorkingCalendarService';
import { ConstraintService } from '../../../services/constraintService';
import { baselineService } from '../../../services/baselineService';
import { PropertiesService } from '../../../services/propertiesService';
import { programmeCustomFieldsService } from '../../../services/programmeCustomFieldsService';
import { structureService } from '../../../services/structureService';
import { ImportExportService } from '../../../services/importExportService';

interface ProjectTabProps {
  activeRibbonTab: string;
  canEdit: boolean;
  onTaskOperation: (operation: any) => void;
  selectedTasks: string[];
  userRole: string;
}

const ProjectTab: React.FC<ProjectTabProps> = ({
  canEdit,
  onTaskOperation,
  selectedTasks,
  userRole,
  activeRibbonTab
}) => {
  // State for project information
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: 'New Project',
    description: '',
    startDate: '',
    endDate: '',
    owner: '',
    client: '',
    referenceId: 'PRJ-2024-001'
  });
  const [projectNotes, setProjectNotes] = useState<ProjectNotes>({
    content: '',
    lastEdited: '',
    editor: ''
  });
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('Not Started');
  
  // Calendar state
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [currentCalendar, setCurrentCalendar] = useState<Calendar | undefined>();
  
  // Constraints state
  const [constrainedTasks, setConstrainedTasks] = useState<ConstrainedTask[]>([]);
  
  // Baselines state
  const [baselines, setBaselines] = useState<Baseline[]>([]);
  const [activeBaselineId, setActiveBaselineId] = useState<string | null>(null);
  
  // Properties state
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [fieldTemplates, setFieldTemplates] = useState<FieldTemplate[]>([]);
  const [taskFieldValues, setTaskFieldValues] = useState<Record<string, Record<string, any>>>({});
  
  // Structure state
  const [taskIdSettings, setTaskIdSettings] = useState<TaskIdSettings | null>(null);
  const [currentWbsPrefix, setCurrentWbsPrefix] = useState<string>('');
  
  // Import/Export state
  const [importExportHistory, setImportExportHistory] = useState<{
    exports: any[];
    imports: any[];
  }>({ imports: [], exports: [] });
  
  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isProjectCalendarModalOpen, setIsProjectCalendarModalOpen] = useState(false);
  const [isWorkingCalendarModalOpen, setIsWorkingCalendarModalOpen] = useState(false);
  const [isManageCalendarsModalOpen, setIsManageCalendarsModalOpen] = useState(false);
  const [isCalendarManagerModalOpen, setIsCalendarManagerModalOpen] = useState(false);
  const [isSetConstraintModalOpen, setIsSetConstraintModalOpen] = useState(false);
  const [isConstraintReportModalOpen, setIsConstraintReportModalOpen] = useState(false);
  const [isSetBaselineModalOpen, setIsSetBaselineModalOpen] = useState(false);
  const [isManageBaselinesModalOpen, setIsManageBaselinesModalOpen] = useState(false);
  const [isCompareBaselinesModalOpen, setIsCompareBaselinesModalOpen] = useState(false);
  const [isManageCustomFieldsModalOpen, setIsManageCustomFieldsModalOpen] = useState(false);
  const [isEditFieldValuesModalOpen, setIsEditFieldValuesModalOpen] = useState(false);
  const [isAutoIdSettingsModalOpen, setIsAutoIdSettingsModalOpen] = useState(false);
  const [isSetWbsPrefixModalOpen, setIsSetWbsPrefixModalOpen] = useState(false);
  const [isImportAstaModalOpen, setIsImportAstaModalOpen] = useState(false);
  const [isExportAstaModalOpen, setIsExportAstaModalOpen] = useState(false);
  
  // Loading states
  const [informationLoading, setInformationLoading] = useState({
    details: false,
    notes: false,
    status: false
  });
  const [calendarLoading, setCalendarLoading] = useState({
    project: false,
    manage: false,
    apply: false
  });
  const [constraintsLoading, setConstraintsLoading] = useState({
    set: false,
    clear: false,
    report: false
  });
  const [baselinesLoading, setBaselinesLoading] = useState({
    set: false,
    manage: false,
    compare: false
  });
  const [propertiesLoading, setPropertiesLoading] = useState({
    manage: false,
    edit: false,
    templates: false
  });
  const [structureLoading, setStructureLoading] = useState({
    renumber: false,
    autoIdSettings: false,
    wbsPrefix: false
  });
  const [importExportLoading, setImportExportLoading] = useState({
    importAsta: false,
    exportAsta: false,
    export: false
  });

  // Load project information, calendars, constraints, baselines, and properties on mount
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        // Load project information
        const infoResult = await ProjectInformationService.getProjectInformation('demo');
        
        if (infoResult.success && infoResult.data) {
          setProjectDetails(infoResult.data.details);
          setProjectNotes(infoResult.data.notes);
          setProjectStatus(infoResult.data.status);
        }

        // Load calendars
        const calendarsResult = await calendarService.getCalendars('demo');
        
        if (calendarsResult.success && calendarsResult.data) {
          setCalendars(calendarsResult.data as Calendar[]);
        }

        // Load current project calendar
        const projectCalendarResult = await calendarService.getProjectCalendar('demo');
        
        if (projectCalendarResult.success && projectCalendarResult.data) {
          setCurrentCalendar(projectCalendarResult.data as Calendar);
        }

        // Load constrained tasks
        const constrainedTasksResult = await ConstraintService.getAllConstrainedTasks('demo');
        setConstrainedTasks(constrainedTasksResult);

        // Load baselines
        const baselinesResult = await baselineService.getBaselines('demo');
        setBaselines(baselinesResult);

        // Load active baseline
        const activeBaselineIdResult = await baselineService.getActiveBaselineId('demo');
        setActiveBaselineId(activeBaselineIdResult);

        // Load custom fields
        const customFieldsResult = await programmeCustomFieldsService.getProjectCustomFields('demo');
        setCustomFields(customFieldsResult);

        // Load field templates
        const fieldTemplatesResult = await PropertiesService.getFieldTemplates('demo');
        setFieldTemplates(fieldTemplatesResult);

        // Load structure data
        const taskIdSettingsResult = await structureService.getAutoIdSettings('demo');
        setTaskIdSettings(taskIdSettingsResult);

        const wbsPrefixResult = await structureService.getWbsPrefix('demo');
        setCurrentWbsPrefix(wbsPrefixResult);

        // Load import/export history
        const importExportHistoryResult = await ImportExportService.getImportExportHistory('demo');
        setImportExportHistory(importExportHistoryResult);
      } catch (error) {
        console.error('Failed to load project data:', error);
      }
    };

    loadProjectData();
  }, []);

  // Load task field values when selected tasks change
  useEffect(() => {
    const loadTaskFieldValues = async () => {
      if (selectedTasks.length > 0) {
        try {
          const fieldValues = await PropertiesService.getTaskFieldValues(selectedTasks, 'demo');
          setTaskFieldValues(fieldValues);
        } catch (error) {
          console.error('Failed to load task field values:', error);
        }
      } else {
        setTaskFieldValues({});
      }
    };

    loadTaskFieldValues();
  }, [selectedTasks]);

  // Project details handler
  const handleProjectDetails = () => {
    setIsDetailsModalOpen(true);
  };

  const handleSaveProjectDetails = async (details: ProjectDetails) => {
    setInformationLoading(prev => ({ ...prev, details: true }));
    try {
      const result = await ProjectInformationService.updateProjectDetails(details, 'demo');
      
      if (result.success && result.data) {
        setProjectDetails(result.data.details);
        
        // Add to undo stack (in a real app, this would be handled by a context)
        console.log('Project details updated:', result.data.details);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'update_project_details', 
            details: result.data.details 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to save project details:', error);
    } finally {
      setInformationLoading(prev => ({ ...prev, details: false }));
    }
  };

  // Project notes handler
  const handleProjectNotes = () => {
    setIsNotesModalOpen(true);
  };

  const handleSaveProjectNotes = async (notes: ProjectNotes) => {
    setInformationLoading(prev => ({ ...prev, notes: true }));
    try {
      const result = await ProjectInformationService.updateProjectNotes(notes, 'demo');
      
      if (result.success && result.data) {
        setProjectNotes(result.data.notes);
        
        // Add to undo stack (in a real app, this would be handled by a context)
        console.log('Project notes updated:', result.data.notes);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'update_project_notes', 
            notes: result.data.notes 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to save project notes:', error);
    } finally {
      setInformationLoading(prev => ({ ...prev, notes: false }));
    }
  };

  // Project status handler
  const handleStatusChange = async (status: ProjectStatus) => {
    setInformationLoading(prev => ({ ...prev, status: true }));
    try {
      const result = await ProjectInformationService.changeProjectStatus(status, 'demo');
      
      if (result.success && result.data) {
        setProjectStatus(result.data.status);
        
        // Add to undo stack (in a real app, this would be handled by a context)
        console.log('Project status changed to:', result.data.status);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'change_project_status', 
            status: result.data.status,
            statusHistory: result.data.statusHistory
          } 
        });
      }
    } catch (error) {
      console.error('Failed to change project status:', error);
    } finally {
      setInformationLoading(prev => ({ ...prev, status: false }));
    }
  };

  // Calendar handlers
  const handleProjectCalendar = () => {
    setIsWorkingCalendarModalOpen(true);
  };

  const handleSaveProjectCalendar = async (calendar: Calendar) => {
    setCalendarLoading(prev => ({ ...prev, project: true }));
    try {
      const result = await calendarService.saveCalendar(calendar, 'demo');
      
      if (result.success && result.data) {
        // Update calendars list
        const updatedCalendars = calendars.map(c => 
          c.id === calendar.id ? calendar : c
        );
        if (!calendars.find(c => c.id === calendar.id)) {
          updatedCalendars.push(calendar);
        }
        setCalendars(updatedCalendars);
        
        // Update current calendar if it's the project calendar
        if (currentCalendar?.id === calendar.id) {
          setCurrentCalendar(calendar);
        }
        
        console.log('Project calendar updated:', calendar);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'update_project_calendar', 
            calendar 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to save project calendar:', error);
    } finally {
      setCalendarLoading(prev => ({ ...prev, project: false }));
    }
  };

  const handleSaveWorkingCalendar = async (calendar: ProgrammeCalendar) => {
    setCalendarLoading(prev => ({ ...prev, project: true }));
    try {
      console.log('Working calendar updated:', calendar);
      
      // Dispatch operation
      onTaskOperation({ 
        type: 'add', 
        data: { 
          action: 'update_working_calendar', 
          calendar 
        } 
      });
    } catch (error) {
      console.error('Failed to save working calendar:', error);
    } finally {
      setCalendarLoading(prev => ({ ...prev, project: false }));
    }
  };

  const handleManageCalendars = () => {
    setIsCalendarManagerModalOpen(true);
  };

  const handleSaveCalendar = async (calendar: Calendar) => {
    setCalendarLoading(prev => ({ ...prev, manage: true }));
    try {
      const result = await calendarService.saveCalendar(calendar, 'demo');
      
      if (result.success && result.data) {
        // Update calendars list
        const updatedCalendars = calendars.map(c => 
          c.id === calendar.id ? calendar : c
        );
        if (!calendars.find(c => c.id === calendar.id)) {
          updatedCalendars.push(calendar);
        }
        setCalendars(updatedCalendars);
        
        console.log('Calendar saved:', calendar);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'save_calendar', 
            calendar 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to save calendar:', error);
    } finally {
      setCalendarLoading(prev => ({ ...prev, manage: false }));
    }
  };

  const handleDeleteCalendar = async (calendarId: string) => {
    try {
      const result = await calendarService.deleteCalendar(calendarId, 'demo');
      
      if (result.success && result.data) {
        const updatedCalendars = calendars.filter(c => c.id !== calendarId);
        setCalendars(updatedCalendars);
        
        // Clear current calendar if it was deleted
        if (currentCalendar?.id === calendarId) {
          setCurrentCalendar(undefined);
        }
        
        console.log('Calendar deleted:', calendarId);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'delete_calendar', 
            calendarId 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to delete calendar:', error);
    }
  };

  const handleCloneCalendar = async (calendar: Calendar) => {
    try {
      const result = await calendarService.cloneCalendar(calendar, 'demo');
      
      if (result.success && result.data) {
        const clonedCalendar = result.data as Calendar;
        setCalendars([...calendars, clonedCalendar]);
        
        console.log('Calendar cloned:', clonedCalendar);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'clone_calendar', 
            calendar: clonedCalendar 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to clone calendar:', error);
    }
  };

  const handleApplyToProject = async (calendarId: string) => {
    setCalendarLoading(prev => ({ ...prev, apply: true }));
    try {
      const result = await calendarService.setProjectCalendar(calendarId, 'demo');
      
      if (result.success && result.data) {
        const calendar = result.data as Calendar;
        setCurrentCalendar(calendar);
        
        console.log('Calendar applied to project:', calendar);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'apply_calendar_to_project', 
            calendar 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to apply calendar to project:', error);
    } finally {
      setCalendarLoading(prev => ({ ...prev, apply: false }));
    }
  };

  const handleApplyToTasks = async (calendarId: string) => {
    setCalendarLoading(prev => ({ ...prev, apply: true }));
    try {
      const result = await calendarService.applyCalendarToTasks(calendarId, selectedTasks, 'demo');
      
      if (result.success) {
        console.log('Calendar applied to tasks:', result.tasksUpdated, 'tasks updated');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'apply_calendar_to_tasks', 
            calendarId,
            tasksUpdated: result.tasksUpdated 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to apply calendar to tasks:', error);
    } finally {
      setCalendarLoading(prev => ({ ...prev, apply: false }));
    }
  };

  // Constraints handlers
  const handleSetConstraint = () => {
    setIsSetConstraintModalOpen(true);
  };

  const handleSaveConstraint = async (constraint: TaskConstraint) => {
    setConstraintsLoading(prev => ({ ...prev, set: true }));
    try {
      const result = await ConstraintService.applyConstraintToTasks(selectedTasks, constraint, 'demo');
      
      if (result.success) {
        // Refresh constrained tasks list
        const updatedConstrainedTasks = await ConstraintService.getAllConstrainedTasks('demo');
        setConstrainedTasks(updatedConstrainedTasks);
        
        console.log('Constraint applied to tasks:', result.tasksUpdated, 'tasks updated');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'set_constraint', 
            constraint,
            tasksUpdated: result.tasksUpdated 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to set constraint:', error);
    } finally {
      setConstraintsLoading(prev => ({ ...prev, set: false }));
    }
  };

  const handleClearConstraint = async () => {
    const confirmed = window.confirm('Clear constraints from selected tasks?');
    if (!confirmed) return;

    setConstraintsLoading(prev => ({ ...prev, clear: true }));
    try {
      const result = await ConstraintService.clearConstraintFromTasks(selectedTasks, 'demo');
      
      if (result.success) {
        // Refresh constrained tasks list
        const updatedConstrainedTasks = await ConstraintService.getAllConstrainedTasks('demo');
        setConstrainedTasks(updatedConstrainedTasks);
        
        console.log('Constraints cleared from tasks:', result.tasksUpdated, 'tasks updated');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'clear_constraint', 
            tasksUpdated: result.tasksUpdated 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to clear constraint:', error);
    } finally {
      setConstraintsLoading(prev => ({ ...prev, clear: false }));
    }
  };

  const handleConstraintReport = async () => {
    setConstraintsLoading(prev => ({ ...prev, report: true }));
    try {
      // Refresh constrained tasks list
      const updatedConstrainedTasks = await ConstraintService.getAllConstrainedTasks('demo');
      setConstrainedTasks(updatedConstrainedTasks);
      
      setIsConstraintReportModalOpen(true);
    } catch (error) {
      console.error('Failed to load constraint report:', error);
    } finally {
      setConstraintsLoading(prev => ({ ...prev, report: false }));
    }
  };

  // Baselines handlers
  const handleSetBaseline = () => {
    setIsSetBaselineModalOpen(true);
  };

  const handleSaveBaseline = async (baselineData: Omit<Baseline, 'id' | 'createdAt' | 'createdBy'>) => {
    setBaselinesLoading(prev => ({ ...prev, set: true }));
    try {
      const result = await baselineService.createBaseline(baselineData, 'Demo User', 'demo');
      
      if (result.success && result.data) {
        // Refresh baselines list
        const updatedBaselines = await BaselineService.getBaselines('demo');
        setBaselines(updatedBaselines);
        
        console.log('Baseline created:', result.data.name);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'create_baseline', 
            baseline: result.data 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to create baseline:', error);
    } finally {
      setBaselinesLoading(prev => ({ ...prev, set: false }));
    }
  };

  const handleManageBaselines = () => {
    setIsManageBaselinesModalOpen(true);
  };

  const handleDeleteBaseline = async (baselineId: string) => {
    try {
      const result = await baselineService.deleteBaseline(baselineId, 'demo');
      
      if (result.success) {
        // Refresh baselines list
        const updatedBaselines = await BaselineService.getBaselines('demo');
        setBaselines(updatedBaselines);
        
        // Clear active baseline if it was deleted
        if (activeBaselineId === baselineId) {
          setActiveBaselineId(null);
        }
        
        console.log('Baseline deleted:', baselineId);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'delete_baseline', 
            baselineId 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to delete baseline:', error);
    }
  };

  const handleRenameBaseline = async (baselineId: string, newName: string) => {
    try {
      const result = await baselineService.updateBaselineName(baselineId, newName, 'demo');
      
      if (result.success && result.data) {
        // Refresh baselines list
        const updatedBaselines = await BaselineService.getBaselines('demo');
        setBaselines(updatedBaselines);
        
        console.log('Baseline renamed:', baselineId, 'to', newName);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'rename_baseline', 
            baselineId,
            newName 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to rename baseline:', error);
    }
  };

  const handleViewBaseline = (baseline: Baseline) => {
    console.log('Viewing baseline:', baseline.name);
    // In a real app, this would open a detailed view modal
  };

  const handleCompareBaselines = () => {
    setIsCompareBaselinesModalOpen(true);
  };

  const handleCompareBaseline = async (baselineId: string) => {
    setBaselinesLoading(prev => ({ ...prev, compare: true }));
    try {
      const result = await baselineService.setActiveBaseline(baselineId, 'demo');
      
      if (result.success) {
        setActiveBaselineId(baselineId);
        
        console.log('Baseline comparison activated:', baselineId);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'compare_baseline', 
            baselineId 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to compare baseline:', error);
    } finally {
      setBaselinesLoading(prev => ({ ...prev, compare: false }));
    }
  };

  const handleClearBaselineComparison = async () => {
    try {
      const result = await baselineService.setActiveBaseline(null, 'demo');
      
      if (result.success) {
        setActiveBaselineId(null);
        
        console.log('Baseline comparison cleared');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'clear_baseline_comparison'
          } 
        });
      }
    } catch (error) {
      console.error('Failed to clear baseline comparison:', error);
    }
  };

  // Properties handlers
  const handleManageFields = () => {
    setIsManageCustomFieldsModalOpen(true);
  };

  const handleCustomFieldsUpdated = async () => {
    // Refresh custom fields after modal closes
    try {
      const fields = await programmeCustomFieldsService.getProjectCustomFields('demo');
      setCustomFields(fields);
      
      console.log('Custom fields refreshed:', fields.length, 'fields');
      
      // Dispatch operation
      onTaskOperation({ 
        type: 'add', 
        data: { 
          action: 'custom_fields_updated'
        } 
      });
    } catch (error) {
      console.error('Failed to refresh custom fields:', error);
    }
  };

  const handleSaveFieldTemplate = async (template: Omit<FieldTemplate, 'id'>) => {
    setPropertiesLoading(prev => ({ ...prev, manage: true }));
    try {
      const result = await PropertiesService.saveFieldTemplate(template, 'demo');
      
      if (result.success && result.data) {
        // Refresh field templates
        const updatedTemplates = await PropertiesService.getFieldTemplates('demo');
        setFieldTemplates(updatedTemplates);
        
        console.log('Field template saved:', result.data.name);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'save_field_template', 
            template: result.data 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to save field template:', error);
    } finally {
      setPropertiesLoading(prev => ({ ...prev, manage: false }));
    }
  };

  const handleEditValues = () => {
    setIsEditFieldValuesModalOpen(true);
  };

  const handleSaveFieldValue = async (taskId: string, fieldId: string, value: any) => {
    try {
      const result = await PropertiesService.updateFieldValue(taskId, fieldId, value, 'demo');
      
      if (result.success) {
        // Update local state
        setTaskFieldValues(prev => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            [fieldId]: value
          }
        }));
        
        console.log('Field value updated:', taskId, fieldId, value);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'update_field_value', 
            taskId,
            fieldId,
            value 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to save field value:', error);
    }
  };

  const handleApplyTemplate = async (template: FieldTemplate) => {
    setPropertiesLoading(prev => ({ ...prev, templates: true }));
    try {
      const result = await PropertiesService.applyFieldTemplate(template, 'demo');
      
      if (result.success && result.data) {
        // Refresh custom fields
        const updatedFields = await PropertiesService.getCustomFields('demo');
        setCustomFields(updatedFields);
        
        console.log('Field template applied:', template.name);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'apply_field_template', 
            template: template.name 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to apply field template:', error);
    } finally {
      setPropertiesLoading(prev => ({ ...prev, templates: false }));
    }
  };

  // Structure handlers
  const handleRenumberTasks = async () => {
    const confirmed = window.confirm('Renumber all tasks in current view?');
    if (!confirmed) return;

    setStructureLoading(prev => ({ ...prev, renumber: true }));
    try {
      const result = await structureService.renumberTasks('demo', taskIdSettings, selectedTasks.length > 0 ? selectedTasks : undefined);
      
      if (result.success) {
        console.log('Tasks renumbered:', result.tasksUpdated, 'tasks updated');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'renumber_tasks', 
            tasksUpdated: result.tasksUpdated 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to renumber tasks:', error);
    } finally {
      setStructureLoading(prev => ({ ...prev, renumber: false }));
    }
  };

  const handleAutoIdSettings = () => {
    setIsAutoIdSettingsModalOpen(true);
  };

  const handleSaveAutoIdSettings = async (settings: TaskIdSettings) => {
    setStructureLoading(prev => ({ ...prev, autoIdSettings: true }));
    try {
      const result = await structureService.saveAutoIdSettings(settings, 'demo');
      
      if (result.success && result.data) {
        setTaskIdSettings(result.data);
        
        console.log('Auto ID settings saved:', result.data);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'save_auto_id_settings', 
            settings: result.data 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to save auto ID settings:', error);
    } finally {
      setStructureLoading(prev => ({ ...prev, autoIdSettings: false }));
    }
  };

  const handleSetWbsPrefix = () => {
    setIsSetWbsPrefixModalOpen(true);
  };

  const handleSaveWbsPrefix = async (settings: WbsPrefixSettings) => {
    setStructureLoading(prev => ({ ...prev, wbsPrefix: true }));
    try {
      const result = await structureService.saveWbsPrefix(settings, 'demo');
      
      if (result.success && result.data) {
        setCurrentWbsPrefix(settings.prefix);
        
        // Apply to selected tasks if scope is 'selected'
        if (settings.scope === 'selected' && selectedTasks.length > 0) {
          await structureService.applyWbsPrefixToTasks(settings.prefix, selectedTasks, 'demo');
        }
        
        console.log('WBS prefix saved:', result.data);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'save_wbs_prefix', 
            settings: result.data 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to save WBS prefix:', error);
    } finally {
      setStructureLoading(prev => ({ ...prev, wbsPrefix: false }));
    }
  };

  // Import/Export handlers
  const handleImportAsta = () => {
    setIsImportAstaModalOpen(true);
  };

  const handleImportAstaData = async (parsedData: ParsedProgramme) => {
    setImportExportLoading(prev => ({ ...prev, importAsta: true }));
    try {
      const result = await ImportExportService.importAstaData(parsedData, 'demo');
      
      if (result.success && result.data) {
        console.log('Asta data imported:', result.data.tasksImported, 'tasks');
        
        // Refresh import/export history
        const historyResult = await ImportExportService.getImportExportHistory('demo');
        setImportExportHistory(historyResult);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'import_asta_data', 
            tasksImported: result.data.tasksImported 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to import Asta data:', error);
    } finally {
      setImportExportLoading(prev => ({ ...prev, importAsta: false }));
    }
  };

  const handleExportAsta = () => {
    setIsExportAstaModalOpen(true);
  };

  const handleExportAstaData = async (settings: AstaExportSettings) => {
    setImportExportLoading(prev => ({ ...prev, exportAsta: true }));
    try {
      const result = await ImportExportService.exportToAsta(settings, 'demo');
      
      if (result.success) {
        console.log('Programme exported to Asta:', result.fileName);
        
        // Refresh import/export history
        const historyResult = await ImportExportService.getImportExportHistory('demo');
        setImportExportHistory(historyResult);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'export_asta_data', 
            fileName: result.fileName 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to export to Asta:', error);
    } finally {
      setImportExportLoading(prev => ({ ...prev, exportAsta: false }));
    }
  };

  const handleExport = async (format: 'excel' | 'json') => {
    setImportExportLoading(prev => ({ ...prev, export: true }));
    try {
      let result;
      if (format === 'excel') {
        result = await ImportExportService.exportToExcel('demo');
      } else {
        result = await ImportExportService.exportToJSON('demo');
      }
      
      if (result.success) {
        console.log(`Programme exported to ${format}:`, result.fileName);
        
        // Refresh import/export history
        const historyResult = await ImportExportService.getImportExportHistory('demo');
        setImportExportHistory(historyResult);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: `export_${format}`, 
            fileName: result.fileName 
          } 
        });
      }
    } catch (error) {
      console.error(`Failed to export to ${format}:`, error);
    } finally {
      setImportExportLoading(prev => ({ ...prev, export: false }));
    }
  };

  // Only render when Project tab is active
  if (activeRibbonTab !== 'Project') {
    return null;
  }

  return (
    <div className="ribbon-tab-content">
      <div className="ribbon-sections">
        {/* Information Section */}
        <InformationSection
          currentStatus={projectStatus}
          onProjectDetails={handleProjectDetails}
          onProjectNotes={handleProjectNotes}
          onStatusChange={handleStatusChange}
          loading={informationLoading}
        />

        {/* Calendar Section */}
        <CalendarSection
          calendars={calendars}
          currentCalendar={currentCalendar}
          onProjectCalendar={handleProjectCalendar}
          onManageCalendars={handleManageCalendars}
          onApplyToProject={handleApplyToProject}
          onApplyToTasks={handleApplyToTasks}
          loading={calendarLoading}
          hasSelectedTasks={selectedTasks.length > 0}
        />

        {/* Constraints Section */}
        <ConstraintsSection
          onSetConstraint={handleSetConstraint}
          onClearConstraint={handleClearConstraint}
          onConstraintReport={handleConstraintReport}
          loading={constraintsLoading}
          hasSelectedTasks={selectedTasks.length > 0}
        />

        {/* Baselines Section */}
        <BaselinesSection
          onSetBaseline={handleSetBaseline}
          onManageBaselines={handleManageBaselines}
          onCompareBaselines={handleCompareBaselines}
          loading={baselinesLoading}
        />

        {/* Version Controls Section */}
        <VersionControls
          projectId="demo"
          currentTasks={[]} // This should be passed from parent component
          onVersionChange={(version) => {
            console.log('Version changed:', version);
            // Handle version change
          }}
        />

        {/* Properties Section */}
        <PropertiesSection
          onManageFields={handleManageFields}
          onEditValues={handleEditValues}
          onApplyTemplate={handleApplyTemplate}
          templates={fieldTemplates}
          loading={propertiesLoading}
          hasSelectedTasks={selectedTasks.length > 0}
        />

        {/* Structure Section */}
        <StructureSection
          onRenumberTasks={handleRenumberTasks}
          onAutoIdSettings={handleAutoIdSettings}
          onSetWbsPrefix={handleSetWbsPrefix}
          loading={structureLoading}
        />

        {/* Import/Export Section */}
        <ImportExportSection
          onImportAsta={handleImportAsta}
          onExportAsta={handleExportAsta}
          onExport={handleExport}
          loading={importExportLoading}
        />

        {/* Audit Section */}
        <AuditSection
          projectId="demo"
          projectName={projectDetails.name}
          disabled={!canEdit}
        />
      </div>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onSave={handleSaveProjectDetails}
        details={projectDetails}
        isDemoMode={true}
      />

      {/* Project Notes Modal */}
      <ProjectNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        onSave={handleSaveProjectNotes}
        notes={projectNotes}
        isDemoMode={true}
      />

      {/* Project Calendar Modal */}
      {currentCalendar && (
        <ProjectCalendarModal
          isOpen={isProjectCalendarModalOpen}
          onClose={() => setIsProjectCalendarModalOpen(false)}
          onSave={handleSaveProjectCalendar}
          calendar={currentCalendar}
          isDemoMode={true}
        />
      )}

      {/* Manage Calendars Modal */}
      <ManageCalendarsModal
        isOpen={isManageCalendarsModalOpen}
        onClose={() => setIsManageCalendarsModalOpen(false)}
        calendars={calendars}
        onSave={handleSaveCalendar}
        onDelete={handleDeleteCalendar}
        onClone={handleCloneCalendar}
        isDemoMode={true}
      />

      {/* Calendar Manager Modal */}
      <CalendarManagerModal
        isOpen={isCalendarManagerModalOpen}
        onClose={() => setIsCalendarManagerModalOpen(false)}
        projectId="demo"
        onCalendarChange={() => {
          // Reload calendars when they change
          loadProjectData();
        }}
      />

      {/* Set Constraint Modal */}
      <SetConstraintModal
        isOpen={isSetConstraintModalOpen}
        onClose={() => setIsSetConstraintModalOpen(false)}
        onSave={handleSaveConstraint}
        selectedTasks={selectedTasks}
        isDemoMode={true}
      />

      {/* Constraint Report Modal */}
      <ConstraintReportModal
        isOpen={isConstraintReportModalOpen}
        onClose={() => setIsConstraintReportModalOpen(false)}
        constrainedTasks={constrainedTasks}
        isDemoMode={true}
      />

      {/* Set Baseline Modal */}
      <SetBaselineModal
        isOpen={isSetBaselineModalOpen}
        onClose={() => setIsSetBaselineModalOpen(false)}
        onSave={handleSaveBaseline}
        isDemoMode={true}
        currentUser="Demo User"
      />

      {/* Manage Baselines Modal */}
      <ManageBaselinesModal
        isOpen={isManageBaselinesModalOpen}
        onClose={() => setIsManageBaselinesModalOpen(false)}
        baselines={baselines}
        onDelete={handleDeleteBaseline}
        onRename={handleRenameBaseline}
        onView={handleViewBaseline}
        isDemoMode={true}
      />

      {/* Compare Baselines Modal */}
      <CompareBaselinesModal
        isOpen={isCompareBaselinesModalOpen}
        onClose={() => setIsCompareBaselinesModalOpen(false)}
        baselines={baselines}
        activeBaselineId={activeBaselineId || undefined}
        onCompare={handleCompareBaseline}
        onClearComparison={handleClearBaselineComparison}
        isDemoMode={true}
      />

      {/* Custom Fields Manager Modal */}
      <CustomFieldsManagerModal
        isOpen={isManageCustomFieldsModalOpen}
        onClose={() => {
          setIsManageCustomFieldsModalOpen(false);
          handleCustomFieldsUpdated();
        }}
        projectId="demo"
      />

      {/* Edit Field Values Modal */}
      <EditFieldValuesModal
        isOpen={isEditFieldValuesModalOpen}
        onClose={() => setIsEditFieldValuesModalOpen(false)}
        customFields={customFields}
        selectedTasks={selectedTasks}
        taskFieldValues={taskFieldValues}
        onSaveValues={handleSaveFieldValue}
        isDemoMode={true}
      />

      {/* Auto ID Settings Modal */}
      <AutoIdSettingsModal
        isOpen={isAutoIdSettingsModalOpen}
        onClose={() => setIsAutoIdSettingsModalOpen(false)}
        onSave={handleSaveAutoIdSettings}
        currentSettings={taskIdSettings || undefined}
        isDemoMode={true}
      />

      {/* Set WBS Prefix Modal */}
      <SetWbsPrefixModal
        isOpen={isSetWbsPrefixModalOpen}
        onClose={() => setIsSetWbsPrefixModalOpen(false)}
        onSave={handleSaveWbsPrefix}
        currentPrefix={currentWbsPrefix}
        selectedTasksCount={selectedTasks.length}
        isDemoMode={true}
      />

      {/* Import Asta Modal */}
      <ImportAstaModal
        isOpen={isImportAstaModalOpen}
        onClose={() => setIsImportAstaModalOpen(false)}
        onImport={handleImportAstaData}
        isDemoMode={true}
      />

      {/* Export Asta Modal */}
      <ExportAstaModal
        isOpen={isExportAstaModalOpen}
        onClose={() => setIsExportAstaModalOpen(false)}
        onExport={handleExportAstaData}
        projectName={projectDetails.name}
        isDemoMode={true}
      />

      {/* Working Calendar Modal */}
      <WorkingCalendarModal
        isOpen={isWorkingCalendarModalOpen}
        onClose={() => setIsWorkingCalendarModalOpen(false)}
        projectId="demo-project"
        onSave={handleSaveWorkingCalendar}
      />

      {/* Import/Export History Section */}
      <ImportExportSection
        history={importExportHistory}
        onImportAsta={handleImportAsta}
        onExportAsta={handleExportAsta}
        onExportExcel={() => handleExport('excel')}
        onExportJSON={() => handleExport('json')}
        loading={importExportLoading}
      />
    </div>
  );
};

export default ProjectTab; 