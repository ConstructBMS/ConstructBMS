import React, { useState, useEffect } from 'react';
import {
  Workflow,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Copy,
  Download,
  RefreshCw,
  Bell,
  Users,
  FileText,
  BarChart3,
  Calendar,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Star,
  Filter,
  Search,
  MoreHorizontal,
  Send,
  Archive,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import {
  workflowService,
  Workflow,
  WorkflowStage,
  DocumentWorkflow,
  WorkflowApproval,
  WorkflowNotification,
  WorkflowTemplate,
} from '../../services/workflowService';
import { useAuth } from '../../contexts/AuthContext';

interface WorkflowManagementProps {
  className?: string;
}

const WorkflowManagement: React.FC<WorkflowManagementProps> = ({
  className = '',
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('workflows');
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<WorkflowNotification[]>(
    []
  );
  const [workflowStats, setWorkflowStats] = useState<any>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null
  );
  const [selectedDocumentWorkflow, setSelectedDocumentWorkflow] =
    useState<any>(null);

  // Modal states
  const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showWorkflowDetailsModal, setShowWorkflowDetailsModal] =
    useState(false);

  // Form states
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    category: 'general',
  });
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'general',
    stages: [] as any[],
  });
  const [approvalAction, setApprovalAction] = useState<
    'approve' | 'reject' | 'request_changes'
  >('approve');
  const [approvalComments, setApprovalComments] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load workflows
      const fetchedWorkflows = await workflowService.getWorkflows();
      setWorkflows(fetchedWorkflows);

      // Load templates
      const fetchedTemplates = await workflowService.getWorkflowTemplates();
      setTemplates(fetchedTemplates);

      // Load pending approvals
      const fetchedApprovals = await workflowService.getUserPendingApprovals(
        user.id
      );
      setPendingApprovals(fetchedApprovals);

      // Load notifications
      const fetchedNotifications =
        await workflowService.getUserUnreadNotifications(user.id);
      setNotifications(fetchedNotifications);

      // Load stats
      const stats = await workflowService.getWorkflowStats(user.id);
      setWorkflowStats(stats);
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    setLoading(true);
    try {
      const workflow = await workflowService.createWorkflow({
        name: newWorkflow.name,
        description: newWorkflow.description,
        category: newWorkflow.category,
        is_active: true,
        created_by: user!.id,
      });

      setWorkflows(prev => [workflow, ...prev]);
      setShowCreateWorkflowModal(false);
      setNewWorkflow({ name: '', description: '', category: 'general' });
      alert('Workflow created successfully');
    } catch (error) {
      console.error('Error creating workflow:', error);
      alert('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (newTemplate.stages.length === 0) {
      alert('Please add at least one stage');
      return;
    }

    setLoading(true);
    try {
      const template = await workflowService.createWorkflowTemplate({
        name: newTemplate.name,
        description: newTemplate.description,
        category: newTemplate.category,
        stages: newTemplate.stages,
        created_by: user!.id,
        is_default: false,
      });

      setTemplates(prev => [template, ...prev]);
      setShowCreateTemplateModal(false);
      setNewTemplate({
        name: '',
        description: '',
        category: 'general',
        stages: [],
      });
      alert('Template created successfully');
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflowFromTemplate = async (templateId: string) => {
    const name = prompt('Enter workflow name:');
    if (!name) return;

    const description = prompt('Enter workflow description (optional):') || '';

    setLoading(true);
    try {
      const workflow = await workflowService.createWorkflowFromTemplate(
        templateId,
        name,
        description
      );
      setWorkflows(prev => [workflow, ...prev]);
      alert('Workflow created from template successfully');
    } catch (error) {
      console.error('Error creating workflow from template:', error);
      alert('Failed to create workflow from template');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApproval = async () => {
    if (!selectedDocumentWorkflow) return;

    setLoading(true);
    try {
      await workflowService.submitApproval(
        selectedDocumentWorkflow.document_workflow.id,
        selectedDocumentWorkflow.document_workflow.current_stage,
        approvalAction,
        approvalComments
      );

      setShowApprovalModal(false);
      setApprovalAction('approve');
      setApprovalComments('');
      setSelectedDocumentWorkflow(null);

      // Refresh data
      await loadData();
      alert('Approval submitted successfully');
    } catch (error) {
      console.error('Error submitting approval:', error);
      alert('Failed to submit approval');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await workflowService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className='w-4 h-4' />;
      case 'rejected':
        return <XCircle className='w-4 h-4' />;
      case 'pending':
        return <Clock className='w-4 h-4' />;
      case 'in_progress':
        return <Play className='w-4 h-4' />;
      case 'cancelled':
        return <Archive className='w-4 h-4' />;
      default:
        return <Clock className='w-4 h-4' />;
    }
  };

  const tabs = [
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'approvals', label: 'Pending Approvals', icon: CheckCircle },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'contracts', name: 'Contracts' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'finance', name: 'Finance' },
    { id: 'legal', name: 'Legal' },
    { id: 'hr', name: 'HR' },
  ];

  const roles = [
    { id: 'admin', name: 'Admin' },
    { id: 'manager', name: 'Manager' },
    { id: 'user', name: 'User' },
    { id: 'legal', name: 'Legal' },
    { id: 'finance', name: 'Finance' },
    { id: 'content', name: 'Content' },
    { id: 'brand', name: 'Brand' },
    { id: 'executive', name: 'Executive' },
  ];

  return (
    <div className={`workflow-management ${className}`}>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center gap-3 mb-2'>
          <Workflow className='w-8 h-8 text-blue-600' />
          <h1 className='text-2xl font-bold text-gray-900'>
            Workflow Management
          </h1>
        </div>
        <p className='text-gray-600'>
          Manage document approval workflows and track approval processes
        </p>
      </div>

      {/* Quick Stats */}
      {workflowStats && (
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-6'>
          <div className='bg-white rounded-lg p-4 shadow-sm border'>
            <div className='flex items-center gap-2'>
              <Workflow className='w-5 h-5 text-blue-600' />
              <span className='text-sm font-medium text-gray-600'>
                Total Workflows
              </span>
            </div>
            <p className='text-2xl font-bold text-gray-900'>
              {workflowStats.total_workflows}
            </p>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm border'>
            <div className='flex items-center gap-2'>
              <Play className='w-5 h-5 text-green-600' />
              <span className='text-sm font-medium text-gray-600'>
                Active Workflows
              </span>
            </div>
            <p className='text-2xl font-bold text-gray-900'>
              {workflowStats.active_workflows}
            </p>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm border'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='w-5 h-5 text-yellow-600' />
              <span className='text-sm font-medium text-gray-600'>
                Pending Approvals
              </span>
            </div>
            <p className='text-2xl font-bold text-gray-900'>
              {workflowStats.pending_approvals}
            </p>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm border'>
            <div className='flex items-center gap-2'>
              <Calendar className='w-5 h-5 text-purple-600' />
              <span className='text-sm font-medium text-gray-600'>
                Completed This Month
              </span>
            </div>
            <p className='text-2xl font-bold text-gray-900'>
              {workflowStats.completed_this_month}
            </p>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm border'>
            <div className='flex items-center gap-2'>
              <Clock className='w-5 h-5 text-indigo-600' />
              <span className='text-sm font-medium text-gray-600'>
                Avg Completion Time
              </span>
            </div>
            <p className='text-2xl font-bold text-gray-900'>
              {workflowStats.avg_completion_time?.toFixed(1)}h
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className='border-b border-gray-200 mb-6'>
        <nav className='flex space-x-8'>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className='w-4 h-4' />
                {tab.label}
                {tab.id === 'approvals' && pendingApprovals.length > 0 && (
                  <span className='bg-red-500 text-white text-xs rounded-full px-2 py-1'>
                    {pendingApprovals.length}
                  </span>
                )}
                {tab.id === 'notifications' && notifications.length > 0 && (
                  <span className='bg-blue-500 text-white text-xs rounded-full px-2 py-1'>
                    {notifications.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='min-h-[500px]'>
        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-4'>
                <h3 className='text-lg font-semibold'>Workflows</h3>
                <div className='flex items-center gap-2'>
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className='px-3 py-1 border border-gray-300 rounded-md text-sm'
                  >
                    <option value='all'>All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className='px-3 py-1 border border-gray-300 rounded-md text-sm'
                  >
                    <option value='all'>All Status</option>
                    <option value='active'>Active</option>
                    <option value='inactive'>Inactive</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowCreateWorkflowModal(true)}
                className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2'
              >
                <Plus className='w-4 h-4' />
                Create Workflow
              </button>
            </div>

            <div className='bg-white rounded-lg shadow-sm border'>
              <div className='p-4 border-b border-gray-200'>
                <div className='flex items-center gap-2'>
                  <Search className='w-4 h-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Search workflows...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='flex-1 border-none outline-none text-sm'
                  />
                </div>
              </div>

              <div className='divide-y divide-gray-200'>
                {workflows
                  .filter(
                    w =>
                      w.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                      (categoryFilter === 'all' ||
                        w.category === categoryFilter) &&
                      (statusFilter === 'all' ||
                        (statusFilter === 'active' && w.is_active) ||
                        (statusFilter === 'inactive' && !w.is_active))
                  )
                  .map(workflow => (
                    <div key={workflow.id} className='p-4 hover:bg-gray-50'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              workflow.is_active
                                ? 'bg-green-500'
                                : 'bg-gray-400'
                            }`}
                          ></div>
                          <div>
                            <h4 className='font-medium text-gray-900'>
                              {workflow.name}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              {workflow.description}
                            </p>
                            <div className='flex items-center gap-2 mt-1'>
                              <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'>
                                {workflow.category}
                              </span>
                              <span className='text-xs text-gray-500'>
                                Created{' '}
                                {new Date(
                                  workflow.created_at!
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => {
                              setSelectedWorkflow(workflow);
                              setShowWorkflowDetailsModal(true);
                            }}
                            className='text-blue-600 hover:text-blue-800'
                          >
                            <Eye className='w-4 h-4' />
                          </button>
                          <button className='text-gray-600 hover:text-gray-800'>
                            <Edit3 className='w-4 h-4' />
                          </button>
                          <button className='text-gray-600 hover:text-gray-800'>
                            <Copy className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Pending Approvals</h3>
              <button
                onClick={loadData}
                className='flex items-center gap-2 text-blue-600 hover:text-blue-800'
              >
                <RefreshCw className='w-4 h-4' />
                Refresh
              </button>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className='text-center py-12'>
                <CheckCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>
                  No pending approvals. You're all caught up!
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {pendingApprovals.map(approval => (
                  <div
                    key={approval.document_workflow.id}
                    className='bg-white rounded-lg p-4 shadow-sm border'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <h4 className='font-medium text-gray-900'>
                            {approval.document.title}
                          </h4>
                          <span className='text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded'>
                            Stage {approval.stage.stage_number}:{' '}
                            {approval.stage.name}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 mb-2'>
                          {approval.document.description}
                        </p>
                        <div className='flex items-center gap-4 text-xs text-gray-500'>
                          <span>Workflow: {approval.workflow.name}</span>
                          <span>
                            Initiated:{' '}
                            {new Date(
                              approval.document_workflow.initiated_at
                            ).toLocaleDateString()}
                          </span>
                          <span>
                            Required: {approval.stage.required_approvers}{' '}
                            approval(s)
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => {
                            setSelectedDocumentWorkflow(approval);
                            setShowApprovalModal(true);
                          }}
                          className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm'
                          title='Review Document'
                        >
                          Review
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocumentWorkflow(approval);
                            setApprovalAction('approve');
                            setShowApprovalModal(true);
                          }}
                          className='bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm'
                          title='Approve Document'
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocumentWorkflow(approval);
                            setApprovalAction('reject');
                            setShowApprovalModal(true);
                          }}
                          className='bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm'
                          title='Reject Document'
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Workflow Templates</h3>
              <button
                onClick={() => setShowCreateTemplateModal(true)}
                className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2'
              >
                <Plus className='w-4 h-4' />
                Create Template
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {templates.map(template => (
                <div
                  key={template.id}
                  className='bg-white rounded-lg p-4 shadow-sm border'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                      <h4 className='font-medium text-gray-900'>
                        {template.name}
                      </h4>
                      {template.is_default && (
                        <Star className='w-4 h-4 text-yellow-500 fill-current' />
                      )}
                    </div>
                    <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'>
                      {template.category}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 mb-3'>
                    {template.description}
                  </p>
                  <div className='mb-3'>
                    <span className='text-xs font-medium text-gray-700'>
                      Stages:
                    </span>
                    <div className='mt-1 space-y-1'>
                      {template.stages.map((stage, index) => (
                        <div
                          key={index}
                          className='text-xs text-gray-600 flex items-center gap-1'
                        >
                          <span className='w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs'>
                            {stage.stage_number}
                          </span>
                          {stage.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() =>
                        handleCreateWorkflowFromTemplate(template.id!)
                      }
                      className='flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm'
                    >
                      Use Template
                    </button>
                    <button className='text-gray-600 hover:text-gray-800'>
                      <Eye className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Workflow Notifications</h3>
              <button
                onClick={loadData}
                className='flex items-center gap-2 text-blue-600 hover:text-blue-800'
              >
                <RefreshCw className='w-4 h-4' />
                Refresh
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className='text-center py-12'>
                <Bell className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>No unread notifications</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className='bg-white rounded-lg p-4 shadow-sm border'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h4 className='font-medium text-gray-900'>
                            {notification.title}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              notification.notification_type ===
                              'approval_request'
                                ? 'bg-blue-100 text-blue-600'
                                : notification.notification_type ===
                                    'workflow_completed'
                                  ? 'bg-green-100 text-green-600'
                                  : notification.notification_type ===
                                      'workflow_rejected'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {notification.notification_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 mb-2'>
                          {notification.message}
                        </p>
                        <span className='text-xs text-gray-500'>
                          {new Date(notification.sent_at).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleMarkNotificationAsRead(notification.id!)
                        }
                        className='text-blue-600 hover:text-blue-800'
                      >
                        <CheckCircle className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className='space-y-6'>
            <h3 className='text-lg font-semibold'>Workflow Analytics</h3>

            {workflowStats ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Workflow Performance */}
                <div className='bg-white rounded-lg p-6 shadow-sm border'>
                  <h4 className='text-lg font-medium mb-4'>
                    Workflow Performance
                  </h4>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        Total Workflows
                      </span>
                      <span className='text-lg font-bold text-gray-400'>
                        0
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        Active Workflows
                      </span>
                      <span className='text-lg font-bold text-gray-400'>
                        0
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        Pending Approvals
                      </span>
                      <span className='text-lg font-bold text-gray-400'>
                        0
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        Completed This Month
                      </span>
                      <span className='text-lg font-bold text-gray-400'>
                        0
                      </span>
                    </div>
                  </div>
                </div>

                {/* Efficiency Metrics */}
                <div className='bg-white rounded-lg p-6 shadow-sm border'>
                  <h4 className='text-lg font-medium mb-4'>
                    Efficiency Metrics
                  </h4>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        Avg Completion Time
                      </span>
                      <span className='text-lg font-bold text-gray-900'>
                        {workflowStats.avg_completion_time?.toFixed(1)} hours
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        Approval Rate
                      </span>
                      <span className='text-lg font-bold text-green-600'>
                        {workflowStats.total_workflows > 0
                          ? Math.round(
                              (workflowStats.completed_this_month /
                                workflowStats.total_workflows) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-center py-12'>
                <BarChart3 className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>
                  No analytics data available yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}

      {/* Create Workflow Modal */}
      {showCreateWorkflowModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold mb-4'>Create New Workflow</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Name *
                </label>
                <input
                  type='text'
                  value={newWorkflow.name}
                  onChange={e =>
                    setNewWorkflow(prev => ({ ...prev, name: e.target.value }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter workflow name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Description
                </label>
                <textarea
                  value={newWorkflow.description}
                  onChange={e =>
                    setNewWorkflow(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter workflow description'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Category
                </label>
                <select
                  value={newWorkflow.category}
                  onChange={e =>
                    setNewWorkflow(prev => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='flex justify-end gap-2 mt-6'>
              <button
                onClick={() => setShowCreateWorkflowModal(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800'
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                disabled={loading || !newWorkflow.name.trim()}
                className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50'
              >
                {loading ? 'Creating...' : 'Create Workflow'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedDocumentWorkflow && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <h3 className='text-lg font-semibold mb-4'>
              Review Document: {selectedDocumentWorkflow.document.title}
            </h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Document Content
                </label>
                <div className='bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto text-sm'>
                  {selectedDocumentWorkflow.document.content ||
                    'No content available'}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Action
                </label>
                <select
                  value={approvalAction}
                  onChange={e => setApprovalAction(e.target.value as any)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='approve'>Approve</option>
                  <option value='reject'>Reject</option>
                  <option value='request_changes'>Request Changes</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Comments (Optional)
                </label>
                <textarea
                  value={approvalComments}
                  onChange={e => setApprovalComments(e.target.value)}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Add comments about your decision...'
                />
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-6'>
              <button
                onClick={() => setShowApprovalModal(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800'
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApproval}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                  approvalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : approvalAction === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {loading
                  ? 'Submitting...'
                  : approvalAction === 'approve'
                    ? 'Approve'
                    : approvalAction === 'reject'
                      ? 'Reject'
                      : 'Request Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Details Modal */}
      {showWorkflowDetailsModal && selectedWorkflow && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>
                Workflow Details: {selectedWorkflow.name}
              </h3>
              <button
                onClick={() => setShowWorkflowDetailsModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <XCircle className='w-6 h-6' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Description
                </label>
                <p className='text-gray-600'>
                  {selectedWorkflow.description || 'No description'}
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Category
                </label>
                <span className='text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded'>
                  {selectedWorkflow.category}
                </span>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Status
                </label>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    selectedWorkflow.is_active
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {selectedWorkflow.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Created
                </label>
                <p className='text-gray-600'>
                  {new Date(selectedWorkflow.created_at!).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManagement;
