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
  notes: string;
  phone: string;
  position: string;
}

interface ClientWithContacts extends Client {
  contacts: Contact[];
}

const CRMClientManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clients' | 'contacts'>('clients');
  const [clients, setClients] = useState<ClientWithContacts[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientWithContacts | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [clientFormData, setClientFormData] = useState<Partial<ClientWithContacts>>({});
  const [contactFormData, setContactFormData] = useState<Partial<Contact>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table' | 'timeline'>('grid');
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [clientEmails, setClientEmails] = useState<EmailMessage[]>([]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await demoDataService.getClients();
        // Add contacts to each client
        const clientsWithContacts = (clientsData || []).map(client => ({
          ...client,
          contacts: generateMockContacts(client.id)
        }));
        setClients(clientsWithContacts);
      } catch (error) {
        console.warn('Failed to load clients:', error);
        setClients([]);
      }
    };

    loadClients();
  }, []);

  const generateMockContacts = (clientId: number): Contact[] => {
    const contactNames = [
      'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis',
      'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez'
    ];
    
    const positions = [
      'CEO', 'CTO', 'Project Manager', 'Operations Director',
      'Finance Manager', 'HR Director', 'Sales Manager', 'Technical Lead'
    ];

    const departments = [
      'Executive', 'Technology', 'Operations', 'Finance',
      'Human Resources', 'Sales', 'Engineering', 'Management'
    ];

    const numContacts = Math.floor(Math.random() * 5) + 1; // 1-5 contacts
    const contacts: Contact[] = [];

    for (let i = 0; i < numContacts; i++) {
      contacts.push({
        id: clientId * 100 + i,
        name: contactNames[Math.floor(Math.random() * contactNames.length)],
        email: `contact${i + 1}@client${clientId}.com`,
        phone: `+44 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
        position: positions[Math.floor(Math.random() * positions.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        isPrimary: i === 0,
        notes: i === 0 ? 'Primary contact for all communications' : ''
      });
    }

    return contacts;
  };

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('crmClientsStatsExpanded', JSON.stringify(newState));
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getClientStats = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'Active').length;
    const totalRevenue = clients.reduce((sum, client) => sum + (parseFloat(client.value) || 0), 0);
    const avgRevenue = totalClients > 0 ? totalRevenue / totalClients : 0;

    return {
      totalClients,
      activeClients,
      totalRevenue,
      avgRevenue
    };
  };

  const handleAddClient = () => {
    setClientFormData({});
    setIsEditingClient(false);
    setShowClientModal(true);
  };

  const handleEditClient = (client: ClientWithContacts) => {
    setSelectedClient(client);
    setClientFormData(client);
    setIsEditingClient(true);
    setShowClientModal(true);
  };

  const handleSaveClient = () => {
    if (isEditingClient && selectedClient) {
      // Update existing client
      setClients(clients.map(c => 
        c.id === selectedClient.id 
          ? { ...c, ...clientFormData }
          : c
      ));
    } else {
      // Add new client
      const newClient: ClientWithContacts = {
        id: Date.now(),
        name: clientFormData.name || '',
        email: clientFormData.email || '',
        phone: clientFormData.phone || '',
        address: clientFormData.address || DEFAULT_UK_ADDRESS,
        status: clientFormData.status || 'active',
        revenue: clientFormData.revenue || 0,
        contacts: [],
        ...clientFormData
      };
      setClients([...clients, newClient]);
    }
    setShowClientModal(false);
    setClientFormData({});
  };

  const handleDeleteClient = (clientId: number) => {
    setClients(clients.filter(c => c.id !== clientId));
  };

  const handleAddContact = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setContactFormData({});
      setIsEditingContact(false);
      setShowContactModal(true);
    }
  };

  const handleEditContact = (client: ClientWithContacts, contact: Contact) => {
    setSelectedClient(client);
    setContactFormData(contact);
    setIsEditingContact(true);
    setShowContactModal(true);
  };

  const handleSaveContact = () => {
    if (!selectedClient) return;

    if (isEditingContact) {
      // Update existing contact
      const updatedContacts = selectedClient.contacts.map(c =>
        c.id === contactFormData.id ? { ...c, ...contactFormData } : c
      );
      setClients(clients.map(c =>
        c.id === selectedClient.id ? { ...c, contacts: updatedContacts } : c
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
        isPrimary: selectedClient.contacts.length === 0,
        notes: contactFormData.notes,
        ...contactFormData
      };
      const updatedContacts = [...selectedClient.contacts, newContact];
      setClients(clients.map(c =>
        c.id === selectedClient.id ? { ...c, contacts: updatedContacts } : c
      ));
    }
    setShowContactModal(false);
    setContactFormData({});
  };

  const handleDeleteContact = (clientId: number, contactId: number) => {
    setClients(clients.map(c =>
      c.id === clientId
        ? { ...c, contacts: c.contacts.filter(contact => contact.id !== contactId) }
        : c
    ));
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contacts.some(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).filter(client =>
    statusFilter === 'all' || client.status === statusFilter
  ).filter(client =>
    clientFilter === 'all' || client.id.toString() === clientFilter
  );

  // Get all contacts from filtered clients
  const allContacts = filteredClients.flatMap(client => 
    client.contacts.map(contact => ({ ...contact, clientName: client.name, clientId: client.id }))
  );

  // Filter contacts based on client filter
  const filteredContacts = clientFilter === 'all' 
    ? allContacts 
    : allContacts.filter(contact => contact.clientId.toString() === clientFilter);

  const stats = getClientStats();

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            CRM Client Management
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage clients and their contacts
          </p>
        </div>
        <button
          onClick={handleAddClient}
          className='bg-constructbms-blue text-black px-4 py-2 rounded-lg hover:bg-constructbms-green transition-colors duration-200 flex items-center space-x-2'
        >
          <Plus className='h-4 w-4' />
          <span>New Client</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className='mt-4'>
        <button
          onClick={toggleStats}
          className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors mb-4'
        >
          {statsExpanded ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
          Client Metrics
        </button>

        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-constructbms-grey rounded-lg flex items-center justify-center'>
                  <Building2 className='h-5 w-5 text-constructbms-blue' />
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>Total Clients</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {stats.totalClients}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>Active Clients</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {stats.activeClients}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <PoundSterling className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>Total Revenue</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center'>
                  <BarChart3 className='h-5 w-5 text-orange-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>Avg Revenue</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {formatCurrency(stats.avgRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600'>
        <div className='flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4'>
          <div className='flex-1 relative w-full lg:w-auto'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search clients or contacts...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent bg-white dark:bg-gray-800'
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent bg-white dark:bg-gray-800'
          >
            <option value='all'>All Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
            <option value='prospect'>Prospect</option>
          </select>
          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent bg-white dark:bg-gray-800'
          >
            <option value='all'>All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id.toString()}>
                {client.name}
              </option>
            ))}
          </select>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-constructbms-blue text-black' : 'bg-gray-100 text-gray-600'}`}
            >
              <Grid className='h-4 w-4' />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-constructbms-blue text-black' : 'bg-gray-100 text-gray-600'}`}
            >
              <List className='h-4 w-4' />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-constructbms-blue text-black' : 'bg-gray-100 text-gray-600'}`}
            >
              <Table className='h-4 w-4' />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-lg ${viewMode === 'timeline' ? 'bg-constructbms-blue text-black' : 'bg-gray-100 text-gray-600'}`}
            >
              <Activity className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1'>
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'clients'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Clients ({filteredClients.length})
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'contacts'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Contacts ({filteredContacts.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'clients' ? (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer'
                  onClick={() => handleEditClient(client)}
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-start space-x-3'>
                      <div className='w-10 h-10 bg-constructbms-grey rounded-lg flex items-center justify-center'>
                        <Building2 className='h-5 w-5 text-constructbms-blue' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-900 dark:text-white'>
                          {client.name}
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>{client.email}</p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-1'>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}
                      >
                        {client.status}
                      </span>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
                      <Phone className='h-4 w-4 mr-2' />
                      <span>{client.phone}</span>
                    </div>

                    <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
                      <MapPin className='h-4 w-4 mr-2' />
                      <span>{client.address?.city || 'Location not set'}</span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>Value</span>
                      <span className='text-sm font-semibold text-constructbms-blue'>
                        {client.value}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>Contacts</span>
                      <span className='text-sm text-gray-900 dark:text-white'>
                        {client.contacts.length} contact{client.contacts.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className='flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-600'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClient(client);
                        }}
                        className='text-blue-600 hover:text-blue-900 text-sm'
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddContact(client.id);
                        }}
                        className='text-green-600 hover:text-green-900 text-sm'
                      >
                        Add Contact
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client.id);
                      }}
                      className='text-red-600 hover:text-red-900 text-sm'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className='space-y-4'>
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer'
                  onClick={() => handleEditClient(client)}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-12 h-12 bg-constructbms-grey rounded-lg flex items-center justify-center'>
                        <Building2 className='h-6 w-6 text-constructbms-blue' />
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-3'>
                          <h3 className='font-semibold text-gray-900 dark:text-white'>
                            {client.name}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}
                          >
                            {client.status}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>{client.email}</p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400'>
                      <div className='flex items-center space-x-2'>
                        <Phone className='h-4 w-4' />
                        <span>{client.phone}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <MapPin className='h-4 w-4' />
                        <span>{client.address?.city || 'Location not set'}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span>Value:</span>
                        <span className='font-semibold text-constructbms-blue'>{client.value}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Users className='h-4 w-4' />
                        <span>{client.contacts.length} contacts</span>
                      </div>
                    </div>
                    <div className='flex space-x-2'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClient(client);
                        }}
                        className='text-blue-600 hover:text-blue-900 text-sm'
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddContact(client.id);
                        }}
                        className='text-green-600 hover:text-green-900 text-sm'
                      >
                        Add Contact
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.id);
                        }}
                        className='text-red-600 hover:text-red-900 text-sm'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden'>
              <table className='w-full'>
                <thead className='bg-gray-50 dark:bg-gray-700'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Client
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Contact Info
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Location
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Value
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Contacts
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600'>
                  {filteredClients.map(client => (
                    <tr 
                      key={client.id} 
                      className='hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                      onClick={() => handleEditClient(client)}
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='w-8 h-8 bg-constructbms-grey rounded-lg flex items-center justify-center mr-3'>
                            <Building2 className='h-4 w-4 text-constructbms-blue' />
                          </div>
                          <div>
                            <div className='text-sm font-medium text-gray-900 dark:text-white'>
                              {client.name}
                            </div>
                            <div className='text-sm text-gray-500 dark:text-gray-400'>
                              {client.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {client.phone}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {client.address?.city || 'Location not set'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-constructbms-blue'>
                        {client.value}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {client.contacts.length} contact{client.contacts.length !== 1 ? 's' : ''}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex space-x-2'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClient(client);
                            }}
                            className='text-blue-600 hover:text-blue-900'
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddContact(client.id);
                            }}
                            className='text-green-600 hover:text-green-900'
                          >
                            Add Contact
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClient(client.id);
                            }}
                            className='text-red-600 hover:text-red-900'
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

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className='space-y-6'>
              {filteredClients.map((client, index) => (
                <div key={client.id} className='relative'>
                  {index !== 0 && (
                    <div className='absolute left-6 top-0 w-0.5 h-6 bg-gray-300 dark:bg-gray-600'></div>
                  )}
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-constructbms-grey rounded-full flex items-center justify-center flex-shrink-0'>
                      <Building2 className='h-6 w-6 text-constructbms-blue' />
                    </div>
                    <div className='flex-1 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-600'>
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h3 className='font-semibold text-gray-900 dark:text-white'>
                            {client.name}
                          </h3>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>{client.email}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}
                        >
                          {client.status}
                        </span>
                      </div>
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                        <div className='flex items-center space-x-2'>
                          <Phone className='h-4 w-4 text-gray-400' />
                          <span className='text-gray-600 dark:text-gray-400'>{client.phone}</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <MapPin className='h-4 w-4 text-gray-400' />
                          <span className='text-gray-600 dark:text-gray-400'>{client.address?.city || 'Location not set'}</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span className='text-gray-600 dark:text-gray-400'>Value:</span>
                          <span className='font-semibold text-constructbms-blue'>{client.value}</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Users className='h-4 w-4 text-gray-400' />
                          <span className='text-gray-600 dark:text-gray-400'>{client.contacts.length} contacts</span>
                        </div>
                      </div>
                      <div className='flex space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClient(client);
                          }}
                          className='text-blue-600 hover:text-blue-900 text-sm'
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddContact(client.id);
                          }}
                          className='text-green-600 hover:text-green-900 text-sm'
                        >
                          Add Contact
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClient(client.id);
                          }}
                          className='text-red-600 hover:text-red-900 text-sm'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Grid View for Contacts */}
          {viewMode === 'grid' && (
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer'
                  onClick={() => {
                    const client = clients.find(c => c.id === contact.clientId);
                    if (client) {
                      handleEditContact(client, contact);
                    }
                  }}
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-start space-x-3'>
                      <div className='w-10 h-10 bg-constructbms-grey rounded-lg flex items-center justify-center'>
                        <User className='h-5 w-5 text-constructbms-blue' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-900 dark:text-white'>
                          {contact.name}
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>{contact.email}</p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-1'>
                      {contact.isPrimary && (
                        <span className='px-2 py-1 text-xs font-medium rounded-full bg-constructbms-blue text-black'>
                          Primary
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
                      <Phone className='h-4 w-4 mr-2' />
                      <span>{contact.phone}</span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>Position</span>
                      <span className='text-sm text-gray-900 dark:text-white'>{contact.position}</span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>Department</span>
                      <span className='text-sm text-gray-900 dark:text-white'>{contact.department}</span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>Client</span>
                      <span className='text-sm text-gray-900 dark:text-white'>{contact.clientName}</span>
                    </div>
                  </div>
                  
                  <div className='flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-600'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const client = clients.find(c => c.id === contact.clientId);
                          if (client) {
                            handleEditContact(client, contact);
                          }
                        }}
                        className='text-blue-600 hover:text-blue-900 text-sm'
                      >
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteContact(contact.clientId, contact.id);
                      }}
                      className='text-red-600 hover:text-red-900 text-sm'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View for Contacts */}
          {viewMode === 'list' && (
            <div className='space-y-4'>
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-12 h-12 bg-constructbms-grey rounded-lg flex items-center justify-center'>
                        <User className='h-6 w-6 text-constructbms-blue' />
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-3'>
                          <h3 className='font-semibold text-gray-900 dark:text-white'>
                            {contact.name}
                          </h3>
                          {contact.isPrimary && (
                            <span className='px-2 py-1 text-xs font-medium rounded-full bg-constructbms-blue text-black'>
                              Primary
                            </span>
                          )}
                        </div>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>{contact.email}</p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400'>
                      <div className='flex items-center space-x-2'>
                        <Phone className='h-4 w-4' />
                        <span>{contact.phone}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span>Position:</span>
                        <span>{contact.position}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span>Department:</span>
                        <span>{contact.department}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span>Client:</span>
                        <span>{contact.clientName}</span>
                      </div>
                    </div>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => {
                          const client = clients.find(c => c.id === contact.clientId);
                          if (client) {
                            handleEditContact(client, contact);
                          }
                        }}
                        className='text-blue-600 hover:text-blue-900 text-sm'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.clientId, contact.id)}
                        className='text-red-600 hover:text-red-900 text-sm'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View for Contacts */}
          {viewMode === 'table' && (
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden'>
              <table className='w-full'>
                <thead className='bg-gray-50 dark:bg-gray-700'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Contact
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Role
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Contact Info
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Client
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600'>
                  {filteredContacts.map(contact => (
                    <tr key={contact.id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='w-8 h-8 bg-constructbms-grey rounded-lg flex items-center justify-center mr-3'>
                            <User className='h-4 w-4 text-constructbms-blue' />
                          </div>
                          <div>
                            <div className='text-sm font-medium text-gray-900 dark:text-white'>
                              {contact.name}
                            </div>
                            <div className='text-sm text-gray-500 dark:text-gray-400'>
                              {contact.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>
                          <div className='text-sm text-gray-900 dark:text-white'>{contact.position}</div>
                          <div className='text-sm text-gray-500 dark:text-gray-400'>{contact.department}</div>
                          {contact.isPrimary && (
                            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-constructbms-blue text-black'>
                              Primary
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {contact.phone}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {contact.clientName}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => {
                              const client = clients.find(c => c.id === contact.clientId);
                              if (client) {
                                handleEditContact(client, contact);
                              }
                            }}
                            className='text-blue-600 hover:text-blue-900'
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.clientId, contact.id)}
                            className='text-red-600 hover:text-red-900'
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

          {/* Timeline View for Contacts */}
          {viewMode === 'timeline' && (
            <div className='space-y-6'>
              {filteredContacts.map((contact, index) => (
                <div key={contact.id} className='relative'>
                  {index !== 0 && (
                    <div className='absolute left-6 top-0 w-0.5 h-6 bg-gray-300 dark:bg-gray-600'></div>
                  )}
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-constructbms-grey rounded-full flex items-center justify-center flex-shrink-0'>
                      <User className='h-6 w-6 text-constructbms-blue' />
                    </div>
                    <div className='flex-1 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-600'>
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h3 className='font-semibold text-gray-900 dark:text-white'>
                            {contact.name}
                          </h3>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>{contact.email}</p>
                        </div>
                        {contact.isPrimary && (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-constructbms-blue text-black'>
                            Primary
                          </span>
                        )}
                      </div>
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                        <div className='flex items-center space-x-2'>
                          <Phone className='h-4 w-4 text-gray-400' />
                          <span className='text-gray-600 dark:text-gray-400'>{contact.phone}</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span className='text-gray-600 dark:text-gray-400'>Position:</span>
                          <span className='text-gray-900 dark:text-white'>{contact.position}</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span className='text-gray-600 dark:text-gray-400'>Department:</span>
                          <span className='text-gray-900 dark:text-white'>{contact.department}</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span className='text-gray-600 dark:text-gray-400'>Client:</span>
                          <span className='text-gray-900 dark:text-white'>{contact.clientName}</span>
                        </div>
                      </div>
                      <div className='flex space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600'>
                        <button
                          onClick={() => {
                            const client = clients.find(c => c.id === contact.clientId);
                            if (client) {
                              handleEditContact(client, contact);
                            }
                          }}
                          className='text-blue-600 hover:text-blue-900 text-sm'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.clientId, contact.id)}
                          className='text-red-600 hover:text-red-900 text-sm'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Client Modal */}
      {showClientModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
            <h2 className='text-xl font-bold mb-4'>
              {isEditingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
            <div className='space-y-4'>
              <input
                type='text'
                placeholder='Client Name'
                value={clientFormData.name || ''}
                onChange={e => setClientFormData({...clientFormData, name: e.target.value})}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
              <input
                type='email'
                placeholder='Email'
                value={clientFormData.email || ''}
                onChange={e => setClientFormData({...clientFormData, email: e.target.value})}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
              <input
                type='tel'
                placeholder='Phone'
                value={clientFormData.phone || ''}
                onChange={e => setClientFormData({...clientFormData, phone: e.target.value})}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
              <select
                value={clientFormData.status || 'Active'}
                onChange={e => setClientFormData({...clientFormData, status: e.target.value as 'Active' | 'Prospect' | 'Inactive'})}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              >
                <option value='Active'>Active</option>
                <option value='Inactive'>Inactive</option>
                <option value='Prospect'>Prospect</option>
              </select>
              <input
                type='text'
                placeholder='Value'
                value={clientFormData.value || ''}
                onChange={e => setClientFormData({...clientFormData, value: e.target.value})}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
            </div>
            <div className='flex justify-end space-x-2 mt-6'>
              <button
                onClick={() => setShowClientModal(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800'
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClient}
                className='px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-green'
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedClient && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
            <h2 className='text-xl font-bold mb-4'>
              {isEditingContact ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <p className='text-sm text-gray-600 mb-4'>Client: {selectedClient.name}</p>
            <div className='space-y-4'>
              <input
                type='text'
                placeholder='Contact Name'
                value={contactFormData.name || ''}
                onChange={e => setContactFormData({...contactFormData, name: e.target.value})}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
              <input
                type='email'
                placeholder='Email'
                value={contactFormData.email || ''}
                onChange={e => setContactFormData({...contactFormData, email: e.target.value})}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
              <input
                type='tel'
                placeholder='Phone'
                value={contactFormData.phone || ''}
                onChange={e => setContactFormData({...contactFormData, phone: e.target.value})}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
              <input
                type='text'
                placeholder='Position'
                value={contactFormData.position || ''}
                onChange={e => setContactFormData({...contactFormData, position: e.target.value})}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
              <input
                type='text'
                placeholder='Department'
                value={contactFormData.department || ''}
                onChange={e => setContactFormData({...contactFormData, department: e.target.value})}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
              <textarea
                placeholder='Notes'
                value={contactFormData.notes || ''}
                onChange={e => setContactFormData({...contactFormData, notes: e.target.value})}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                rows={3}
              />
            </div>
            <div className='flex justify-end space-x-2 mt-6'>
              <button
                onClick={() => setShowContactModal(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800'
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContact}
                className='px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-green'
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMClientManagement; 
