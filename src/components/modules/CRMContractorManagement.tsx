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
  Wrench,
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

interface Contractor extends Client {
  availability: 'available' | 'busy' | 'unavailable';
  // years
  certifications: string[];
  contacts: Contact[];
  currentProjects: number;
  experience: number; 
  hourlyRate: number;
  skills: string[];
}

const CRMContractorManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contractors' | 'contacts'>('contractors');
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isEditingContractor, setIsEditingContractor] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contractorFormData, setContractorFormData] = useState<Partial<Contractor>>({});
  const [contactFormData, setContactFormData] = useState<Partial<Contact>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [contractorEmails, setContractorEmails] = useState<EmailMessage[]>([]);

  useEffect(() => {
    const loadContractors = async () => {
      try {
        const clientsData = await demoDataService.getClients();
        // Convert clients to contractors with additional fields
        const contractorsData = (clientsData || []).map(client => ({
          ...client,
          contacts: generateMockContacts(client.id),
          skills: generateMockSkills(),
          hourlyRate: Math.floor(Math.random() * 150) + 30, // £30-180/hour
          availability: ['available', 'busy', 'unavailable'][Math.floor(Math.random() * 3)] as 'available' | 'busy' | 'unavailable',
          experience: Math.floor(Math.random() * 15) + 1, // 1-15 years
          certifications: generateMockCertifications(),
          currentProjects: Math.floor(Math.random() * 5) // 0-4 projects
        }));
        setContractors(contractorsData);
      } catch (error) {
        console.warn('Failed to load contractors:', error);
        setContractors([]);
      }
    };

    loadContractors();
  }, []);

  const generateMockContacts = (contractorId: number): Contact[] => {
    const contactNames = [
      'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis',
      'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez'
    ];
    
    const positions = [
      'Site Manager', 'Project Coordinator', 'Safety Officer', 'Quality Controller',
      'Team Lead', 'Supervisor', 'Foreman', 'Site Engineer'
    ];

    const departments = [
      'Construction', 'Site Management', 'Safety', 'Quality Assurance',
      'Project Management', 'Engineering', 'Operations', 'Maintenance'
    ];

    const numContacts = Math.floor(Math.random() * 3) + 1; // 1-3 contacts
    const contacts: Contact[] = [];

    for (let i = 0; i < numContacts; i++) {
      contacts.push({
        id: contractorId * 100 + i,
        name: contactNames[Math.floor(Math.random() * contactNames.length)],
        email: `contact${i + 1}@contractor${contractorId}.com`,
        phone: `+44 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
        position: positions[Math.floor(Math.random() * positions.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        isPrimary: i === 0,
        notes: i === 0 ? 'Primary contact for all communications' : undefined
      });
    }

    return contacts;
  };

  const generateMockSkills = (): string[] => {
    const allSkills = [
      'Electrical Installation', 'Plumbing', 'Carpentry', 'Masonry',
      'Roofing', 'HVAC', 'Welding', 'Painting',
      'Flooring', 'Landscaping', 'Demolition', 'Concrete Work',
      'Steel Erection', 'Scaffolding', 'Excavation', 'Site Preparation'
    ];
    
    const numSkills = Math.floor(Math.random() * 6) + 2; // 2-7 skills
    const skills: string[] = [];
    
    while (skills.length < numSkills) {
      const skill = allSkills[Math.floor(Math.random() * allSkills.length)];
      if (!skills.includes(skill)) {
        skills.push(skill);
      }
    }
    
    return skills;
  };

  const generateMockCertifications = (): string[] => {
    const allCertifications = [
      'CSCS Card', 'SSSTS', 'SMSTS', 'First Aid',
      'Working at Heights', 'Asbestos Awareness', 'Manual Handling',
      'Fire Safety', 'COSHH', 'Confined Spaces'
    ];
    
    const numCertifications = Math.floor(Math.random() * 4) + 1; // 1-4 certifications
    const certifications: string[] = [];
    
    while (certifications.length < numCertifications) {
      const cert = allCertifications[Math.floor(Math.random() * allCertifications.length)];
      if (!certifications.includes(cert)) {
        certifications.push(cert);
      }
    }
    
    return certifications;
  };

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('crmContractorsStatsExpanded', JSON.stringify(newState));
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

  const getContractorStats = () => {
    const totalContractors = contractors.length;
    const availableContractors = contractors.filter(c => c.availability === 'available').length;
    const totalRevenue = contractors.reduce((sum, contractor) => sum + (contractor.revenue || 0), 0);
    const avgHourlyRate = totalContractors > 0 ? contractors.reduce((sum, c) => sum + c.hourlyRate, 0) / totalContractors : 0;

    return {
      totalContractors,
      availableContractors,
      totalRevenue,
      avgHourlyRate
    };
  };

  const handleAddContractor = () => {
    setContractorFormData({});
    setIsEditingContractor(false);
    setShowContractorModal(true);
  };

  const handleEditContractor = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setContractorFormData(contractor);
    setIsEditingContractor(true);
    setShowContractorModal(true);
  };

  const handleSaveContractor = () => {
    if (isEditingContractor && selectedContractor) {
      // Update existing contractor
      setContractors(prev => prev.map(c => 
        c.id === selectedContractor.id 
          ? { ...c, ...contractorFormData }
          : c
      ));
    } else {
      // Add new contractor
      const newContractor: Contractor = {
        id: Date.now(),
        name: contractorFormData.name || '',
        email: contractorFormData.email || '',
        phone: contractorFormData.phone || '',
        address: contractorFormData.address || DEFAULT_UK_ADDRESS,
        status: contractorFormData.status || 'active',
        revenue: contractorFormData.revenue || 0,
        contacts: [],
        skills: contractorFormData.skills || [],
        hourlyRate: contractorFormData.hourlyRate || 50,
        availability: contractorFormData.availability || 'available',
        experience: contractorFormData.experience || 3,
        certifications: contractorFormData.certifications || [],
        currentProjects: contractorFormData.currentProjects || 0
      };
      setContractors(prev => [...prev, newContractor]);
    }
    setShowContractorModal(false);
    setContractorFormData({});
  };

  const handleDeleteContractor = (contractorId: number) => {
    setContractors(prev => prev.filter(c => c.id !== contractorId));
  };

  const handleAddContact = (contractorId: number) => {
    setContactFormData({});
    setIsEditingContact(false);
    setShowContactModal(true);
  };

  const handleEditContact = (contractor: Contractor, contact: Contact) => {
    setSelectedContractor(contractor);
    setContactFormData(contact);
    setIsEditingContact(true);
    setShowContactModal(true);
  };

  const handleSaveContact = () => {
    if (!selectedContractor) return;

    if (isEditingContact) {
      // Update existing contact
      setContractors(prev => prev.map(c => 
        c.id === selectedContractor.id 
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
      
      setContractors(prev => prev.map(c => 
        c.id === selectedContractor.id 
          ? { ...c, contacts: [...c.contacts, newContact] }
          : c
      ));
    }
    setShowContactModal(false);
    setContactFormData({});
  };

  const handleDeleteContact = (contractorId: number, contactId: number) => {
    setContractors(prev => prev.map(c => 
      c.id === contractorId 
        ? { ...c, contacts: c.contacts.filter(contact => contact.id !== contactId) }
        : c
    ));
  };

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contractor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = getContractorStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Contractor Management</h1>
          <p className="text-gray-600">Manage contractors and their contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddContractor}
            className="inline-flex items-center gap-2 px-4 py-2 bg-constructbms-green text-white rounded-lg hover:bg-constructbms-green/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Contractor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contractors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContractors}</p>
            </div>
            <Wrench className="w-8 h-8 text-constructbms-green" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{stats.availableContractors}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <PoundSterling className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Hourly Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgHourlyRate)}</p>
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
              onClick={() => setActiveTab('contractors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contractors'
                  ? 'border-constructbms-green text-constructbms-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contractors
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
          {activeTab === 'contractors' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search contractors..."
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

              {/* Contractors Grid */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContractors.map((contractor) => (
                    <div key={contractor.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{contractor.name}</h3>
                          <p className="text-sm text-gray-600">{contractor.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditContractor(contractor)}
                            className="p-1 text-gray-400 hover:text-constructbms-green"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContractor(contractor.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contractor.status)}`}>
                            {contractor.status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(contractor.availability)}`}>
                            {contractor.availability}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <p><strong>Hourly Rate:</strong> {formatCurrency(contractor.hourlyRate)}</p>
                          <p><strong>Experience:</strong> {contractor.experience} years</p>
                          <p><strong>Current Projects:</strong> {contractor.currentProjects}</p>
                          <p><strong>Skills:</strong></p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contractor.skills.slice(0, 3).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                            {contractor.skills.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{contractor.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{contractor.contacts.length} contacts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contractors List */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {filteredContractors.map((contractor) => (
                    <div key={contractor.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{contractor.name}</h3>
                            <p className="text-sm text-gray-600">{contractor.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contractor.status)}`}>
                              {contractor.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(contractor.availability)}`}>
                              {contractor.availability}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(contractor.hourlyRate)}/hr</p>
                            <p className="text-xs text-gray-600">{contractor.experience} years exp.</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditContractor(contractor)}
                              className="p-1 text-gray-400 hover:text-constructbms-green"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteContractor(contractor.id)}
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

              {/* Contractors Table */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hourly Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContractors.map((contractor) => (
                        <tr key={contractor.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{contractor.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contractor.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contractor.status)}`}>
                              {contractor.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(contractor.availability)}`}>
                              {contractor.availability}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(contractor.hourlyRate)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contractor.experience} years</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contractor.currentProjects}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditContractor(contractor)}
                                className="text-constructbms-green hover:text-constructbms-green/80"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteContractor(contractor.id)}
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
              <p className="text-gray-600">Select a contractor to view their contacts.</p>
              {/* Contacts view would be implemented here */}
            </div>
          )}
        </div>
      </div>

      {/* Contractor Modal */}
      {showContractorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {isEditingContractor ? 'Edit Contractor' : 'Add Contractor'}
              </h2>
              <button
                onClick={() => setShowContractorModal(false)}
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
                    value={contractorFormData.name || ''}
                    onChange={(e) => setContractorFormData({...contractorFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={contractorFormData.email || ''}
                    onChange={(e) => setContractorFormData({...contractorFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={contractorFormData.phone || ''}
                    onChange={(e) => setContractorFormData({...contractorFormData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (£)</label>
                  <input
                    type="number"
                    value={contractorFormData.hourlyRate || ''}
                    onChange={(e) => setContractorFormData({...contractorFormData, hourlyRate: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input
                    type="number"
                    value={contractorFormData.experience || ''}
                    onChange={(e) => setContractorFormData({...contractorFormData, experience: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Projects</label>
                  <input
                    type="number"
                    value={contractorFormData.currentProjects || ''}
                    onChange={(e) => setContractorFormData({...contractorFormData, currentProjects: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={contractorFormData.status || 'active'}
                    onChange={(e) => setContractorFormData({...contractorFormData, status: e.target.value})}
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
                    value={contractorFormData.availability || 'available'}
                    onChange={(e) => setContractorFormData({...contractorFormData, availability: e.target.value as 'available' | 'busy' | 'unavailable'})}
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
                  onClick={() => setShowContractorModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveContractor}
                  className="px-4 py-2 bg-constructbms-green text-white rounded-lg hover:bg-constructbms-green/90 transition-colors"
                >
                  {isEditingContractor ? 'Update' : 'Add'} Contractor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMContractorManagement; 
