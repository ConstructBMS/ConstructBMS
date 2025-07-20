import React, { useState, useEffect } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  PoundSterling,
  Users,
  Building,
  Download,
  Upload,
  Settings,
  UserPlus,
  Activity,
  FileText,
  MessageSquare,
  Tag,
  Building2,
  X,
  User,
  Target,
  Grid,
  List,
  Table,
  Columns,
  Share2,
  BarChart3,
  Bell,
  Edit3,
  Link,
  Shield,
  Database,
  Plus,
  Upload as UploadIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { demoDataService } from '../../services/demoData';
import type { Client } from '../../services/demoData';
import type {
  Customer,
  Company,
  Interaction,
  Deal,
  Opportunity,
  Task,
  Document,
} from '../../types';
import { DEFAULT_UK_ADDRESS } from '../../types';
import {
  emailIntelligenceService,
} from '../../services/emailIntelligence';
import type { EmailMessage } from '../../services/emailIntelligence';
import WYSIWYGEditor from '../WYSIWYGEditor';

interface Contact {
  department: string;
  email: string;
  id: number;
  isPrimary: boolean;
  name: string;
  notes?: string;
  phone: string;
  position: string;
}

interface ConsultantContact extends Contact {
  clientId: number;
  clientName: string;
}

interface Consultant {
  // How long they've been working with Archer
  // Total value of projects worked on with Archer
  address: any;
  availability: 'Available' | 'Busy' | 'Unavailable';
  company: string;
  completedProjects: number;
  contacts: ConsultantContact[];
  email: string;
  hourlyRate: number;
  id: number;
  lastWorked: string;
  name: string;
  notes: string;
  phone: string; 
  rating: number; 
  specialisations: string[];
  status: 'Active' | 'Inactive' | 'Suspended';
  totalBusinessValue: number;
  workingRelationshipMonths: number;
}

const CRMConsultantManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'consultants' | 'contacts'>('consultants');
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [showConsultantModal, setShowConsultantModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isEditingConsultant, setIsEditingConsultant] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [consultantFormData, setConsultantFormData] = useState<Partial<Consultant>>({});
  const [contactFormData, setContactFormData] = useState<Partial<Contact>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [consultantEmails, setConsultantEmails] = useState<EmailMessage[]>([]);

  useEffect(() => {
    const loadConsultants = async () => {
      try {
        const consultantsData = await demoDataService.getConsultants();
        // Add contacts to each consultant
        const consultantsWithContacts = (consultantsData || []).map(consultant => ({
          ...consultant,
          contacts: generateMockContacts(consultant.id)
        }));
        setConsultants(consultantsWithContacts);
      } catch (error) {
        console.warn('Failed to load consultants:', error);
        setConsultants([]);
      }
    };

    loadConsultants();
  }, []);

  const generateMockContacts = (consultantId: number): ConsultantContact[] => {
    const contactNames = [
      'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis',
      'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez'
    ];
    
    const positions = [
      'Senior Consultant', 'Technical Lead', 'Project Manager', 'Business Analyst',
      'Solution Architect', 'Data Scientist', 'DevOps Engineer', 'UX Designer'
    ];

    const departments = [
      'Technology', 'Strategy', 'Operations', 'Digital Transformation',
      'Data & Analytics', 'Cloud Services', 'Cybersecurity', 'Innovation'
    ];

    const numContacts = Math.floor(Math.random() * 3) + 1; // 1-3 contacts
    const contacts: ConsultantContact[] = [];

    for (let i = 0; i < numContacts; i++) {
      contacts.push({
        id: consultantId * 100 + i,
        name: contactNames[Math.floor(Math.random() * contactNames.length)],
        email: `contact${i + 1}@consultant${consultantId}.com`,
        phone: `+44 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
        position: positions[Math.floor(Math.random() * positions.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        isPrimary: i === 0,
        notes: i === 0 ? 'Primary contact for all communications' : undefined,
        clientName: 'Consultant Contact',
        clientId: consultantId
      });
    }

    return contacts;
  };

  const generateMockSpecializations = (): string[] => {
    const allSpecializations = [
      'Digital Transformation', 'Cloud Migration', 'Data Analytics', 'Cybersecurity',
      'DevOps', 'Agile Methodology', 'Project Management', 'Business Strategy',
      'Process Optimization', 'Change Management', 'Technology Architecture', 'AI/ML'
    ];
    
    const numSpecializations = Math.floor(Math.random() * 4) + 1; // 1-4 specializations
    const specializations: string[] = [];
    
    while (specializations.length < numSpecializations) {
      const spec = allSpecializations[Math.floor(Math.random() * allSpecializations.length)];
      if (!specializations.includes(spec)) {
        specializations.push(spec);
      }
    }
    
    return specializations;
  };

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('crmConsultantsStatsExpanded', JSON.stringify(newState));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getConsultantStats = () => {
    const totalConsultants = consultants.length;
    const availableConsultants = consultants.filter(c => c.availability === 'Available').length;
    const totalBusinessValue = consultants.reduce((sum, consultant) => sum + consultant.totalBusinessValue, 0);
    const avgWorkingRelationship = totalConsultants > 0 ? consultants.reduce((sum, c) => sum + c.workingRelationshipMonths, 0) / totalConsultants : 0;

    return {
      totalConsultants,
      availableConsultants,
      totalBusinessValue,
      avgWorkingRelationship
    };
  };

  const handleAddConsultant = () => {
    setConsultantFormData({});
    setIsEditingConsultant(false);
    setShowConsultantModal(true);
  };

  const handleEditConsultant = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setConsultantFormData(consultant);
    setIsEditingConsultant(true);
    setShowConsultantModal(true);
  };

  const handleSaveConsultant = () => {
    if (isEditingConsultant && selectedConsultant) {
      // Update existing consultant
      setConsultants(prev => prev.map(c => 
        c.id === selectedConsultant.id 
          ? { ...c, ...consultantFormData }
          : c
      ));
    } else {
      // Add new consultant
      const newConsultant: Consultant = {
        id: Date.now(),
        name: consultantFormData.name || '',
        email: consultantFormData.email || '',
        phone: consultantFormData.phone || '',
        address: consultantFormData.address || DEFAULT_UK_ADDRESS,
        status: consultantFormData.status || 'active',
        revenue: consultantFormData.revenue || 0,
        contacts: [],
        specializations: consultantFormData.specializations || [],
        hourlyRate: consultantFormData.hourlyRate || 100,
        availability: consultantFormData.availability || 'available',
        experience: consultantFormData.experience || 5
      };
      setConsultants(prev => [...prev, newConsultant]);
    }
    setShowConsultantModal(false);
    setConsultantFormData({});
  };

  const handleDeleteConsultant = (consultantId: number) => {
    setConsultants(prev => prev.filter(c => c.id !== consultantId));
  };

  const handleAddContact = (consultantId: number) => {
    setContactFormData({});
    setIsEditingContact(false);
    setShowContactModal(true);
  };

  const handleEditContact = (consultant: Consultant, contact: Contact) => {
    setSelectedConsultant(consultant);
    setContactFormData(contact);
    setIsEditingContact(true);
    setShowContactModal(true);
  };

  const handleSaveContact = () => {
    if (!selectedConsultant) return;

    if (isEditingContact) {
      // Update existing contact
      setConsultants(prev => prev.map(c => 
        c.id === selectedConsultant.id 
          ? {
              ...c,
              contacts: c.contacts.map(contact => 
                contact.id === contactFormData.id 
                  ? { ...contact, ...contactFormData }
                  : contact
              )
            }
          : c
      ));
    } else {
      // Add new contact
      const newContact: Contact = {
        id: Date.now(),
        name: contactFormData.name || '',
        email: contactFormData.email || '',
        phone: contactFormData.phone || '',
        position: contactFormData.position || '',
        department: contactFormData.department || '',
        isPrimary: contactFormData.isPrimary || false,
        notes: contactFormData.notes
      };
      
      setConsultants(prev => prev.map(c => 
        c.id === selectedConsultant.id 
          ? { ...c, contacts: [...c.contacts, newContact] }
          : c
      ));
    }
    setShowContactModal(false);
    setContactFormData({});
  };

  const handleDeleteContact = (consultantId: number, contactId: number) => {
    setConsultants(prev => prev.map(c => 
      c.id === consultantId 
        ? { ...c, contacts: c.contacts.filter(contact => contact.id !== contactId) }
        : c
    ));
  };

  const filteredConsultants = consultants.filter(consultant => {
    const matchesSearch = consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consultant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = getConsultantStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Consultant Management</h1>
          <p className="text-gray-600">Manage consultants and their contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddConsultant}
            className="inline-flex items-center gap-2 px-4 py-2 bg-constructbms-green text-white rounded-lg hover:bg-constructbms-green/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Consultant
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Consultants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalConsultants}</p>
            </div>
            <Users className="w-8 h-8 text-constructbms-green" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{stats.availableConsultants}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Business Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBusinessValue)}</p>
            </div>
            <PoundSterling className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Working Relationship</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avgWorkingRelationship / 12 * 10) / 10} years</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('consultants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'consultants'
                  ? 'border-constructbms-green text-constructbms-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Consultants
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contacts'
                  ? 'border-constructbms-green text-constructbms-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contacts
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'consultants' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search consultants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="prospect">Prospect</option>
                  </select>
                  <div className="flex border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-constructbms-green text-white' : 'text-gray-600'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-constructbms-green text-white' : 'text-gray-600'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 ${viewMode === 'table' ? 'bg-constructbms-green text-white' : 'text-gray-600'}`}
                    >
                      <Table className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Consultants Grid */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredConsultants.map((consultant) => (
                    <div key={consultant.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{consultant.name}</h3>
                          <p className="text-sm text-gray-600">{consultant.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditConsultant(consultant)}
                            className="p-1 text-gray-400 hover:text-constructbms-green"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteConsultant(consultant.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(consultant.status)}`}>
                            {consultant.status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(consultant.availability)}`}>
                            {consultant.availability}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <p><strong>Business Value:</strong> {formatCurrency(consultant.totalBusinessValue)}</p>
                          <p><strong>Working Together:</strong> {Math.round(consultant.workingRelationshipMonths / 12 * 10) / 10} years</p>
                          <p><strong>Specializations:</strong></p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {consultant.specialisations.map((spec, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{consultant.contacts.length} contacts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Consultants List */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {filteredConsultants.map((consultant) => (
                    <div key={consultant.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{consultant.name}</h3>
                            <p className="text-sm text-gray-600">{consultant.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(consultant.status)}`}>
                              {consultant.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(consultant.availability)}`}>
                              {consultant.availability}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(consultant.totalBusinessValue)}</p>
                            <p className="text-xs text-gray-600">{Math.round(consultant.workingRelationshipMonths / 12 * 10) / 10} years</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditConsultant(consultant)}
                              className="p-1 text-gray-400 hover:text-constructbms-green"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteConsultant(consultant.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Consultants Table */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Together</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredConsultants.map((consultant) => (
                        <tr key={consultant.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{consultant.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{consultant.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(consultant.status)}`}>
                              {consultant.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(consultant.availability)}`}>
                              {consultant.availability}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(consultant.totalBusinessValue)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Math.round(consultant.workingRelationshipMonths / 12 * 10) / 10} years</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditConsultant(consultant)}
                                className="text-constructbms-green hover:text-constructbms-green/80"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteConsultant(consultant.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <p className="text-gray-600">Select a consultant to view their contacts.</p>
              {/* Contacts view would be implemented here */}
            </div>
          )}
        </div>
      </div>

      {/* Consultant Modal */}
      {showConsultantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {isEditingConsultant ? 'Edit Consultant' : 'Add Consultant'}
              </h2>
              <button
                onClick={() => setShowConsultantModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={consultantFormData.name || ''}
                    onChange={(e) => setConsultantFormData({...consultantFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={consultantFormData.email || ''}
                    onChange={(e) => setConsultantFormData({...consultantFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={consultantFormData.phone || ''}
                    onChange={(e) => setConsultantFormData({...consultantFormData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (£)</label>
                  <input
                    type="number"
                    value={consultantFormData.hourlyRate || ''}
                    onChange={(e) => setConsultantFormData({...consultantFormData, hourlyRate: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input
                    type="number"
                    value={consultantFormData.experience || ''}
                    onChange={(e) => setConsultantFormData({...consultantFormData, experience: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={consultantFormData.status || 'active'}
                    onChange={(e) => setConsultantFormData({...consultantFormData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="prospect">Prospect</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <select
                    value={consultantFormData.availability || 'available'}
                    onChange={(e) => setConsultantFormData({...consultantFormData, availability: e.target.value as 'available' | 'busy' | 'unavailable'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowConsultantModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConsultant}
                  className="px-4 py-2 bg-constructbms-green text-white rounded-lg hover:bg-constructbms-green/90 transition-colors"
                >
                  {isEditingConsultant ? 'Update' : 'Add'} Consultant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMConsultantManagement; 
