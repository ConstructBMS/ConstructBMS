import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Settings,
  Grid,
  List,
  Table,
  Columns,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  ChevronUp,
  ChevronDown,
  Plus,
  Calendar,
  Activity,
  X,
} from 'lucide-react';
import { emailIntegrationService } from '../../services/emailIntegration';
import {
  emailIntelligenceService,
  EmailMessage,
} from '../../services/emailIntelligence';

interface Contractor {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  status: string;
  complianceStatus: string;
  lastUpdated: string;
  documents: number;
  expiryDate: string;
  specializations: string[];
  hourlyRate: string;
  insuranceExpiry: string;
  notes?: string;
  tasks?: Array<{
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  documentsList?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    url: string;
  }>;
}

// Mock data for contractors
const mockContractors = [
  {
    id: 1,
    name: 'John Smith',
    company: 'Smith Construction Ltd',
    email: 'john@smithconstruction.com',
    phone: '+44 7700 900123',
    location: 'Manchester, UK',
    status: 'active',
    complianceStatus: 'compliant',
    lastUpdated: '2024-01-15',
    documents: 8,
    expiryDate: '2024-12-31',
    specializations: ['Plumbing', 'Electrical'],
    hourlyRate: '£45',
    insuranceExpiry: '2024-06-30',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    company: 'Johnson Builders',
    email: 'sarah@johnsonbuilders.co.uk',
    phone: '+44 7700 900456',
    location: 'Birmingham, UK',
    status: 'active',
    complianceStatus: 'pending',
    lastUpdated: '2024-01-10',
    documents: 5,
    expiryDate: '2024-08-15',
    specializations: ['Carpentry', 'Joinery'],
    hourlyRate: '£38',
    insuranceExpiry: '2024-04-15',
  },
  {
    id: 3,
    name: 'Michael Wilson',
    company: 'Wilson Contracting Ltd',
    email: 'michael@wilsoncontracting.co.uk',
    phone: '+44 7700 900789',
    location: 'Leeds, UK',
    status: 'inactive',
    complianceStatus: 'expired',
    lastUpdated: '2023-12-20',
    documents: 3,
    expiryDate: '2023-11-30',
    specializations: ['Roofing', 'Guttering'],
    hourlyRate: '£42',
    insuranceExpiry: '2023-10-31',
  },
  {
    id: 4,
    name: 'Emma Davis',
    company: 'Davis Renovations',
    email: 'emma@davisrenovations.co.uk',
    phone: '+44 7700 900012',
    location: 'Liverpool, UK',
    status: 'active',
    complianceStatus: 'compliant',
    lastUpdated: '2024-01-12',
    documents: 12,
    expiryDate: '2025-02-28',
    specializations: ['Interior Design', 'Painting'],
    hourlyRate: '£35',
    insuranceExpiry: '2024-09-30',
  },
  {
    id: 5,
    name: 'David Brown',
    company: 'Brown & Sons Ltd',
    email: 'david@brownandsons.co.uk',
    phone: '+44 7700 900345',
    location: 'Sheffield, UK',
    status: 'active',
    complianceStatus: 'warning',
    lastUpdated: '2024-01-08',
    documents: 7,
    expiryDate: '2024-03-15',
    specializations: ['Bricklaying', 'Stonework'],
    hourlyRate: '£40',
    insuranceExpiry: '2024-02-28',
  },
  {
    id: 6,
    name: 'Lisa Thompson',
    company: 'Thompson Electrical',
    email: 'lisa@thompsonelectrical.co.uk',
    phone: '+44 7700 900678',
    location: 'Newcastle, UK',
    status: 'active',
    complianceStatus: 'compliant',
    lastUpdated: '2024-01-14',
    documents: 10,
    expiryDate: '2024-11-30',
    specializations: ['Electrical', 'Security Systems'],
    hourlyRate: '£48',
    insuranceExpiry: '2024-08-31',
  },
];

