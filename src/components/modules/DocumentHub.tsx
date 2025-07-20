import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArchiveBoxIcon,
  ClockIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  TagIcon,
  XMarkIcon,
  Bars3Icon,
  XMarkIcon as CloseIcon,
} from '@heroicons/react/24/outline';
import {
  Brain,
  Sparkles,
  Lightbulb,
  FileText,
  Wand2,
  Workflow,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DocumentBuilder from './DocumentBuilder';
import DocumentWizard from './DocumentWizard';
import { documentService } from '../../services/documentService';
import type { Document } from '../../services/documentService';
import { documentAnalytics } from '../../services/documentAnalytics';
import { apiIntegration } from '../../services/apiIntegration';
import { cloudStorageService } from '../../services/cloudStorageService';
import { aiService } from '../../services/aiService';
import { workflowService } from '../../services/workflowService';
import { useNavigate, useLocation } from 'react-router-dom';
import CloudStorageIntegration from './CloudStorageIntegration';

interface DocumentCategory {
  color: string;
  description: string;
  icon: string;
  id: string;
  name: string;
}

interface DocumentHubProps {
  activeTab?: 'library' | 'builder' | 'archive';
  onNavigateToModule?: (module: string) => void;
}

const DocumentHub: React.FC<DocumentHubProps> = ({
  activeTab: initialActiveTab = 'library',
  onNavigateToModule,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'library' | 'builder' | 'archive'>(
    initialActiveTab
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<
    'all' | 'templates' | 'documents'
  >('all');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt'>(
    'title'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showDocumentBuilder, setShowDocumentBuilder] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentBuilderMode, setDocumentBuilderMode] = useState<
    'create' | 'edit' | 'template'
  >('create');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [connectedIntegrations, setConnectedIntegrations] = useState<any[]>([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedDocumentForSync, setSelectedDocumentForSync] =
    useState<Document | null>(null);
  const [userPermissions, setUserPermissions] = useState<{
    canCreateCategories: boolean;
    role: string;
  }>({ canCreateCategories: false, role: 'none' });

  // Cloud storage integration state
  const [cloudStorageSettings, setCloudStorageSettings] = useState<any>(null);
  const [connectedProviders, setConnectedProviders] = useState<any[]>([]);
  const [showCloudStorageModal, setShowCloudStorageModal] = useState(false);

  // AI Features state
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedDocumentForAI, setSelectedDocumentForAI] =
    useState<Document | null>(null);
  const [aiAction, setAiAction] = useState<
    'summarize' | 'suggest' | 'analyze' | 'improve'
  >('summarize');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');

  // Workflow Features state
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [selectedDocumentForWorkflow, setSelectedDocumentForWorkflow] =
    useState<Document | null>(null);
  const [availableWorkflows, setAvailableWorkflows] = useState<any[]>([]);
  const [documentWorkflow, setDocumentWorkflow] = useState<any>(null);
  const [showWizard, setShowWizard] = useState(false);

  // Mobile-specific state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Update active tab when prop changes
  useEffect(() => {
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  // Handle tab navigation
  const handleTabChange = (tab: 'library' | 'builder' | 'archive') => {
    setActiveTab(tab);
    // Update the URL when a tab is clicked
    switch (tab) {
      case 'library':
        navigate('/library');
        break;
      case 'builder':
        navigate('/document-builder');
        break;
      case 'archive':
        navigate('/archive');
        break;
    }
    if (onNavigateToModule) {
      switch (tab) {
        case 'library':
          onNavigateToModule('document-hub-library');
          break;
        case 'builder':
          onNavigateToModule('document-builder');
          break;
        case 'archive':
          onNavigateToModule('document-hub-archive');
          break;
      }
    }
  };

  const [categories, setCategories] = useState<DocumentCategory[]>([]);

  // Load user permissions and categories
  useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        const permissions = await documentService.checkUserPermissions();
        setUserPermissions(permissions);
      } catch (error) {
        console.error('Error loading user permissions:', error);
        // Set default permissions
        setUserPermissions({ canCreateCategories: false, role: 'user' });
      }
    };

    const loadCategories = async () => {
      try {
        const fetchedCategories = await documentService.getDocumentCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories if database fails
        setCategories([
          {
            id: 'contracts',
            name: 'Contracts',
            description: 'Legal contracts and agreements',
            icon: 'DocumentTextIcon',
            color: 'bg-blue-500',
          },
          {
            id: 'proposals',
            name: 'Proposals',
            description: 'Project proposals and quotes',
            icon: 'DocumentTextIcon',
            color: 'bg-green-500',
          },
          {
            id: 'reports',
            name: 'Reports',
            description: 'Business reports and analytics',
            icon: 'DocumentTextIcon',
            color: 'bg-purple-500',
          },
          {
            id: 'forms',
            name: 'Forms',
            description: 'Standard forms and templates',
            icon: 'DocumentTextIcon',
            color: 'bg-orange-500',
          },
          {
            id: 'policies',
            name: 'Policies',
            description: 'Company policies and procedures',
            icon: 'DocumentTextIcon',
            color: 'bg-red-500',
          },
          {
            id: 'templates',
            name: 'Templates',
            description: 'Document templates',
            icon: 'DocumentTextIcon',
            color: 'bg-indigo-500',
          },
        ]);
      }
    };

    const loadConnectedIntegrations = async () => {
      try {
        const integrations = await apiIntegration.getConnectedIntegrations();
        setConnectedIntegrations(integrations);
      } catch (error) {
        console.error('Error loading connected integrations:', error);
        setConnectedIntegrations([]);
      }
    };

    const loadAvailableWorkflows = async () => {
      try {
        const workflows = await workflowService.getWorkflows();
        setAvailableWorkflows(workflows);
      } catch (error) {
        console.error('Error loading available workflows:', error);
        setAvailableWorkflows([]);
      }
    };

    const loadCloudStorageData = async () => {
      try {
        const [settings, providers] = await Promise.all([
          cloudStorageService.getSyncSettings(),
          cloudStorageService.getConnectedProviders()
        ]);
        setCloudStorageSettings(settings);
        setConnectedProviders(providers);
      } catch (error) {
        console.error('Error loading cloud storage data:', error);
      }
    };

    loadUserPermissions();
    loadCategories();
    loadConnectedIntegrations();
    loadAvailableWorkflows();
    loadCloudStorageData();
  }, []);

  // Load documents from database
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const fetchedDocuments = await documentService.getDocuments();
        setDocuments(fetchedDocuments);
        setFilteredDocuments(fetchedDocuments);
      } catch (error) {
        console.error('Error loading documents:', error);
        // Fallback to empty array if database fails
        setDocuments([]);
        setFilteredDocuments([]);
      }
    };

    loadDocuments();
  }, []);

  // Filter and sort documents
  useEffect(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesCategory =
        selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesType =
        selectedType === 'all' ||
        (selectedType === 'templates' && doc.is_template) ||
        (selectedType === 'documents' && !doc.is_template);
      return matchesSearch && matchesCategory && matchesType;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDocuments(filtered);
  }, [
    documents,
    searchTerm,
    selectedCategory,
    selectedType,
    sortBy,
    sortOrder,
  ]);

  const handleUseTemplate = (template: Document) => {
    // Open template in builder for editing (don't create copy immediately)
    setSelectedDocument(template);
    setDocumentBuilderMode('template');
    setShowDocumentBuilder(true);
  };

  const handleDuplicateDocument = async (document: Document) => {
    try {
      // Create demo duplicate document
      const duplicatedDoc: Document = {
        ...document,
        id: Date.now().toString(),
        title: `${document.title} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add to documents list
      const updatedDocuments = [...documents, duplicatedDoc];
      setDocuments(updatedDocuments);
      setFilteredDocuments(updatedDocuments);

      setSelectedDocument(duplicatedDoc);
      setDocumentBuilderMode('edit');
      setShowDocumentBuilder(true);

      // Track document duplicate analytics
      documentAnalytics.trackDocumentEdit(document.id, 'duplicate', {
        action: 'duplicate_document',
        document_title: document.title,
        new_document_id: duplicatedDoc.id,
      });
    } catch (error) {
      console.error('Error duplicating document:', error);
      alert('Failed to duplicate document');
    }
  };

  const handleEditDocument = (document: Document) => {
    console.log('handleEditDocument called for document:', document.title);
    setSelectedDocument(document);
    setDocumentBuilderMode('edit');
    setShowDocumentBuilder(true);
    console.log('showDocumentBuilder set to true for edit');

    // Track document edit analytics
    documentAnalytics.trackDocumentEdit(document.id, 'update', {
      action: 'edit_document',
      document_title: document.title,
    });
  };

  const handleCreateDocument = (mode: 'create' | 'template' = 'create') => {
    console.log('handleCreateDocument called with mode:', mode);
    setSelectedDocument(null);
    setDocumentBuilderMode(mode);
    setShowDocumentBuilder(true);
    console.log('showDocumentBuilder set to true');
  };

  const handleArchiveDocument = async (document: Document) => {
    try {
      // Update document locally
      const updatedDocuments = documents.map(doc =>
        doc.id === document.id
          ? { ...doc, is_archived: true, updated_at: new Date().toISOString() }
          : doc
      );
      setDocuments(updatedDocuments);
      setFilteredDocuments(updatedDocuments);

      // Track document archive analytics
      documentAnalytics.trackDocumentEdit(document.id, 'archive', {
        action: 'archive_document',
        document_title: document.title,
      });
    } catch (error) {
      console.error('Error archiving document:', error);
      alert('Failed to archive document');
    }
  };

  const handleDeleteDocument = async (document: Document) => {
    try {
      // Remove document locally
      const updatedDocuments = documents.filter(doc => doc.id !== document.id);
      setDocuments(updatedDocuments);
      setFilteredDocuments(updatedDocuments);

      // Track document delete analytics
      documentAnalytics.trackDocumentEdit(document.id, 'delete', {
        action: 'delete_document',
        document_title: document.title,
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const handleDocumentSaved = async (savedDocument: Document) => {
    console.log('Document saved:', savedDocument);
    
    // Update documents locally
    const updatedDocuments = documents.map(doc =>
      doc.id === savedDocument.id ? savedDocument : doc
    );
    if (!documents.find(doc => doc.id === savedDocument.id)) {
      updatedDocuments.push(savedDocument);
    }
    setDocuments(updatedDocuments);
    setFilteredDocuments(updatedDocuments);

    // Sync to cloud storage if connected and enabled
    if (cloudStorageSettings?.defaultStorage !== 'local' && connectedProviders.length > 0) {
      try {
        const defaultProvider = cloudStorageSettings.defaultStorage;
        const result = await cloudStorageService.uploadDocument(
          defaultProvider,
          savedDocument
        );
        
        if (result.success) {
          console.log(`Document synced to ${defaultProvider}:`, result.message);
        } else {
          console.warn(`Failed to sync document to ${defaultProvider}:`, result.message);
        }
      } catch (error) {
        console.error('Error syncing document to cloud storage:', error);
      }
    }

    setShowDocumentBuilder(false);
  };

  const handleCloseDocumentBuilder = () => {
    console.log('handleCloseDocumentBuilder called');
    setShowDocumentBuilder(false);
  };

  const canEditDocument = (document: Document) => {
    return (
      user?.role === 'super_admin' ||
      user?.role === 'admin' ||
      document.created_by === user?.email
    );
  };

  const canDeleteDocument = (document: Document) => {
    return user?.role === 'super_admin' || user?.role === 'admin';
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const newCategory = await documentService.createDocumentCategory({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim(),
          icon: 'DocumentTextIcon',
          color: 'bg-gray-500',
        });

        // Refresh categories from database
        const updatedCategories = await documentService.getDocumentCategories();
        setCategories(updatedCategories);

        setNewCategoryName('');
        setNewCategoryDescription('');
        setShowAddCategoryModal(false);
      } catch (error) {
        console.error('Error creating category:', error);
        alert(
          'Failed to create category. You may not have permission or the category name may already exist.'
        );
      }
    }
  };

  const handleSyncDocument = async (
    document: Document,
    integrationId: string,
    direction: 'upload' | 'download' | 'bidirectional'
  ) => {
    try {
      const result = await apiIntegration.syncDocument(
        document.id,
        integrationId,
        direction
      );
      if (result.success) {
        alert(`Document synced successfully with ${integrationId}`);
      } else {
        alert(`Sync failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error syncing document:', error);
      alert('Failed to sync document');
    }
  };

  const handleOpenSyncModal = (document: Document) => {
    setSelectedDocumentForSync(document);
    setShowSyncModal(true);
  };

  // AI Features handlers
  const handleOpenAIModal = (
    document: Document,
    action: 'summarize' | 'suggest' | 'analyze' | 'improve'
  ) => {
    setSelectedDocumentForAI(document);
    setAiAction(action);
    setShowAIModal(true);
    setAiResult('');
  };

  const handleAIAction = async () => {
    if (!selectedDocumentForAI) return;

    setAiLoading(true);
    try {
      let result: string = '';

      switch (aiAction) {
        case 'summarize':
          const summary = await aiService.summarizeDocument(
            selectedDocumentForAI.id,
            selectedDocumentForAI.content || ''
          );
          result = `Summary: ${summary.content}\n\nKey Points:\n${summary.key_points.map(point => `• ${point}`).join('\n')}`;
          break;
        case 'suggest':
          const suggestions = await aiService.generateSuggestions(
            selectedDocumentForAI.id,
            selectedDocumentForAI.content || ''
          );
          result = `Suggestions:\n${suggestions.map(s => `• ${s.explanation} (${s.suggestion_type})`).join('\n')}`;
          break;
        case 'analyze':
          const analysis = await aiService.analyzeDocument(
            selectedDocumentForAI.id,
            selectedDocumentForAI.content || ''
          );
          result = `Analysis:\n• Readability: ${analysis['readability_score']}/100\n• Tone: ${analysis['tone']}\n• Complexity: ${analysis['complexity']}\n• Reading Time: ${analysis['estimated_reading_time']} minutes\n• Key Themes: ${analysis['key_themes'].join(', ')}`;
          break;
        case 'improve':
          const improved = await aiService.improveContent(
            selectedDocumentForAI.content || '',
            'clarity'
          );
          result = `Improved Version:\n${improved}`;
          break;
      }

      setAiResult(result);

      // Track AI usage analytics
      documentAnalytics.trackDocumentEdit(selectedDocumentForAI.id, 'update', {
        action: `ai_${aiAction}`,
        document_title: selectedDocumentForAI.title,
      });
    } catch (error) {
      console.error('Error performing AI action:', error);
      setAiResult('Error: Failed to perform AI action. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Workflow Features handlers
  const handleOpenWorkflowModal = async (document: Document) => {
    setSelectedDocumentForWorkflow(document);

    // Check if document already has a workflow
    try {
      const existingWorkflow = await workflowService.getDocumentWorkflow(
        document.id
      );
      setDocumentWorkflow(existingWorkflow);
    } catch (error) {
      console.error('Error checking document workflow:', error);
      setDocumentWorkflow(null);
    }

    setShowWorkflowModal(true);
  };

  const handleInitiateWorkflow = async (workflowId: string) => {
    if (!selectedDocumentForWorkflow) return;

    try {
      const workflow = await workflowService.initiateDocumentWorkflow(
        selectedDocumentForWorkflow.id,
        workflowId
      );
      setDocumentWorkflow(workflow);
      alert('Workflow initiated successfully');

      // Track workflow analytics
      documentAnalytics.trackDocumentEdit(
        selectedDocumentForWorkflow.id,
        'update',
        {
          action: 'initiate_workflow',
          document_title: selectedDocumentForWorkflow.title,
          workflow_id: workflowId,
        }
      );
    } catch (error) {
      console.error('Error initiating workflow:', error);
      alert('Failed to initiate workflow');
    }
  };

  // If document builder is open, show it
  if (showDocumentBuilder) {
    return (
      <DocumentBuilder
        {...(selectedDocument && { document: selectedDocument })}
        onSave={handleDocumentSaved}
        onClose={handleCloseDocumentBuilder}
        mode={documentBuilderMode}
      />
    );
  }

  const canCreateCategories =
    user?.role === 'super_admin' || userPermissions.canCreateCategories;

  return (
    <div className='h-full bg-gray-50 dark:bg-gray-900 flex flex-col'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className='lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
            >
              <Bars3Icon className='h-6 w-6 text-gray-600 dark:text-gray-400' />
            </button>
            <div>
              <h1 className='text-xl lg:text-2xl font-bold text-gray-900 dark:text-white'>
                Document Hub
              </h1>
              <p className='text-sm lg:text-base text-gray-600 dark:text-gray-400'>
                Manage and create document templates
              </p>
              {cloudStorageSettings?.defaultStorage !== 'local' && connectedProviders.length > 0 && (
                <div className='flex items-center gap-2 mt-1'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-xs text-green-600 dark:text-green-400'>
                    Syncing to {cloudStorageSettings.defaultStorage.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setShowWizard(true)}
              className='bg-constructbms-blue hover:bg-constructbms-black text-black hover:text-white px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm lg:text-base'
            >
              <Sparkles className='h-4 w-4 lg:h-5 lg:w-5' />
              <span className='hidden sm:inline'>Document Wizard</span>
              <span className='sm:hidden'>Wizard</span>
            </button>
            <button
              onClick={() => handleCreateDocument('create')}
              className='bg-green-500 hover:bg-green-600 text-white px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm lg:text-base'
            >
              <PlusIcon className='h-4 w-4 lg:h-5 lg:w-5' />
              <span className='hidden sm:inline'>Create Document</span>
              <span className='sm:hidden'>Create</span>
            </button>
            <button
              onClick={() => handleCreateDocument('template')}
              className='bg-blue-500 hover:bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm lg:text-base'
            >
              <DocumentTextIcon className='h-4 w-4 lg:h-5 lg:w-5' />
              <span className='hidden sm:inline'>New Template</span>
              <span className='sm:hidden'>Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between px-4 lg:px-6'>
          <div className='flex space-x-4 lg:space-x-8 overflow-x-auto'>
            <button
              onClick={() => handleTabChange('library')}
              className={`py-3 lg:py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap text-sm lg:text-base ${
                activeTab === 'library'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <DocumentTextIcon className='h-4 w-4 lg:h-5 lg:w-5 inline mr-1 lg:mr-2' />
              Library
            </button>
            <button
              onClick={() => handleTabChange('builder')}
              className={`py-3 lg:py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap text-sm lg:text-base ${
                activeTab === 'builder'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <PencilIcon className='h-4 w-4 lg:h-5 lg:w-5 inline mr-1 lg:mr-2' />
              Document Builder
            </button>
            <button
              onClick={() => handleTabChange('archive')}
              className={`py-3 lg:py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap text-sm lg:text-base ${
                activeTab === 'archive'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <ArchiveBoxIcon className='h-4 w-4 lg:h-5 lg:w-5 inline mr-1 lg:mr-2' />
              Archive & Rollback
            </button>
          </div>

          {/* View Mode Toggles - Only show in library */}
          {activeTab === 'library' && (
            <div className='flex items-center gap-2'>
              <span className='text-xs lg:text-sm text-gray-500 dark:text-gray-400 mr-1 lg:mr-2'>
                View:
              </span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 lg:p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title='Grid View'
              >
                <svg
                  className='h-4 w-4 lg:h-5 lg:w-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 lg:p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title='List View'
              >
                <svg
                  className='h-4 w-4 lg:h-5 lg:w-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-hidden'>
        {activeTab === 'library' && (
          <div className='h-full flex'>
            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
              <div
                className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
                onClick={() => setIsMobileSidebarOpen(false)}
              />
            )}

            {/* Sidebar - Filters */}
            <div
              className={`${
                isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 transition-transform duration-300 ease-in-out lg:transition-none`}
            >
              <div className='flex items-center justify-between mb-4 lg:hidden'>
                <h3 className='font-semibold text-gray-900 dark:text-white'>
                  Filters
                </h3>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className='p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700'
                >
                  <CloseIcon className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                </button>
              </div>

              {/* Type Filter */}
              <div className='mb-6'>
                <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Document Type
                </h4>
                <div className='space-y-1'>
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      selectedType === 'all'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    All ({documents.length})
                  </button>
                  <button
                    onClick={() => setSelectedType('templates')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      selectedType === 'templates'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Templates ({documents.filter(d => d.is_template).length})
                  </button>
                  <button
                    onClick={() => setSelectedType('documents')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      selectedType === 'documents'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Documents ({documents.filter(d => !d.is_template).length})
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className='mb-6'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Categories
                  </h4>
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    disabled={!canCreateCategories}
                    className={`text-sm ${
                      canCreateCategories
                        ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                        : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                    title={
                      canCreateCategories
                        ? 'Add new category'
                        : 'Insufficient permissions to create categories'
                    }
                  >
                    <PlusIcon className='h-4 w-4' />
                  </button>
                </div>
                <div className='space-y-1 max-h-48 overflow-y-auto'>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      selectedCategory === 'all'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                        selectedCategory === category.id
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${category.color}`}
                      ></div>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className='flex-1 flex flex-col'>
              {/* Search and Filters */}
              <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4'>
                <div className='flex flex-col lg:flex-row items-stretch lg:items-center gap-4'>
                  <div className='flex-1 relative'>
                    <MagnifyingGlassIcon className='h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                    <input
                      type='text'
                      placeholder='Search documents...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className='flex-1 lg:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm'
                    >
                      <option value='title'>Sort by Title</option>
                      <option value='createdAt'>Sort by Created</option>
                      <option value='updatedAt'>Sort by Updated</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      }
                      className='p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Documents List */}
              <div className='flex-1 overflow-y-auto p-4'>
                {filteredDocuments.length === 0 ? (
                  <div className='text-center py-12'>
                    <DocumentTextIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                      No documents found
                    </h3>
                    <p className='text-gray-600 dark:text-gray-400 mb-4'>
                      Try adjusting your filters or create a new document
                    </p>
                    <button
                      onClick={() => handleCreateDocument('create')}
                      className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors'
                    >
                      Create Document
                    </button>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-4'
                    }
                  >
                    {filteredDocuments.map(document => (
                      <div
                        key={document.id}
                        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow ${
                          viewMode === 'grid' ? 'p-4' : 'p-4'
                        }`}
                      >
                        <div
                          className={
                            viewMode === 'grid'
                              ? 'space-y-3'
                              : 'flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4'
                          }
                        >
                          <div className='flex-1'>
                            <div className='flex flex-wrap items-center gap-2 mb-2'>
                              <h3 className='font-semibold text-gray-900 dark:text-white text-sm lg:text-base'>
                                {document.title}
                              </h3>
                              {document.is_template && (
                                <span className='bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full'>
                                  Template
                                </span>
                              )}
                              <span className='bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full'>
                                v{document.version}
                              </span>
                            </div>
                            <p className='text-gray-600 dark:text-gray-400 text-sm mb-2'>
                              {document.description}
                            </p>
                            <div className='flex flex-wrap items-center gap-2 mb-3'>
                              {document.tags.map(tag => (
                                <span
                                  key={tag}
                                  className='bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full'
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className='text-xs text-gray-500 dark:text-gray-400'>
                              Created by {document.created_by} on{' '}
                              {new Date(
                                document.created_at
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div
                            className={`flex flex-wrap items-center gap-2 ${viewMode === 'grid' ? 'mt-4' : ''}`}
                          >
                            {document.is_template ? (
                              <button
                                onClick={() => handleUseTemplate(document)}
                                className='bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm transition-colors'
                                title='Use this template to create a new document'
                              >
                                Use Template
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleDuplicateDocument(document)
                                }
                                className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors'
                                title='Create a copy of this document'
                              >
                                Duplicate
                              </button>
                            )}
                            {canEditDocument(document) && (
                              <button
                                onClick={() => handleEditDocument(document)}
                                className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors'
                                title='Edit this document'
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleArchiveDocument(document)}
                              className='bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-sm transition-colors'
                              title='Archive this document'
                            >
                              Archive
                            </button>
                            {canDeleteDocument(document) && (
                              <button
                                onClick={() => handleDeleteDocument(document)}
                                className='bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition-colors'
                                title='Delete this document'
                              >
                                Delete
                              </button>
                            )}
                            {connectedIntegrations.length > 0 && (
                              <button
                                onClick={() => handleOpenSyncModal(document)}
                                className='bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded text-sm transition-colors'
                                title='Sync with external services'
                              >
                                Sync
                              </button>
                            )}
                            {/* AI Features */}
                            <div className='flex items-center gap-1'>
                              <button
                                onClick={() =>
                                  handleOpenAIModal(document, 'summarize')
                                }
                                className='bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1.5 rounded text-xs transition-colors'
                                title='AI Summarize'
                              >
                                <FileText className='w-3 h-3' />
                              </button>
                              <button
                                onClick={() =>
                                  handleOpenAIModal(document, 'suggest')
                                }
                                className='bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1.5 rounded text-xs transition-colors'
                                title='AI Suggestions'
                              >
                                <Lightbulb className='w-3 h-3' />
                              </button>
                              <button
                                onClick={() =>
                                  handleOpenAIModal(document, 'analyze')
                                }
                                className='bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 rounded text-xs transition-colors'
                                title='AI Analyze'
                              >
                                <Brain className='w-3 h-3' />
                              </button>
                              <button
                                onClick={() =>
                                  handleOpenAIModal(document, 'improve')
                                }
                                className='bg-pink-500 hover:bg-pink-600 text-white px-2 py-1.5 rounded text-xs transition-colors'
                                title='AI Improve'
                              >
                                <Wand2 className='w-3 h-3' />
                              </button>
                            </div>
                            {/* Workflow Features */}
                            <button
                              onClick={() => handleOpenWorkflowModal(document)}
                              className='bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-sm transition-colors'
                              title='Manage Workflow'
                            >
                              <Workflow className='w-3 h-3 inline mr-1' />
                              Workflow
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'builder' && (
          <div className='h-full bg-white dark:bg-gray-800 p-4 lg:p-6'>
            <div className='text-center'>
              <DocumentTextIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Document Builder
              </h2>
              <p className='text-gray-600 dark:text-gray-400 mb-6'>
                Create and edit document templates with our advanced editor
              </p>
              <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                <button
                  onClick={() => handleCreateDocument('create')}
                  className='w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors'
                >
                  <PlusIcon className='h-5 w-5' />
                  Create New Document
                </button>
                <button
                  onClick={() => handleCreateDocument('template')}
                  className='w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors'
                >
                  <DocumentTextIcon className='h-5 w-5' />
                  Create Template
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className='h-full bg-white dark:bg-gray-800 p-4 lg:p-6'>
            <div className='text-center'>
              <ArchiveBoxIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Archive & Rollback
              </h2>
              <p className='text-gray-600 dark:text-gray-400 mb-6'>
                View archived documents and restore previous versions
              </p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto'>
                <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
                  <ArchiveBoxIcon className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                  <h3 className='font-medium text-gray-900 dark:text-white mb-1'>
                    Archived Documents
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    View and restore archived documents
                  </p>
                </div>
                <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
                  <ClockIcon className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                  <h3 className='font-medium text-gray-900 dark:text-white mb-1'>
                    Version History
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Rollback to previous document versions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Archive Document
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              Are you sure you want to archive "{selectedDocument?.title}"? It
              will be moved to the archive section.
            </p>
            <div className='flex flex-col sm:flex-row justify-end gap-2'>
              <button
                onClick={() => setShowArchiveModal(false)}
                className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle archive logic here
                  setShowArchiveModal(false);
                }}
                className='bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-colors'
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Add New Category
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Category Name *
                </label>
                <input
                  type='text'
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder='Enter category name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Description
                </label>
                <textarea
                  value={newCategoryDescription}
                  onChange={e => setNewCategoryDescription(e.target.value)}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder='Enter category description'
                />
              </div>
            </div>
            <div className='flex flex-col sm:flex-row justify-end gap-2 mt-6'>
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
                className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className='bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded transition-colors'
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Delete Document
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              Are you sure you want to delete "{selectedDocument?.title}"? This
              action cannot be undone.
            </p>
            <div className='flex flex-col sm:flex-row justify-end gap-2'>
              <button
                onClick={() => setShowDeleteModal(false)}
                className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle delete logic here
                  setShowDeleteModal(false);
                }}
                className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Features Modal */}
      {showAIModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <Brain className='w-6 h-6 text-blue-600' />
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  AI {aiAction.charAt(0).toUpperCase() + aiAction.slice(1)} -{' '}
                  {selectedDocumentForAI?.title}
                </h3>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              >
                <XMarkIcon className='w-6 h-6' />
              </button>
            </div>

            <div className='flex-1 overflow-y-auto space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Document Content
                </label>
                <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-32 overflow-y-auto text-sm text-gray-600 dark:text-gray-400'>
                  {selectedDocumentForAI?.content || 'No content available'}
                </div>
              </div>

              <div className='flex justify-center'>
                <button
                  onClick={handleAIAction}
                  disabled={aiLoading}
                  className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors'
                >
                  {aiLoading ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className='w-4 h-4' />
                      {aiAction === 'summarize' && 'Generate Summary'}
                      {aiAction === 'suggest' && 'Generate Suggestions'}
                      {aiAction === 'analyze' && 'Analyze Document'}
                      {aiAction === 'improve' && 'Improve Content'}
                    </>
                  )}
                </button>
              </div>

              {aiResult && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    AI Result
                  </label>
                  <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800'>
                    <pre className='whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono'>
                      {aiResult}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && selectedDocumentForSync && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Sync "{selectedDocumentForSync.title}"
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              Choose an integration and sync direction:
            </p>
            <div className='space-y-3 mb-6'>
              {connectedIntegrations.map(integration => (
                <div
                  key={integration.integration_id}
                  className='border border-gray-200 dark:border-gray-700 rounded-lg p-3'
                >
                  <h4 className='font-medium text-gray-900 dark:text-white mb-2 capitalize'>
                    {integration.integration_id.replace('_', ' ')}
                  </h4>
                  <div className='flex gap-2'>
                    <button
                      onClick={() =>
                        handleSyncDocument(
                          selectedDocumentForSync,
                          integration.integration_id,
                          'upload'
                        )
                      }
                      className='flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors'
                    >
                      Upload
                    </button>
                    <button
                      onClick={() =>
                        handleSyncDocument(
                          selectedDocumentForSync,
                          integration.integration_id,
                          'download'
                        )
                      }
                      className='flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors'
                    >
                      Download
                    </button>
                    <button
                      onClick={() =>
                        handleSyncDocument(
                          selectedDocumentForSync,
                          integration.integration_id,
                          'bidirectional'
                        )
                      }
                      className='flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm transition-colors'
                    >
                      Sync Both
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className='flex justify-end'>
              <button
                onClick={() => setShowSyncModal(false)}
                className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Modal */}
      {showWorkflowModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <Workflow className='w-6 h-6 text-orange-600' />
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Workflow Management - {selectedDocumentForWorkflow?.title}
                </h3>
              </div>
              <button
                onClick={() => setShowWorkflowModal(false)}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              >
                <XMarkIcon className='w-6 h-6' />
              </button>
            </div>

            <div className='flex-1 overflow-y-auto space-y-4'>
              {documentWorkflow ? (
                <div>
                  <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-4'>
                    <h4 className='font-medium text-green-800 dark:text-green-200 mb-2'>
                      Active Workflow
                    </h4>
                    <p className='text-sm text-green-700 dark:text-green-300'>
                      This document has an active workflow with status:{' '}
                      <strong>{documentWorkflow.status}</strong>
                    </p>
                    <p className='text-sm text-green-700 dark:text-green-300 mt-1'>
                      Current stage: {documentWorkflow.current_stage}
                    </p>
                  </div>

                  <div className='flex gap-2'>
                    <button
                      onClick={() =>
                        window.open('/workflow-management', '_blank')
                      }
                      className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                    >
                      View Workflow Details
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          '/workflow-management?tab=approvals',
                          '_blank'
                        )
                      }
                      className='bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700'
                    >
                      Manage Approvals
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4'>
                    <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
                      No Active Workflow
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      This document doesn't have an active workflow. Choose a
                      workflow to initiate the approval process.
                    </p>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Available Workflows
                    </label>
                    <div className='space-y-2'>
                      {availableWorkflows.length === 0 ? (
                        <p className='text-sm text-gray-500'>
                          No workflows available. Create workflows in the
                          Workflow Management module.
                        </p>
                      ) : (
                        availableWorkflows.map(workflow => (
                          <div
                            key={workflow.id}
                            className='border border-gray-200 dark:border-gray-600 rounded-lg p-3'
                          >
                            <div className='flex items-center justify-between'>
                              <div>
                                <h5 className='font-medium text-gray-900 dark:text-white'>
                                  {workflow.name}
                                </h5>
                                <p className='text-sm text-gray-600 dark:text-gray-400'>
                                  {workflow.description}
                                </p>
                                <span className='text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded'>
                                  {workflow.category}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleInitiateWorkflow(workflow.id!)
                                }
                                className='bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 text-sm'
                              >
                                Initiate Workflow
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-600'>
                    <button
                      onClick={() =>
                        window.open('/workflow-management', '_blank')
                      }
                      className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                    >
                      Manage Workflows
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cloud Storage Integration Modal */}
      <CloudStorageIntegration
        isOpen={showCloudStorageModal}
        onClose={() => setShowCloudStorageModal(false)}
      />

      {/* Document Wizard */}
      {showWizard && (
        <DocumentWizard
          onClose={() => setShowWizard(false)}
          onComplete={(document) => {
            setShowWizard(false);
            handleDocumentSaved(document);
          }}
        />
      )}
    </div>
  );
};

export default DocumentHub;
