import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  Building, 
  DollarSign, 
  Target, 
  Phone, 
  Mail, 
  MessageSquare, 
  FileText, 
  Link, 
  Tag,
  Plus,
  ChevronRight,
  Activity,
  TrendingUp,
  Users,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

interface Opportunity {
  activities?: Array<{
    date: string;
    id: string;
    notes?: string;
    status: 'completed' | 'pending' | 'overdue';
    title: string;
    type: 'call' | 'email' | 'meeting' | 'task';
}>;
  avatarUrl?: string;
  company: string;
  contacts?: Array<{
    email: string;
    id: string;
    name: string;
    phone: string;
    role: string;
  }>;
  createdAt: string;
  description?: string;
  documents?: Array<{
    id: string;
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
  }>;
  expectedCloseDate?: string;
  id: string;
  industry?: string;
  lastContact?: string;
  nextAction?: string;
  notes?: Array<{
    author: string;
    content: string;
    createdAt: string;
    id: string;
  }>;
  owner: string;
  probability?: number;
  source?: string;
  stage: string;
  status?: string;
  tags?: string[];
  title: string;
  value: number;
}

interface OpportunityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
  onUpdate: (opportunity: Opportunity) => void;
  opportunity: Opportunity | null;
}

const OpportunityDetailsModal: React.FC<OpportunityDetailsModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onNavigateToModule
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedOpportunity, setEditedOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    if (opportunity) {
      setEditedOpportunity({ ...opportunity });
    }
  }, [opportunity]);

  if (!isOpen || !opportunity || !editedOpportunity) return null;

  const handleSave = () => {
    if (editedOpportunity) {
      onUpdate(editedOpportunity);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      onDelete(opportunity.id);
      onClose();
    }
  };

  // Navigation functions for integrated modules
  const handleNavigateToCustomer = () => {
    if (onNavigateToModule && opportunity.company) {
      onNavigateToModule('customers', { 
        search: opportunity.company,
        opportunityId: opportunity.id 
      });
      onClose();
    }
  };

  const handleNavigateToNotes = () => {
    if (onNavigateToModule) {
      onNavigateToModule('notes', { 
        context: 'opportunity',
        contextId: opportunity.id,
        title: `Notes for ${opportunity.title}`
      });
      onClose();
    }
  };

  const handleNavigateToDocuments = () => {
    if (onNavigateToModule) {
      onNavigateToModule('document-hub', { 
        context: 'opportunity',
        contextId: opportunity.id,
        title: `Documents for ${opportunity.title}`
      });
      onClose();
    }
  };

  const handleNavigateToCalendar = () => {
    if (onNavigateToModule) {
      onNavigateToModule('calendar', { 
        context: 'opportunity',
        contextId: opportunity.id,
        title: `Activities for ${opportunity.title}`
      });
      onClose();
    }
  };

  const handleNavigateToChat = () => {
    if (onNavigateToModule) {
      onNavigateToModule('chat', { 
        context: 'opportunity',
        contextId: opportunity.id,
        title: `Chat for ${opportunity.title}`
      });
      onClose();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'activities', label: 'Activities', icon: Clock },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const getStageColor = (stage: string) => {
    const colors = {
      lead: '#3B82F6',
      qualified: '#10B981',
      proposal: '#F59E0B',
      negotiation: '#EF4444',
      won: '#059669',
      lost: '#6B7280'
    };
    return colors[stage as keyof typeof colors] || '#6B7280';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New': return <Star className="h-4 w-4 text-blue-500" />;
      case 'Hot': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Qualified': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: getStageColor(opportunity.stage) }}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedOpportunity.title}
                    onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-constructbms-blue outline-none"
                  />
                ) : (
                  opportunity.title
                )}
              </h2>
              <button 
                onClick={handleNavigateToCustomer}
                className="text-gray-600 dark:text-gray-400 hover:text-constructbms-blue hover:underline transition-colors cursor-pointer"
                title="View customer details"
              >
                {opportunity.company}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-primary transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedOpportunity({ ...opportunity });
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Edit Opportunity"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Opportunity"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-constructbms-blue text-constructbms-blue'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Value</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      £{opportunity.value.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <Target className="h-4 w-4" />
                      <span className="text-sm">Probability</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {opportunity.probability}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Created</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(opportunity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Owner</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {opportunity.owner}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                  {isEditing ? (
                    <textarea
                      value={editedOpportunity.description || ''}
                      onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, description: e.target.value } : null)}
                      className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:border-constructbms-blue outline-none"
                      placeholder="Add a description for this opportunity..."
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      {opportunity.description || 'No description available.'}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-constructbms-blue/10 text-constructbms-blue text-sm font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {isEditing && (
                      <button className="px-3 py-1 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-full hover:border-constructbms-blue hover:text-constructbms-blue transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status & Stage */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Status & Stage</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(opportunity.status || '')}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {opportunity.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getStageColor(opportunity.stage) }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {opportunity.stage}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Action */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Next Action</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedOpportunity.nextAction || ''}
                      onChange={(e) => setEditedOpportunity(prev => prev ? { ...prev, nextAction: e.target.value } : null)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-constructbms-blue outline-none"
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      {opportunity.nextAction || 'No next action defined.'}
                    </p>
                  )}
                </div>

                {/* Last Contact */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Last Contact</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {opportunity.lastContact ? new Date(opportunity.lastContact).toLocaleDateString() : 'No contact recorded.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activities</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleNavigateToCalendar}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    title="View all activities in Calendar"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-primary transition-colors whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {opportunity.activities?.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' :
                      activity.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/20' :
                      'bg-yellow-100 dark:bg-yellow-900/20'
                    }`}>
                      {activity.type === 'call' && <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                      {activity.type === 'email' && <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                      {activity.type === 'meeting' && <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                      {activity.type === 'task' && <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      activity.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No activities recorded yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contacts</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleNavigateToCustomer}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                    title="View customer management"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View CRM
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-primary transition-colors whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opportunity.contacts?.map((contact) => (
                  <div key={contact.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-constructbms-blue flex items-center justify-center text-black font-bold">
                        {contact.name[0]}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{contact.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contact.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                    No contacts associated with this opportunity.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleNavigateToDocuments}
                    className="inline-flex items-center px-3 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                    title="View document library"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    View Library
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-primary transition-colors whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {opportunity.documents?.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{doc.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {doc.type} • {doc.size} • {doc.uploadedAt}
                      </p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Link className="h-4 w-4" />
                    </button>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No documents uploaded yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleNavigateToNotes}
                    className="inline-flex items-center px-3 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap"
                    title="View all notes"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Notes
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-primary transition-colors whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {opportunity.notes?.map((note) => (
                  <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{note.author}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{note.createdAt}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No notes added yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h3>
                <button 
                  onClick={handleNavigateToChat}
                  className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                  title="Open chat for this opportunity"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pipeline Progress</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Days in Pipeline</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Math.floor((Date.now() - new Date(opportunity.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Expected Close</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString() : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Engagement Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Activities</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {opportunity.activities?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Contacts</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {opportunity.contacts?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Documents</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {opportunity.documents?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailsModal; 