const Contractors: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contractors' | 'sub-contractors'>(
    'contractors'
  );
  const [viewMode, setViewMode] = useState<
    'grid' | 'list' | 'table' | 'kanban'
  >('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContractor, setSelectedContractor] =
    useState<Contractor | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [contractorFormData, setContractorFormData] = useState<
    Partial<Contractor>
  >({});
  const [contractorEmails, setContractorEmails] = useState<EmailMessage[]>([]);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [selectedEmailForAction, setSelectedEmailForAction] =
    useState<EmailMessage | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('contractorsStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('contractorsStatsExpanded', JSON.stringify(newState));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'expired':
        return <AlertTriangle size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const filteredContractors = mockContractors.filter(
    contractor =>
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDetailsModal = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setShowDetailsModal(true);
  };
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedContractor(null);
  };

  const handleEditContractor = () => {
    setIsEditing(true);
    setContractorFormData(selectedContractor || {});
  };

  const handleSaveContractor = () => {
    // Save logic (update mockContractors or call API)
    if (selectedContractor) {
      Object.assign(selectedContractor, contractorFormData);
    }
    setIsEditing(false);
  };

  const handleCancelEditContractor = () => {
    setIsEditing(false);
    setContractorFormData({});
  };

  useEffect(() => {
    if (selectedContractor) {
      // Get all email integrations for this contractor
      const integrations = emailIntegrationService
        .getIntegrations()
        .filter(i => i.customerId === `contractor_${selectedContractor.id}`);
      // Get all emails for these integrations
      const emailIds = integrations.map(i => i.emailId);
      const allEmails = emailIntelligenceService.getEmails();
      const relatedEmails = allEmails.filter(e => emailIds.includes(e.id));
      setContractorEmails(relatedEmails);
    } else {
      setContractorEmails([]);
    }
  }, [selectedContractor]);

  const handleCreateTaskFromEmail = (email: EmailMessage) => {
    setSelectedEmailForAction(email);
    setShowCreateTaskModal(true);
  };

  const handleCreateEventFromEmail = (email: EmailMessage) => {
    setSelectedEmailForAction(email);
    setShowCreateEventModal(true);
  };

  const handleSaveTaskFromEmail = (taskData: any) => {
    // Save task logic
    if (selectedContractor && selectedEmailForAction) {
      const newTask = {
        id: `task_${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        status: 'pending' as const,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
      };

      if (!selectedContractor.tasks) {
        selectedContractor.tasks = [];
      }
      selectedContractor.tasks.push(newTask);
    }
    setShowCreateTaskModal(false);
    setSelectedEmailForAction(null);
  };

  const handleSaveEventFromEmail = (eventData: any) => {
    // Save event logic - this would integrate with the calendar system
    console.log('Creating event from email:', eventData);
    setShowCreateEventModal(false);
    setSelectedEmailForAction(null);
  };

  const renderGridView = () => (
    <div className='p-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredContractors.map(contractor => (
          <div
            key={contractor.id}
            className='bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer'
            onClick={() => openDetailsModal(contractor)}
          >
            <div className='p-6'>
              {/* Header */}
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {contractor.name}
                  </h3>
                  <p className='text-sm text-gray-600'>{contractor.company}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contractor.status)}`}
                  >
                    {contractor.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getComplianceColor(contractor.complianceStatus)}`}
                  >
                    {getComplianceIcon(contractor.complianceStatus)}
                    {contractor.complianceStatus}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className='space-y-2 mb-4'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Mail size={14} />
                  <span>{contractor.email}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Phone size={14} />
                  <span>{contractor.phone}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <MapPin size={14} />
                  <span>{contractor.location}</span>
                </div>
              </div>

              {/* Specializations */}
              <div className='mb-4'>
                <p className='text-xs font-medium text-gray-700 mb-2'>
                  Specializations:
                </p>
                <div className='flex flex-wrap gap-1'>
                  {contractor.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded'
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
                <div>
                  <p className='text-gray-500'>Hourly Rate</p>
                  <p className='font-semibold'>{contractor.hourlyRate}</p>
                </div>
                <div>
                  <p className='text-gray-500'>Documents</p>
                  <p className='font-semibold flex items-center gap-1'>
                    <FileText size={14} />
                    {contractor.documents}
                  </p>
                </div>
              </div>

              {/* Expiry Info */}
              <div className='mb-4'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-500'>Expires:</span>
                  <span className='font-medium'>{contractor.expiryDate}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-500'>Insurance:</span>
                  <span className='font-medium'>
                    {contractor.insuranceExpiry}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-2'>
                <button
                  className='flex-1 px-3 py-2 bg-archer-neon text-black text-sm font-medium rounded-lg hover:bg-archer-neon/90 transition-colors'
                  onClick={e => {
                    e.stopPropagation();
                    openDetailsModal(contractor);
                  }}
                >
                  View Details
                </button>
                <button
                  className='px-3 py-2 text-gray-600 hover:text-gray-800'
                  onClick={e => e.stopPropagation()}
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Contractor Details Modal */}
      {showDetailsModal && (
        <div className='fixed z-50 inset-0 overflow-y-auto'>
          <div className='flex items-center justify-center min-h-screen px-4'>
            <div
              className='fixed inset-0 bg-black bg-opacity-30'
              onClick={closeDetailsModal}
            />
            <div className='relative bg-white rounded-xl shadow-xl max-w-4xl w-full mx-auto p-8 z-10 max-h-[90vh] overflow-y-auto'>
              <button
                className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
                onClick={closeDetailsModal}
                aria-label='Close'
              >
                <X size={24} />
              </button>
              {selectedContractor && (
                <>
                  <h2 className='text-2xl font-bold mb-2 text-gray-900'>
                    {isEditing ? (
                      <input
                        type='text'
                        value={contractorFormData.name || ''}
                        onChange={e =>
                          setContractorFormData({
                            ...contractorFormData,
                            name: e.target.value,
                          })
                        }
                        className='w-full px-2 py-1 border rounded'
                      />
                    ) : (
                      selectedContractor.name
                    )}
                  </h2>
                  <p className='text-gray-600 mb-4'>
                    {isEditing ? (
                      <input
                        type='text'
                        value={contractorFormData.company || ''}
                        onChange={e =>
                          setContractorFormData({
                            ...contractorFormData,
                            company: e.target.value,
                          })
                        }
                        className='w-full px-2 py-1 border rounded'
                      />
                    ) : (
                      selectedContractor.company
                    )}
                  </p>

                  <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    {/* Main Info */}
                    <div className='lg:col-span-2 space-y-6'>
                      <div className='space-y-2 mb-4'>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <Mail size={14} />
                          {isEditing ? (
                            <input
                              type='email'
                              value={contractorFormData.email || ''}
                              onChange={e =>
                                setContractorFormData({
                                  ...contractorFormData,
                                  email: e.target.value,
                                })
                              }
                              className='w-full px-2 py-1 border rounded'
                            />
                          ) : (
                            selectedContractor.email
                          )}
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <Phone size={14} />
                          {isEditing ? (
                            <input
                              type='text'
                              value={contractorFormData.phone || ''}
                              onChange={e =>
                                setContractorFormData({
                                  ...contractorFormData,
                                  phone: e.target.value,
                                })
                              }
                              className='w-full px-2 py-1 border rounded'
                            />
                          ) : (
                            selectedContractor.phone
                          )}
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <MapPin size={14} />
                          {isEditing ? (
                            <input
                              type='text'
                              value={contractorFormData.location || ''}
                              onChange={e =>
                                setContractorFormData({
                                  ...contractorFormData,
                                  location: e.target.value,
                                })
                              }
                              className='w-full px-2 py-1 border rounded'
                            />
                          ) : (
                            selectedContractor.location
                          )}
                        </div>
                      </div>

                      <div className='mb-4'>
                        <p className='text-xs font-medium text-gray-700 mb-2'>
                          Specializations:
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {isEditing ? (
                            <input
                              type='text'
                              value={
                                contractorFormData.specializations
                                  ? contractorFormData.specializations.join(
                                      ', '
                                    )
                                  : ''
                              }
                              onChange={e =>
                                setContractorFormData({
                                  ...contractorFormData,
                                  specializations: e.target.value
                                    .split(',')
                                    .map(s => s.trim()),
                                })
                              }
                              className='w-full px-2 py-1 border rounded'
                            />
                          ) : (
                            selectedContractor.specializations.map(
                              (spec: string, index: number) => (
                                <span
                                  key={index}
                                  className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded'
                                >
                                  {spec}
                                </span>
                              )
                            )
                          )}
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
                        <div>
                          <p className='text-gray-500'>Hourly Rate</p>
                          {isEditing ? (
                            <input
                              type='text'
                              value={contractorFormData.hourlyRate || ''}
                              onChange={e =>
                                setContractorFormData({
                                  ...contractorFormData,
                                  hourlyRate: e.target.value,
                                })
                              }
                              className='w-full px-2 py-1 border rounded'
                            />
                          ) : (
                            <p className='font-semibold'>
                              {selectedContractor.hourlyRate}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className='text-gray-500'>Documents</p>
                          <p className='font-semibold flex items-center gap-1'>
                            <FileText size={14} />
                            {selectedContractor.documents}
                          </p>
                        </div>
                      </div>

                      <div className='mb-4'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-gray-500'>Expires:</span>
                          {isEditing ? (
                            <input
                              type='date'
                              value={contractorFormData.expiryDate || ''}
                              onChange={e =>
                                setContractorFormData({
                                  ...contractorFormData,
                                  expiryDate: e.target.value,
                                })
                              }
                              className='w-full px-2 py-1 border rounded'
                            />
                          ) : (
                            <span className='font-medium'>
                              {selectedContractor.expiryDate}
                            </span>
                          )}
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-gray-500'>Insurance:</span>
                          {isEditing ? (
                            <input
                              type='date'
                              value={contractorFormData.insuranceExpiry || ''}
                              onChange={e =>
                                setContractorFormData({
                                  ...contractorFormData,
                                  insuranceExpiry: e.target.value,
                                })
                              }
                              className='w-full px-2 py-1 border rounded'
                            />
                          ) : (
                            <span className='font-medium'>
                              {selectedContractor.insuranceExpiry}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Email Activity */}
                      <div className='bg-gray-50 rounded-lg p-4'>
                        <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                          <Mail size={20} />
                          Email Activity
                        </h4>
                        <div className='space-y-3'>
                          {contractorEmails.length === 0 ? (
                            <div className='text-sm text-gray-500 text-center py-4'>
                              No emails found for this contractor.
                            </div>
                          ) : (
                            contractorEmails.slice(0, 5).map(email => (
                              <div
                                key={email.id}
                                className='flex items-start gap-3 p-3 bg-white rounded-lg'
                              >
                                <div className='p-2 bg-green-100 rounded-lg'>
                                  <Mail size={16} className='text-green-600' />
                                </div>
                                <div className='flex-1'>
                                  <div className='flex items-center justify-between mb-1'>
                                    <span className='font-medium text-gray-900 truncate'>
                                      {email.subject}
                                    </span>
                                    <span className='text-sm text-gray-500'>
                                      {new Date(
                                        email.timestamp
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className='text-sm text-gray-600 mb-1'>
                                    From: {email.sender}
                                  </p>
                                  <p className='text-sm text-gray-500 line-clamp-2'>
                                    {email.content.substring(0, 100)}...
                                  </p>
                                  <div className='flex items-center gap-2 mt-2'>
                                    <button
                                      onClick={() =>
                                        handleCreateTaskFromEmail(email)
                                      }
                                      className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200'
                                    >
                                      Create Task
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleCreateEventFromEmail(email)
                                      }
                                      className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200'
                                    >
                                      Create Event
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                          {contractorEmails.length > 5 && (
                            <div className='text-center'>
                              <button className='text-sm text-archer-neon hover:text-archer-neon/80'>
                                View all {contractorEmails.length} emails
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className='bg-gray-50 rounded-lg p-4'>
                        <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                          <FileText size={20} />
                          Notes
                        </h4>
                        {isEditing ? (
                          <textarea
                            value={
                              contractorFormData.notes ||
                              selectedContractor.notes ||
                              ''
                            }
                            onChange={e =>
                              setContractorFormData({
                                ...contractorFormData,
                                notes: e.target.value,
                              })
                            }
                            rows={4}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                            placeholder='Add notes about this contractor...'
                          />
                        ) : (
                          <p className='text-gray-900'>
                            {selectedContractor.notes || 'No notes available.'}
                          </p>
                        )}
                      </div>

                      {/* Tasks */}
                      <div className='bg-gray-50 rounded-lg p-4'>
                        <div className='flex items-center justify-between mb-4'>
                          <h4 className='font-semibold text-gray-900 flex items-center gap-2'>
                            <Activity size={20} />
                            Tasks
                          </h4>
                          <button
                            onClick={() => setShowAddTaskModal(true)}
                            className='text-sm text-archer-neon hover:text-archer-neon/80'
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className='space-y-3'>
                          {!selectedContractor.tasks ||
                          selectedContractor.tasks.length === 0 ? (
                            <div className='text-sm text-gray-500 text-center py-4'>
                              No tasks assigned to this contractor.
                            </div>
                          ) : (
                            selectedContractor.tasks.map(task => (
                              <div
                                key={task.id}
                                className='p-3 bg-white rounded-lg'
                              >
                                <div className='flex items-center justify-between mb-2'>
                                  <h5 className='font-medium text-gray-900'>
                                    {task.title}
                                  </h5>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      task.status === 'completed'
                                        ? 'bg-green-100 text-green-700'
                                        : task.status === 'in-progress'
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                  >
                                    {task.status}
                                  </span>
                                </div>
                                <p className='text-sm text-gray-600 mb-2'>
                                  {task.description}
                                </p>
                                <div className='flex items-center justify-between text-sm text-gray-500'>
                                  <span>Due: {task.dueDate}</span>
                                  <span>Priority: {task.priority}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Documents */}
                      <div className='bg-gray-50 rounded-lg p-4'>
                        <div className='flex items-center justify-between mb-4'>
                          <h4 className='font-semibold text-gray-900 flex items-center gap-2'>
                            <FileText size={20} />
                            Documents
                          </h4>
                          <button
                            onClick={() => setShowAddDocumentModal(true)}
                            className='text-sm text-archer-neon hover:text-archer-neon/80'
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className='space-y-3'>
                          {!selectedContractor.documentsList ||
                          selectedContractor.documentsList.length === 0 ? (
                            <div className='text-sm text-gray-500 text-center py-4'>
                              No documents uploaded for this contractor.
                            </div>
                          ) : (
                            selectedContractor.documentsList.map(doc => (
                              <div
                                key={doc.id}
                                className='flex items-center justify-between p-3 bg-white rounded-lg'
                              >
                                <div className='flex items-center gap-3'>
                                  <FileText
                                    size={16}
                                    className='text-gray-500'
                                  />
                                  <div>
                                    <p className='font-medium text-gray-900'>
                                      {doc.name}
                                    </p>
                                    <p className='text-sm text-gray-500'>
                                      {doc.type} •{' '}
                                      {(doc.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <button className='text-sm text-archer-neon hover:text-archer-neon/80'>
                                    <Download size={16} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className='space-y-6'>
                      {/* Status & Compliance */}
                      <div className='bg-gray-50 rounded-lg p-4'>
                        <h4 className='font-semibold text-gray-900 mb-4'>
                          Status & Compliance
                        </h4>
                        <div className='space-y-3'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Status
                            </label>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContractor.status)}`}
                            >
                              {selectedContractor.status}
                            </span>
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Compliance
                            </label>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getComplianceColor(selectedContractor.complianceStatus)}`}
                            >
                              {getComplianceIcon(
                                selectedContractor.complianceStatus
                              )}
                              {selectedContractor.complianceStatus}
                            </span>
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Last Updated
                            </label>
                            <p className='text-sm text-gray-900'>
                              {selectedContractor.lastUpdated}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-2 mt-6'>
                    {isEditing ? (
                      <>
                        <button
                          className='flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors'
                          onClick={handleSaveContractor}
                        >
                          Save
                        </button>
                        <button
                          className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors'
                          onClick={handleCancelEditContractor}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className='flex-1 px-4 py-2 bg-archer-neon text-black font-semibold rounded-lg hover:bg-archer-neon/90 transition-colors'
                          onClick={handleEditContractor}
                        >
                          Edit
                        </button>
                        <button
                          className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors'
                          onClick={closeDetailsModal}
                        >
                          Close
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Task from Email Modal */}
      {showCreateTaskModal && selectedEmailForAction && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md mx-4'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-gray-900'>
                Create Task from Email
              </h3>
              <button
                onClick={() => {
                  setShowCreateTaskModal(false);
                  setSelectedEmailForAction(null);
                }}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={24} />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Task Title
                </label>
                <input
                  type='text'
                  defaultValue={selectedEmailForAction.subject}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  placeholder='Enter task title'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Description
                </label>
                <textarea
                  rows={4}
                  defaultValue={selectedEmailForAction.content.substring(
                    0,
                    200
                  )}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  placeholder='Enter task description'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Due Date
                </label>
                <input
                  type='date'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Priority
                </label>
                <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'>
                  <option value='low'>Low</option>
                  <option value='medium' selected>
                    Medium
                  </option>
                  <option value='high'>High</option>
                </select>
              </div>
            </div>

            <div className='flex gap-3 mt-6'>
              <button
                onClick={() => {
                  setShowCreateTaskModal(false);
                  setSelectedEmailForAction(null);
                }}
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleSaveTaskFromEmail({
                    title: 'Task from Email',
                    description: 'Task created from email',
                    dueDate: new Date().toISOString().split('T')[0],
                    priority: 'medium',
                  })
                }
                className='flex-1 px-4 py-2 bg-archer-neon text-black font-semibold rounded-lg hover:bg-archer-neon/90 transition-colors'
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event from Email Modal */}
      {showCreateEventModal && selectedEmailForAction && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md mx-4'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-gray-900'>
                Create Event from Email
              </h3>
              <button
                onClick={() => {
                  setShowCreateEventModal(false);
                  setSelectedEmailForAction(null);
                }}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={24} />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Event Type
                </label>
                <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'>
                  <option value='meeting'>Meeting</option>
                  <option value='call'>Call</option>
                  <option value='site-visit'>Site Visit</option>
                  <option value='event'>Event</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Event Title
                </label>
                <input
                  type='text'
                  defaultValue={selectedEmailForAction.subject}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  placeholder='Enter event title'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Description
                </label>
                <textarea
                  rows={4}
                  defaultValue={selectedEmailForAction.content.substring(
                    0,
                    200
                  )}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  placeholder='Enter event description'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Start Date
                  </label>
                  <input
                    type='date'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Start Time
                  </label>
                  <input
                    type='time'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    End Date
                  </label>
                  <input
                    type='date'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    End Time
                  </label>
                  <input
                    type='time'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  />
                </div>
              </div>
            </div>

            <div className='flex gap-3 mt-6'>
              <button
                onClick={() => {
                  setShowCreateEventModal(false);
                  setSelectedEmailForAction(null);
                }}
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleSaveEventFromEmail({
                    type: 'meeting',
                    title: 'Event from Email',
                    description: 'Event created from email',
                    startDate: new Date().toISOString().split('T')[0],
                    startTime: '09:00',
                    endDate: new Date().toISOString().split('T')[0],
                    endTime: '10:00',
                  })
                }
                className='flex-1 px-4 py-2 bg-archer-neon text-black font-semibold rounded-lg hover:bg-archer-neon/90 transition-colors'
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderListView = () => (
    <div className='p-6'>
      <div className='bg-white rounded-lg border border-gray-200'>
        {filteredContractors.map((contractor, index) => (
          <div
            key={contractor.id}
            className={`p-4 ${index !== filteredContractors.length - 1 ? 'border-b border-gray-200' : ''} cursor-pointer hover:bg-gray-50 transition-colors`}
            onClick={() => openDetailsModal(contractor)}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-archer-neon rounded-full flex items-center justify-center'>
                  <span className='text-black font-semibold text-lg'>
                    {contractor.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </span>
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>
                    {contractor.name}
                  </h3>
                  <p className='text-sm text-gray-600'>{contractor.company}</p>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <div className='text-right'>
                  <p className='text-sm font-medium'>{contractor.hourlyRate}</p>
                  <p className='text-xs text-gray-500'>Hourly Rate</p>
                </div>
                <div className='flex items-center gap-2'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contractor.status)}`}
                  >
                    {contractor.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getComplianceColor(contractor.complianceStatus)}`}
                  >
                    {getComplianceIcon(contractor.complianceStatus)}
                    {contractor.complianceStatus}
                  </span>
                </div>
                <button
                  className='px-3 py-1 bg-archer-neon text-black text-sm font-medium rounded hover:bg-archer-neon/90'
                  onClick={e => {
                    e.stopPropagation();
                    openDetailsModal(contractor);
                  }}
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTableView = () => (
    <div className='p-6'>
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Contractor
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Contact
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Rate
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Expiry
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredContractors.map(contractor => (
              <tr
                key={contractor.id}
                className='hover:bg-gray-50 cursor-pointer'
                onClick={() => openDetailsModal(contractor)}
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div>
                    <div className='text-sm font-medium text-gray-900'>
                      {contractor.name}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {contractor.company}
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {contractor.email}
                  </div>
                  <div className='text-sm text-gray-500'>
                    {contractor.phone}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contractor.status)}`}
                    >
                      {contractor.status}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getComplianceColor(contractor.complianceStatus)}`}
                    >
                      {getComplianceIcon(contractor.complianceStatus)}
                      {contractor.complianceStatus}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {contractor.hourlyRate}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {contractor.expiryDate}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  <button
                    className='text-archer-neon hover:text-archer-neon/80'
                    onClick={e => {
                      e.stopPropagation();
                      openDetailsModal(contractor);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderKanbanView = () => (
    <div className='p-6'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-gray-50 rounded-lg p-4'>
          <h3 className='font-semibold text-gray-900 mb-4'>
            Active & Compliant
          </h3>
          <div className='space-y-3'>
            {filteredContractors
              .filter(
                c => c.status === 'active' && c.complianceStatus === 'compliant'
              )
              .map(contractor => (
                <div
                  key={contractor.id}
                  className='bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow'
                  onClick={() => openDetailsModal(contractor)}
                >
                  <h4 className='font-medium text-sm'>{contractor.name}</h4>
                  <p className='text-xs text-gray-600'>{contractor.company}</p>
                </div>
              ))}
          </div>
        </div>
        <div className='bg-gray-50 rounded-lg p-4'>
          <h3 className='font-semibold text-gray-900 mb-4'>Pending Review</h3>
          <div className='space-y-3'>
            {filteredContractors
              .filter(c => c.complianceStatus === 'pending')
              .map(contractor => (
                <div
                  key={contractor.id}
                  className='bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow'
                  onClick={() => openDetailsModal(contractor)}
                >
                  <h4 className='font-medium text-sm'>{contractor.name}</h4>
                  <p className='text-xs text-gray-600'>{contractor.company}</p>
                </div>
              ))}
          </div>
        </div>
        <div className='bg-gray-50 rounded-lg p-4'>
          <h3 className='font-semibold text-gray-900 mb-4'>Expiring Soon</h3>
          <div className='space-y-3'>
            {filteredContractors
              .filter(c => c.complianceStatus === 'warning')
              .map(contractor => (
                <div
                  key={contractor.id}
                  className='bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow'
                  onClick={() => openDetailsModal(contractor)}
                >
                  <h4 className='font-medium text-sm'>{contractor.name}</h4>
                  <p className='text-xs text-gray-600'>{contractor.company}</p>
                </div>
              ))}
          </div>
        </div>
        <div className='bg-gray-50 rounded-lg p-4'>
          <h3 className='font-semibold text-gray-900 mb-4'>Expired</h3>
          <div className='space-y-3'>
            {filteredContractors
              .filter(c => c.complianceStatus === 'expired')
              .map(contractor => (
                <div
                  key={contractor.id}
                  className='bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow'
                  onClick={() => openDetailsModal(contractor)}
                >
                  <h4 className='font-medium text-sm'>{contractor.name}</h4>
                  <p className='text-xs text-gray-600'>{contractor.company}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'grid':
        return renderGridView();
      case 'list':
        return renderListView();
      case 'table':
        return renderTableView();
      case 'kanban':
        return renderKanbanView();
      default:
        return renderGridView();
    }
  };

  return (
    <div className='h-full flex flex-col bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              {activeTab === 'contractors'
                ? 'Contractor Management'
                : 'Sub-Contractor Management'}
            </h1>
            <p className='text-gray-600 mt-1'>
              {activeTab === 'contractors'
                ? 'Manage your contractors and their compliance requirements'
                : 'Manage your sub-contractors and their compliance requirements'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <button className='px-4 py-2 bg-archer-neon text-black font-semibold rounded-lg hover:bg-archer-neon/90 flex items-center gap-2'>
              <UserPlus size={16} />
              Add{' '}
              {activeTab === 'contractors' ? 'Contractor' : 'Sub-Contractor'}
            </button>
            <button className='px-4 py-2 text-gray-600 hover:text-gray-800'>
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='bg-white border-b px-6 py-2'>
        <div className='flex space-x-2'>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'contractors' ? 'bg-archer-neon text-black' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setActiveTab('contractors')}
          >
            Contractors
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'sub-contractors' ? 'bg-archer-neon text-black' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setActiveTab('sub-contractors')}
          >
            Sub-Contractors
          </button>
        </div>
      </div>

      {/* Search and View Toggles */}
      <div className='bg-white border-b px-6 py-4 flex items-center gap-4'>
        <div className='relative flex-1 max-w-md'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
            size={20}
          />
          <input
            type='text'
            placeholder={`Search ${activeTab}...`}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='flex border border-gray-300 rounded-lg'>
          <button
            className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-archer-neon text-black' : 'bg-white text-gray-600'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} />
          </button>
          <button
            className={`px-3 py-2 ${viewMode === 'list' ? 'bg-archer-neon text-black' : 'bg-white text-gray-600'}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
          <button
            className={`px-3 py-2 ${viewMode === 'table' ? 'bg-archer-neon text-black' : 'bg-white text-gray-600'}`}
            onClick={() => setViewMode('table')}
          >
            <Table size={16} />
          </button>
          <button
            className={`px-3 py-2 ${viewMode === 'kanban' ? 'bg-archer-neon text-black' : 'bg-white text-gray-600'}`}
            onClick={() => setViewMode('kanban')}
          >
            <Columns size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-auto'>
        {/* Stats Cards */}
        <div className='p-6'>
          <button
            onClick={toggleStats}
            className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors mb-4'
          >
            {statsExpanded ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
            Contractor Metrics
          </button>

          {statsExpanded && (
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-200 mb-6'>
              <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-archer-grey rounded-lg flex items-center justify-center'>
                    <UserPlus className='h-5 w-5 text-archer-neon' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>
                      Total{' '}
                      {activeTab === 'contractors'
                        ? 'Contractors'
                        : 'Sub-Contractors'}
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {filteredContractors.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                    <CheckCircle className='h-5 w-5 text-green-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Active & Compliant</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {
                        filteredContractors.filter(
                          c =>
                            c.status === 'active' &&
                            c.complianceStatus === 'compliant'
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center'>
                    <AlertTriangle className='h-5 w-5 text-yellow-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Pending Review</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {
                        filteredContractors.filter(
                          c => c.complianceStatus === 'pending'
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center'>
                    <Clock className='h-5 w-5 text-red-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Expiring Soon</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {
                        filteredContractors.filter(
                          c => c.complianceStatus === 'warning'
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Contractors;
