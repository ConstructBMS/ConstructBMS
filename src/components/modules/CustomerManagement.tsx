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

// Types imported from shared types file

const mockCompanies: Company[] = [];

const mockCustomers: Customer[] = [];

const CustomerManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customers' | 'companies'>(
    'customers'
  );

  // Customer Management State
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerFormData, setCustomerFormData] = useState<Partial<Customer>>(
    {}
  );
  const [showTagManager, setShowTagManager] = useState(false);
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    'Enterprise',
    'Technology',
    'High-Value',
    'Legacy',
    'Migration',
    'Manufacturing',
    'Startup',
    'SME',
    'Prospect',
    'Active',
    'VIP',
    'Strategic',
    'Quick-Win',
  ]);

  // Company Management State
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyFormData, setCompanyFormData] = useState<Partial<Company>>({});
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [assignedToFilter, setAssignedToFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [revenueFilter, setRevenueFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<
    'grid' | 'list' | 'table' | 'kanban'
  >('grid');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showFilters, setShowFilters] = useState(false);

  // Clients State (from old CRM)
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [clientStatusFilter, setClientStatusFilter] = useState('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [clientLocationFilter, setClientLocationFilter] = useState('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [clientViewMode, setClientViewMode] = useState<'grid' | 'list'>('grid');

  // Nested modal states for interactive elements
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showTaskModal, setShowTaskModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showDealModal, setShowDealModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showContactHistoryModal, setShowContactHistoryModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showSocialMediaModal, setShowSocialMediaModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showAddressModal, setShowAddressModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showCompanyDetailsModal, setShowCompanyDetailsModal] = useState(false);

  // Data for nested modals
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedInteraction, setSelectedInteraction] =
    useState<Interaction | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Import/Export states
  const [importData, setImportData] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xlsx'>(
    'json'
  );

  // Add customer/company states
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState<Partial<Customer>>({});
  const [newCompanyData, setNewCompanyData] = useState<Partial<Company>>({});

  const [customerEmails, setCustomerEmails] = useState<EmailMessage[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await demoDataService.getClients();
        setClients(clientsData || []);
      } catch (error) {
        console.warn('Failed to load clients:', error);
        setClients([]);
      }
    };
    loadClients();
  }, []);

  // Listen for demo data refresh events
  useEffect(() => {
    const handleDemoDataRefresh = async () => {
      console.log('🔄 CustomerManagement: Demo data refresh event received');
      try {
        const clientsData = await demoDataService.getClients();
        setClients(clientsData || []);
  
      } catch (error) {
        console.warn('Failed to refresh clients:', error);
        setClients([]);
      }
    };

    window.addEventListener('demoDataRefreshed', handleDemoDataRefresh);
    
    return () => {
      window.removeEventListener('demoDataRefreshed', handleDemoDataRefresh);
    };
  }, []);

  useEffect(() => {
    if (editingCustomer) {
      // Get all emails for this customer
      const allEmails = emailIntelligenceService.getEmails();
      const relatedEmails = allEmails.filter(e => e.customerId === `cust_${editingCustomer.id}`);
      setCustomerEmails(relatedEmails);
    } else {
      setCustomerEmails([]);
    }
  }, [editingCustomer]);

  // Filtered customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || customer.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || customer.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Filtered clients
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.contact.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearchTerm.toLowerCase());
    const matchesStatus =
      clientStatusFilter === 'all' || client.status === clientStatusFilter;
    const matchesLocation =
      clientLocationFilter === 'all' ||
      client.location === clientLocationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const aValue = a[sortField as keyof Customer];
    const bValue = b[sortField as keyof Customer];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'prospect':
        return 'bg-blue-100 text-blue-700';
      case 'lead':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className='h-4 w-4' />;
      case 'call':
        return <Phone className='h-4 w-4' />;
      case 'meeting':
        return <Calendar className='h-4 w-4' />;
      case 'note':
        return <FileText className='h-4 w-4' />;
      default:
        return <MessageSquare className='h-4 w-4' />;
    }
  };

  // Client functions (from old CRM)
  const getClientStats = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'Active').length;
    const prospectClients = clients.filter(c => c.status === 'Prospect').length;
    const totalValue = clients.reduce((sum, client) => {
      const value = parseFloat(client.value.replace(/[£,]/g, ''));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    return { totalClients, activeClients, prospectClients, totalValue };
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddClient = (clientData: Partial<Client>) => {
    const newClient: Client = {
      id: Date.now(),
      name: clientData.name || '',
      contact: clientData.contact || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      location: clientData.location || '',
      projects: 0,
      value: '£0',
      status: 'Prospect',
      lastContact: 'Just added',
      address:
        typeof clientData.address === 'object'
          ? clientData.address
          : DEFAULT_UK_ADDRESS,
      company: clientData.company || clientData.name || '',
      notes: clientData.notes || '',
      isDemoData: false,
      createdAt: new Date().toISOString(),
      demoId: `client-${Date.now()}`,
    };

    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    demoDataService.saveClients(updatedClients);
    setShowAddClient(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpdateClient = (clientData: Partial<Client>) => {
    if (!editingClient) return;

    const updatedClients = clients.map(client =>
      client.id === editingClient.id ? { ...client, ...clientData } : client
    );

    setClients(updatedClients);
    demoDataService.saveClients(updatedClients);
    setEditingClient(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteClient = (clientId: number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      const updatedClients = clients.filter(client => client.id !== clientId);
      setClients(updatedClients);
      demoDataService.saveClients(updatedClients);
      if (selectedClient === clientId) {
        setSelectedClient(null);
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getClientStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Prospect':
        return 'bg-blue-100 text-blue-700';
      case 'Inactive':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCompanySizeColor = (size: string) => {
    switch (size) {
      case 'startup':
        return 'bg-blue-100 text-blue-800';
      case 'sme':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCompanyStats = () => {
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.status === 'active').length;
    const prospectCompanies = companies.filter(
      c => c.status === 'prospect'
    ).length;
    const totalRevenue = companies.reduce((sum, c) => sum + c.annualRevenue, 0);

    return {
      total: totalCompanies,
      active: activeCompanies,
      prospects: prospectCompanies,
      revenue: totalRevenue,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stats = getClientStats();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const companyStats = getCompanyStats();

  // Customer edit functions
  const handleEditCustomer = () => {
    if (editingCustomer) {
      setCustomerFormData(editingCustomer);
      setIsEditingCustomer(true);
    }
  };

  const handleSaveCustomer = () => {
    if (editingCustomer && customerFormData) {
      // Merge uploaded documents into the documents array
      const allowedTypes = ['contract', 'proposal', 'invoice', 'report'];
      const newDocs: Document[] = uploadedDocuments.map((file, idx) => ({
        id: `upload_${Date.now()}_${idx}`,
        name: file.name,
        type: allowedTypes.includes(file.type)
          ? (file.type as 'contract' | 'proposal' | 'invoice' | 'report')
          : 'other',
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'You',
        size: file.size,
      }));
      const updatedCustomer = {
        ...editingCustomer,
        ...customerFormData,
        documents: [...(editingCustomer.documents || []), ...newDocs],
      };
      setCustomers(
        customers.map(c => (c.id === editingCustomer.id ? updatedCustomer : c))
      );
      setEditingCustomer(updatedCustomer);
      setIsEditingCustomer(false);
      setCustomerFormData({});
      setUploadedDocuments([]);
    }
  };

  const handleCancelEditCustomer = () => {
    setIsEditingCustomer(false);
    setCustomerFormData({});
  };

  // Company edit functions
  const handleEditCompany = () => {
    if (editingCompany) {
      setCompanyFormData(editingCompany);
      setIsEditingCompany(true);
    }
  };

  const handleSaveCompany = () => {
    if (editingCompany && companyFormData) {
      const updatedCompany = { ...editingCompany, ...companyFormData };
      setCompanies(
        companies.map(c => (c.id === editingCompany.id ? updatedCompany : c))
      );
      setEditingCompany(updatedCompany);
      setIsEditingCompany(false);
      setCompanyFormData({});
    }
  };

  const handleCancelEditCompany = () => {
    setIsEditingCompany(false);
    setCompanyFormData({});
  };

  // Enhanced editing functions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleManageTags = (
    currentTags: string[],
    onSave: (tags: string[]) => void
  ) => {
    setEditingTags([...currentTags]);
    setShowTagManager(true);
  };

  const handleSaveTags = (onSave: (tags: string[]) => void) => {
    onSave(editingTags);
    setShowTagManager(false);
  };

  const handleAddTag = (tag: string) => {
    if (!editingTags.includes(tag)) {
      setEditingTags([...editingTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditingTags(editingTags.filter(t => t !== tag));
  };

  const handleAddNewTag = (newTag: string) => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag]);
      handleAddTag(newTag);
    }
  };

  const updateCustomerAddress = (field: string, value: string) => {
    const currentAddress = newCustomerData.address || DEFAULT_UK_ADDRESS;
    setNewCustomerData({
      ...newCustomerData,
      address: {
        street: currentAddress.street,
        city: currentAddress.city,
        state: currentAddress.state,
        zip: currentAddress.zip,
        country: currentAddress.country,
        [field]: value,
      },
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateCompanyAddress = (field: string, value: string) => {
    const currentAddress = newCompanyData.address || DEFAULT_UK_ADDRESS;
    setNewCompanyData({
      ...newCompanyData,
      address: {
        street: currentAddress.street,
        city: currentAddress.city,
        state: currentAddress.state,
        zip: currentAddress.zip,
        country: currentAddress.country,
        [field]: value,
      },
    });
  };

  const handleNavigateToOpportunity = (opportunityId: string) => {
    // Find the opportunity and open it in a modal
    const opportunity = editingCustomer?.opportunities.find(
      opp => opp.id === opportunityId
    );
    if (opportunity) {
      setSelectedOpportunity(opportunity);
      setShowOpportunityModal(true);
    }
  };

  const handleNavigateToTask = (taskId: string) => {
    // This would navigate to the Tasks module
    console.log(`Navigate to task: ${taskId}`);
  };

  const handleNavigateToDocument = (documentId: string) => {
    // TODO: Implement document viewer
    console.log('Navigate to document:', documentId);
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedDocuments(prev => [...prev, ...files]);
  };

  const handleDocumentDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setUploadedDocuments(prev => [...prev, ...files]);
  };

  const handleDocumentDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeUploadedDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddInteraction = (
    customerId: string,
    interaction: Omit<Interaction, 'id'>
  ) => {
    const newInteraction: Interaction = {
      ...interaction,
      id: Date.now().toString(),
    };

    setCustomers(
      customers.map(customer =>
        customer.id === customerId
          ? {
              ...customer,
              interactions: [...customer.interactions, newInteraction],
            }
          : customer
      )
    );
  };

  const handleAddTask = (
    customerId: string,
    task: Omit<Task, 'id' | 'createdAt'>
  ) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setCustomers(
      customers.map(customer =>
        customer.id === customerId
          ? { ...customer, tasks: [...customer.tasks, newTask] }
          : customer
      )
    );
  };

  // Helper functions for filter options
  const getUniqueIndustries = () => {
    const industries = customers.map(c => c.industry).filter(Boolean);
    return ['all', ...Array.from(new Set(industries))];
  };

  const getUniqueAssignedTo = () => {
    const assignedTo = customers.map(c => c.assignedTo).filter(Boolean);
    return ['all', ...Array.from(new Set(assignedTo))];
  };

  const getUniqueTags = () => {
    const allTags = customers.flatMap(c => c.tags);
    return ['all', ...Array.from(new Set(allTags))];
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setIndustryFilter('all');
    setAssignedToFilter('all');
    setTagFilter('all');
    setRevenueFilter('all');
  };

  // Import/Export functions
  const handleExport = () => {
    const dataToExport = {
      customers,
      companies,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    if (exportFormat === 'json') {
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customer-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'csv') {
      // Simple CSV export for customers
      const headers = [
        'Name',
        'Email',
        'Phone',
        'Company',
        'Status',
        'Total Revenue',
        'Last Contact',
      ];
      const csvData = customers.map(c => [
        c.name,
        c.email,
        c.phone,
        c.company,
        c.status,
        c.totalRevenue,
        c.lastContact,
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }

    setShowExportModal(false);
  };

  const handleImport = () => {
    try {
      const parsedData = JSON.parse(importData);

      if (parsedData.customers && Array.isArray(parsedData.customers)) {
        setCustomers(parsedData.customers);
      }

      if (parsedData.companies && Array.isArray(parsedData.companies)) {
        setCompanies(parsedData.companies);
      }

      setImportData('');
      setShowImportModal(false);
      alert('Data imported successfully!');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Invalid JSON data. Please check your import file.');
    }
  };

  const handleAddNewCustomer = () => {
    const newCustomer: Customer = {
      id: `customer-${Date.now()}`,
      name: newCustomerData.name || '',
      email: newCustomerData.email || '',
      phone: newCustomerData.phone || '',
      company: newCustomerData.company || '',
      companyId: newCustomerData.companyId,
      position: newCustomerData.position || '',
      status:
        (newCustomerData.status as
          | 'active'
          | 'inactive'
          | 'prospect'
          | 'lead') || 'prospect',
      source: newCustomerData.source || '',
      tags: newCustomerData.tags || [],
      address: newCustomerData.address || {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      },
      totalRevenue: newCustomerData.totalRevenue || 0,
      lastPurchase: newCustomerData.lastPurchase || '',
      nextFollowUp: newCustomerData.nextFollowUp || '',
      notes: newCustomerData.notes || '',
      assignedTo: newCustomerData.assignedTo || '',
      createdAt: new Date().toISOString(),
      lastContact: newCustomerData.lastContact || new Date().toISOString(),
      priority:
        (newCustomerData.priority as 'low' | 'medium' | 'high') || 'medium',
      industry: newCustomerData.industry || '',
      website: newCustomerData.website || '',
      socialMedia: newCustomerData.socialMedia || {},
      interactions: [],
      deals: [],
      opportunities: [],
      tasks: [],
      documents: [],
      customFields: {},
    };

    setCustomers([...customers, newCustomer]);
    setNewCustomerData({});
    setShowAddCustomerModal(false);
  };

  const handleAddNewCompany = () => {
    const newCompany: Company = {
      id: `company-${Date.now()}`,
      name: newCompanyData.name || '',
      industry: newCompanyData.industry || '',
      size: (newCompanyData.size as 'startup' | 'sme' | 'enterprise') || 'sme',
      website: newCompanyData.website || '',
      phone: newCompanyData.phone || '',
      email: newCompanyData.email || '',
      address: newCompanyData.address || {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      },
      status:
        (newCompanyData.status as 'active' | 'inactive' | 'prospect') ||
        'prospect',
      annualRevenue: newCompanyData.annualRevenue || 0,
      employeeCount: newCompanyData.employeeCount || 0,
      founded: newCompanyData.founded || '',
      description: newCompanyData.description || '',
      contacts: [],
      deals: [],
      opportunities: [],
      tasks: [],
      documents: [],
      lastContact: newCompanyData.lastContact || new Date().toISOString(),
      assignedTo: newCompanyData.assignedTo || '',
      tags: newCompanyData.tags || [],
      notes: newCompanyData.notes || '',
      socialMedia: newCompanyData.socialMedia || {},
      customFields: {},
    };

    setCompanies([...companies, newCompany]);
    setNewCompanyData({});
    setShowAddCompany(false);
  };

  // Nested modal handlers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenInteractionModal = (interaction: Interaction) => {
    setSelectedInteraction(interaction);
    setShowInteractionModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenOpportunityModal = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowOpportunityModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenTaskModal = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenDocumentModal = (document: Document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenDealModal = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowDealModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenRevenueModal = () => {
    setShowRevenueModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenContactHistoryModal = () => {
    setShowContactHistoryModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenSocialMediaModal = () => {
    setShowSocialMediaModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenAddressModal = () => {
    setShowAddressModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenCompanyDetailsModal = () => {
    setShowCompanyDetailsModal(true);
  };

  return (
    <div className='h-full flex flex-col bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              {activeTab === 'customers'
                ? 'Customer Management'
                : 'Company Management'}
            </h1>
            <p className='text-gray-600 mt-1'>
              {activeTab === 'customers'
                ? 'Manage your customer relationships and interactions'
                : 'Manage your company relationships and business partnerships'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <button
              className='px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2'
              onClick={() => setShowExportModal(true)}
              title='Export Data'
            >
              <Download size={16} />
              Export
            </button>
            <button
              className='px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2'
              onClick={() => setShowImportModal(true)}
              title='Import Data'
            >
              <Upload size={16} />
              Import
            </button>
            <button
              className='px-4 py-2 bg-constructbms-blue text-black font-semibold rounded-lg hover:bg-constructbms-blue/90 flex items-center gap-2'
              onClick={() =>
                activeTab === 'customers'
                  ? setShowAddCustomerModal(true)
                  : setShowAddCompany(true)
              }
              title={`Add ${activeTab === 'customers' ? 'Customer' : 'Company'}`}
            >
              <UserPlus size={16} />
              Add {activeTab === 'customers' ? 'Customer' : 'Company'}
            </button>
            <button
              className='px-4 py-2 text-gray-600 hover:text-gray-800'
              onClick={() => setShowSettingsModal(true)}
              title='Settings'
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='bg-white border-b px-6 py-2'>
        <div className='flex space-x-2'>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'customers' ? 'bg-constructbms-blue text-black' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setActiveTab('customers')}
          >
            Customers
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'companies' ? 'bg-constructbms-blue text-black' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setActiveTab('companies')}
          >
            Companies
          </button>
        </div>
      </div>

      {/* Customers Page Header */}
      {activeTab === 'customers' && (
        <div className='w-full'>
          <div className='flex flex-wrap items-center gap-2 px-6 py-4 bg-white border-b'>
            {/* Search */}
            <div className='relative'>
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                size={18}
              />
              <input
                type='text'
                placeholder='Search customers...'
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Filters */}
            <select
              className='border rounded px-3 py-1 text-sm'
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value='all'>All Statuses</option>
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
              <option value='prospect'>Prospect</option>
              <option value='lead'>Lead</option>
            </select>
            <select
              className='border rounded px-3 py-1 text-sm'
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value='all'>All Priorities</option>
              <option value='high'>High</option>
              <option value='medium'>Medium</option>
              <option value='low'>Low</option>
            </select>
            <select
              className='border rounded px-3 py-1 text-sm'
              value={industryFilter}
              onChange={e => setIndustryFilter(e.target.value)}
            >
              <option value='all'>All Industries</option>
              {getUniqueIndustries()
                .filter(ind => ind !== 'all')
                .map(ind => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
            </select>
            <select
              className='border rounded px-3 py-1 text-sm'
              value={assignedToFilter}
              onChange={e => setAssignedToFilter(e.target.value)}
            >
              <option value='all'>All Assignees</option>
              {getUniqueAssignedTo()
                .filter(a => a !== 'all')
                .map(a => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
            </select>
            <select
              className='border rounded px-3 py-1 text-sm'
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value)}
            >
              <option value='all'>All Tags</option>
              {getUniqueTags &&
                getUniqueTags().map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
            </select>
            {/* Sorting */}
            <select
              className='border rounded px-3 py-1 text-sm'
              value={sortField}
              onChange={e => setSortField(e.target.value)}
            >
              <option value='name'>Sort by Name</option>
              <option value='company'>Sort by Company</option>
              <option value='totalRevenue'>Sort by Revenue</option>
              <option value='lastContact'>Sort by Last Contact</option>
            </select>
            <button
              className='px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200'
              onClick={() =>
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              }
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
            {/* View toggles */}
            <div className='flex border border-gray-300 rounded-lg ml-2'>
              <button
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-constructbms-blue text-black' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('grid')}
                title='Grid View'
              >
                <Grid size={16} />
              </button>
              <button
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-constructbms-blue text-black' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('list')}
                title='List View'
              >
                <List size={16} />
              </button>
              <button
                className={`px-3 py-2 ${viewMode === 'table' ? 'bg-constructbms-blue text-black' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('table')}
                title='Table View'
              >
                <Table size={16} />
              </button>
              <button
                className={`px-3 py-2 ${viewMode === 'kanban' ? 'bg-constructbms-blue text-black' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('kanban')}
                title='Kanban View'
              >
                <Columns size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Companies Page Header */}
      {activeTab === 'companies' && (
        <div className='w-full'>
          <div className='flex flex-wrap items-center gap-2 px-6 py-4 bg-white border-b'>
            {/* Search */}
            <div className='relative'>
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                size={18}
              />
              <input
                type='text'
                placeholder='Search companies...'
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Filters */}
            <select
              className='border rounded px-3 py-1 text-sm'
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value='all'>All Statuses</option>
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
              <option value='prospect'>Prospect</option>
            </select>
            <select
              className='border rounded px-3 py-1 text-sm'
              value={industryFilter}
              onChange={e => setIndustryFilter(e.target.value)}
            >
              <option value='all'>All Industries</option>
              {getUniqueIndustries()
                .filter(ind => ind !== 'all')
                .map(ind => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
            </select>
            <select
              className='border rounded px-3 py-1 text-sm'
              value={assignedToFilter}
              onChange={e => setAssignedToFilter(e.target.value)}
            >
              <option value='all'>All Assignees</option>
              {getUniqueAssignedTo()
                .filter(a => a !== 'all')
                .map(a => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
            </select>
            {/* Sorting */}
            <select
              className='border rounded px-3 py-1 text-sm'
              value={sortField}
              onChange={e => setSortField(e.target.value)}
            >
              <option value='name'>Sort by Name</option>
              <option value='industry'>Sort by Industry</option>
              <option value='annualRevenue'>Sort by Revenue</option>
              <option value='lastContact'>Sort by Last Contact</option>
            </select>
            <button
              className='px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200'
              onClick={() =>
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              }
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
            {/* View toggles */}
            <div className='flex border border-gray-300 rounded-lg ml-2'>
              <button
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-constructbms-blue text-black' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('grid')}
                title='Grid View'
              >
                <Grid size={16} />
              </button>
              <button
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-constructbms-blue text-black' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('list')}
                title='List View'
              >
                <List size={16} />
              </button>
              <button
                className={`px-3 py-2 ${viewMode === 'table' ? 'bg-constructbms-blue text-black' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('table')}
                title='Table View'
              >
                <Table size={16} />
              </button>
              <button
                className={`px-3 py-2 ${viewMode === 'kanban' ? 'bg-constructbms-blue text-black' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('kanban')}
                title='Kanban View'
              >
                <Columns size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab and view mode */}
      {activeTab === 'customers' && (
        <div className='flex-1 overflow-auto'>
          {/* Customers Grid View */}
          {viewMode === 'grid' && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
              {sortedCustomers.map(customer => (
                <div
                  key={customer.id}
                  className='bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer'
                  onClick={() => {
                    setSelectedCustomer(customer.id);
                    setEditingCustomer(
                      customers.find(c => c.id === customer.id) || null
                    );
                    setShowCustomerModal(true);
                  }}
                >
                  <div className='p-6'>
                    {/* Header */}
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-semibold text-gray-900 text-lg truncate'>
                          {customer.name}
                        </h3>
                        <p className='text-gray-600 text-sm truncate'>
                          {customer.position}
                        </p>
                        <p className='text-gray-500 text-sm truncate'>
                          {customer.company}
                        </p>
                      </div>
                      <div className='flex flex-col items-end gap-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}
                        >
                          {customer.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(customer.priority)}`}
                        >
                          {customer.priority}
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className='space-y-2 mb-4'>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Mail size={14} className='flex-shrink-0' />
                        <span className='truncate'>{customer.email}</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Phone size={14} className='flex-shrink-0' />
                        <span className='truncate'>{customer.phone}</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <MapPin size={14} className='flex-shrink-0' />
                        <span className='truncate'>
                          {customer.address.city}, {customer.address.state}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className='grid grid-cols-2 gap-4 mb-4'>
                      <div className='text-center'>
                        <div className='text-lg font-semibold text-gray-900'>
                          {formatCurrency(customer.totalRevenue)}
                        </div>
                        <div className='text-xs text-gray-500'>
                          Total Revenue
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-semibold text-gray-900'>
                          {customer.deals.length}
                        </div>
                        <div className='text-xs text-gray-500'>
                          Active Deals
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className='flex flex-wrap gap-1 mb-4'>
                      {customer.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
                        >
                          {tag}
                        </span>
                      ))}
                      {customer.tags.length > 3 && (
                        <span className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'>
                          +{customer.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className='flex items-center justify-between pt-4 border-t'>
                      <div className='text-xs text-gray-500'>
                        Last contact: {formatDate(customer.lastContact)}
                      </div>
                      <div className='flex items-center gap-1'>
                        <button className='p-1 text-gray-400 hover:text-constructbms-blue'>
                          <Eye size={14} />
                        </button>
                        <button className='p-1 text-gray-400 hover:text-constructbms-blue'>
                          <Edit2 size={14} />
                        </button>
                        <button className='p-1 text-gray-400 hover:text-red-600'>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customers Table View */}
          {viewMode === 'table' && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden m-6'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                      onClick={() => handleSort('name')}
                    >
                      Customer
                    </th>
                    <th
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                      onClick={() => handleSort('company')}
                    >
                      Company
                    </th>
                    <th
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                      onClick={() => handleSort('totalRevenue')}
                    >
                      Revenue
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Priority
                    </th>
                    <th
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                      onClick={() => handleSort('lastContact')}
                    >
                      Last Contact
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {sortedCustomers.map(customer => (
                    <tr
                      key={customer.id}
                      className='hover:bg-gray-50 cursor-pointer'
                      onClick={() => {
                        setSelectedCustomer(customer.id);
                        setShowCustomerModal(true);
                      }}
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {customer.name}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {customer.email}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {customer.company}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {customer.position}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {formatCurrency(customer.totalRevenue)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(customer.priority)}`}
                        >
                          {customer.priority}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {formatDate(customer.lastContact)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex items-center gap-2'>
                          <button className='text-constructbms-blue hover:text-constructbms-blue/80'>
                            <Eye size={16} />
                          </button>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <Edit2 size={16} />
                          </button>
                          <button className='text-gray-400 hover:text-red-600'>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Customers List View */}
          {viewMode === 'list' && (
            <div className='space-y-4 p-6'>
              {sortedCustomers.map(customer => (
                <div
                  key={customer.id}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer'
                  onClick={() => {
                    setSelectedCustomer(customer.id);
                    setShowCustomerModal(true);
                  }}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-12 h-12 bg-constructbms-blue rounded-full flex items-center justify-center'>
                        <span className='text-black font-semibold text-lg'>
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {customer.name}
                        </h3>
                        <p className='text-gray-600'>{customer.email}</p>
                        <p className='text-sm text-gray-500'>
                          {customer.company} • {customer.position}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <div className='text-lg font-semibold text-gray-900'>
                          {formatCurrency(customer.totalRevenue)}
                        </div>
                        <div className='text-sm text-gray-500'>
                          Total Revenue
                        </div>
                      </div>
                      <div className='flex flex-col items-end space-y-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}
                        >
                          {customer.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(customer.priority)}`}
                        >
                          {customer.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customers Kanban View */}
          {viewMode === 'kanban' && (
            <div className='flex space-x-6 p-6 overflow-x-auto'>
              {['active', 'inactive', 'prospect', 'lead'].map(status => (
                <div key={status} className='flex-shrink-0 w-80'>
                  <div className='bg-gray-100 rounded-lg p-4'>
                    <h3 className='font-semibold text-gray-900 mb-4 capitalize'>
                      {status} (
                      {sortedCustomers.filter(c => c.status === status).length})
                    </h3>
                    <div className='space-y-3'>
                      {sortedCustomers
                        .filter(customer => customer.status === status)
                        .map(customer => (
                          <div
                            key={customer.id}
                            className='bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow'
                            onClick={() => {
                              setSelectedCustomer(customer.id);
                              setShowCustomerModal(true);
                            }}
                          >
                            <div className='flex items-start justify-between mb-2'>
                              <h4 className='font-medium text-gray-900'>
                                {customer.name}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(customer.priority)}`}
                              >
                                {customer.priority}
                              </span>
                            </div>
                            <p className='text-sm text-gray-600 mb-2'>
                              {customer.company}
                            </p>
                            <div className='flex items-center justify-between text-xs text-gray-500'>
                              <span>
                                {formatCurrency(customer.totalRevenue)}
                              </span>
                              <span>{formatDate(customer.lastContact)}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Companies Content */}
      {activeTab === 'companies' && (
        <div className='flex-1 overflow-auto'>
          {/* Companies Grid View */}
          {viewMode === 'grid' && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
              {companies.map(company => (
                <div
                  key={company.id}
                  className='bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer'
                  onClick={() => {
                    setSelectedCompany(company.id);
                    setEditingCompany(company);
                    setShowAddCompany(true);
                  }}
                >
                  <div className='p-6'>
                    {/* Header */}
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-gray-900 text-lg'>
                          {company.name}
                        </h3>
                        <p className='text-gray-600 text-sm'>
                          {company.industry}
                        </p>
                        <p className='text-gray-500 text-sm'>
                          {company.website}
                        </p>
                      </div>
                      <div className='flex flex-col items-end gap-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}
                        >
                          {company.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCompanySizeColor(company.size)}`}
                        >
                          {company.size}
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className='space-y-2 mb-4'>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Mail size={14} />
                        {company.email}
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Phone size={14} />
                        {company.phone}
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <MapPin size={14} />
                        {company.address.city}, {company.address.state}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className='grid grid-cols-2 gap-4 mb-4'>
                      <div className='text-center'>
                        <div className='text-lg font-semibold text-gray-900'>
                          {formatCurrency(company.annualRevenue)}
                        </div>
                        <div className='text-xs text-gray-500'>
                          Annual Revenue
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-semibold text-gray-900'>
                          {company.employeeCount}
                        </div>
                        <div className='text-xs text-gray-500'>Employees</div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className='flex flex-wrap gap-1 mb-4'>
                      {company.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
                        >
                          {tag}
                        </span>
                      ))}
                      {company.tags.length > 3 && (
                        <span className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'>
                          +{company.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className='flex items-center justify-between pt-4 border-t'>
                      <div className='text-xs text-gray-500'>
                        Last contact: {formatDate(company.lastContact)}
                      </div>
                      <div className='flex items-center gap-1'>
                        <button className='p-1 text-gray-400 hover:text-constructbms-blue'>
                          <Eye size={14} />
                        </button>
                        <button className='p-1 text-gray-400 hover:text-constructbms-blue'>
                          <Edit2 size={14} />
                        </button>
                        <button className='p-1 text-gray-400 hover:text-red-600'>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Companies Table View */}
          {viewMode === 'table' && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden m-6'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                      onClick={() => handleSort('name')}
                    >
                      Company
                    </th>
                    <th
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                      onClick={() => handleSort('industry')}
                    >
                      Industry
                    </th>
                    <th
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                      onClick={() => handleSort('annualRevenue')}
                    >
                      Revenue
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Size
                    </th>
                    <th
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                      onClick={() => handleSort('lastContact')}
                    >
                      Last Contact
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {companies.map(company => (
                    <tr
                      key={company.id}
                      className='hover:bg-gray-50 cursor-pointer'
                      onClick={() => {
                        setSelectedCompany(company.id);
                        setShowAddCompany(true);
                      }}
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {company.name}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {company.website}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {company.industry}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {formatCurrency(company.annualRevenue)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}
                        >
                          {company.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCompanySizeColor(company.size)}`}
                        >
                          {company.size}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {formatDate(company.lastContact)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex items-center gap-2'>
                          <button className='text-constructbms-blue hover:text-constructbms-blue/80'>
                            <Eye size={16} />
                          </button>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <Edit2 size={16} />
                          </button>
                          <button className='text-gray-400 hover:text-red-600'>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Companies List View */}
          {viewMode === 'list' && (
            <div className='space-y-4 p-6'>
              {companies.map(company => (
                <div
                  key={company.id}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer'
                  onClick={() => {
                    setSelectedCompany(company.id);
                    setShowAddCompany(true);
                  }}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-12 h-12 bg-constructbms-blue rounded-full flex items-center justify-center'>
                        <span className='text-black font-semibold text-lg'>
                          {company.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {company.name}
                        </h3>
                        <p className='text-gray-600'>{company.website}</p>
                        <p className='text-sm text-gray-500'>
                          {company.industry} • {company.employeeCount} employees
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <div className='text-lg font-semibold text-gray-900'>
                          {formatCurrency(company.annualRevenue)}
                        </div>
                        <div className='text-sm text-gray-500'>
                          Annual Revenue
                        </div>
                      </div>
                      <div className='flex flex-col items-end space-y-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}
                        >
                          {company.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCompanySizeColor(company.size)}`}
                        >
                          {company.size}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Companies Kanban View */}
          {viewMode === 'kanban' && (
            <div className='flex space-x-6 p-6 overflow-x-auto'>
              {['active', 'inactive', 'prospect'].map(status => (
                <div key={status} className='flex-shrink-0 w-80'>
                  <div className='bg-gray-100 rounded-lg p-4'>
                    <h3 className='font-semibold text-gray-900 mb-4 capitalize'>
                      {status} (
                      {companies.filter(c => c.status === status).length})
                    </h3>
                    <div className='space-y-3'>
                      {companies
                        .filter(company => company.status === status)
                        .map(company => (
                          <div
                            key={company.id}
                            className='bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow'
                            onClick={() => {
                              setSelectedCompany(company.id);
                              setShowAddCompany(true);
                            }}
                          >
                            <div className='flex items-start justify-between mb-2'>
                              <h4 className='font-medium text-gray-900'>
                                {company.name}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getCompanySizeColor(company.size)}`}
                              >
                                {company.size}
                              </span>
                            </div>
                            <p className='text-sm text-gray-600 mb-2'>
                              {company.industry}
                            </p>
                            <div className='flex items-center justify-between text-xs text-gray-500'>
                              <span>
                                {formatCurrency(company.annualRevenue)}
                              </span>
                              <span>{formatDate(company.lastContact)}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddCompany && editingCompany && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-gray-900'>
                Company Details
              </h3>
              <button
                onClick={() => {
                  setShowAddCompany(false);
                  setEditingCompany(null);
                }}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={24} />
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Main Info */}
              <div className='lg:col-span-2 space-y-6'>
                {/* Company Information */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <Building size={20} />
                    Company Information
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Company Name
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='text'
                          value={companyFormData.name || editingCompany.name}
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              name: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>{editingCompany.name}</p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Industry
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='text'
                          value={
                            companyFormData.industry || editingCompany.industry
                          }
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              industry: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCompany.industry}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Website
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='url'
                          value={
                            companyFormData.website || editingCompany.website
                          }
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              website: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCompany.website}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Founded
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='text'
                          value={
                            companyFormData.founded || editingCompany.founded
                          }
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              founded: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCompany.founded}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Email
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='email'
                          value={companyFormData.email || editingCompany.email}
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              email: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>{editingCompany.email}</p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Phone
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='tel'
                          value={companyFormData.phone || editingCompany.phone}
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              phone: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>{editingCompany.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <MapPin size={20} />
                    Address
                  </h4>
                  <p className='text-gray-900'>
                    {editingCompany.address.street}
                    <br />
                    {editingCompany.address.city},{' '}
                    {editingCompany.address.state} {editingCompany.address.zip}
                    <br />
                    {editingCompany.address.country}
                  </p>
                </div>

                {/* Description */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <FileText size={20} />
                    Description
                  </h4>
                  {isEditingCompany ? (
                    <textarea
                      value={
                        companyFormData.description ||
                        editingCompany.description
                      }
                      onChange={e =>
                        setCompanyFormData({
                          ...companyFormData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                    />
                  ) : (
                    <p className='text-gray-900'>
                      {editingCompany.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className='space-y-6'>
                {/* Status & Size */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4'>
                    Status & Size
                  </h4>
                  <div className='space-y-3'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Status
                      </label>
                      {isEditingCompany ? (
                        <select
                          value={
                            companyFormData.status || editingCompany.status
                          }
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              status: e.target.value as
                                | 'active'
                                | 'inactive'
                                | 'prospect',
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        >
                          <option value='active'>Active</option>
                          <option value='inactive'>Inactive</option>
                          <option value='prospect'>Prospect</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(editingCompany.status)}`}
                        >
                          {editingCompany.status}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Company Size
                      </label>
                      {isEditingCompany ? (
                        <select
                          value={companyFormData.size || editingCompany.size}
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              size: e.target.value as
                                | 'startup'
                                | 'sme'
                                | 'enterprise',
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        >
                          <option value='startup'>Startup</option>
                          <option value='sme'>SME</option>
                          <option value='enterprise'>Enterprise</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCompanySizeColor(editingCompany.size)}`}
                        >
                          {editingCompany.size}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Assigned To
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='text'
                          value={
                            companyFormData.assignedTo ||
                            editingCompany.assignedTo
                          }
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              assignedTo: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCompany.assignedTo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <PoundSterling size={20} />
                    Financial Information
                  </h4>
                  <div className='space-y-3'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Annual Revenue
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='number'
                          value={
                            companyFormData.annualRevenue ||
                            editingCompany.annualRevenue
                          }
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              annualRevenue: Number(e.target.value),
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-lg font-semibold text-green-600'>
                          {formatCurrency(editingCompany.annualRevenue)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Employee Count
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='number'
                          value={
                            companyFormData.employeeCount ||
                            editingCompany.employeeCount
                          }
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              employeeCount: Number(e.target.value),
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCompany.employeeCount}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Last Contact
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='date'
                          value={
                            companyFormData.lastContact ||
                            editingCompany.lastContact
                          }
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              lastContact: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {formatDate(editingCompany.lastContact)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <Tag size={20} />
                    Tags
                    {isEditingCompany && (
                      <button
                        onClick={() =>
                          handleManageTags(
                            companyFormData.tags || editingCompany.tags,
                            tags =>
                              setCompanyFormData({ ...companyFormData, tags })
                          )
                        }
                        className='ml-auto text-sm text-constructbms-blue hover:text-constructbms-blue/80'
                      >
                        Manage
                      </button>
                    )}
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {(companyFormData.tags || editingCompany.tags).map(tag => (
                      <span
                        key={tag}
                        className='px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Media */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <Users size={20} />
                    Social Media
                  </h4>
                  <div className='space-y-3'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        LinkedIn
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='url'
                          value={
                            companyFormData.socialMedia?.linkedin ||
                            editingCompany.socialMedia?.linkedin ||
                            ''
                          }
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              socialMedia: {
                                ...companyFormData.socialMedia,
                                linkedin: e.target.value,
                              },
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCompany.socialMedia?.linkedin || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Twitter
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='text'
                          value={
                            companyFormData.socialMedia?.twitter ||
                            editingCompany.socialMedia?.twitter ||
                            ''
                          }
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              socialMedia: {
                                ...companyFormData.socialMedia,
                                twitter: e.target.value,
                              },
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCompany.socialMedia?.twitter || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Facebook
                      </label>
                      {isEditingCompany ? (
                        <input
                          type='url'
                          value={
                            companyFormData.socialMedia?.facebook ||
                            editingCompany.socialMedia?.facebook ||
                            ''
                          }
                          onChange={e =>
                            setCompanyFormData({
                              ...companyFormData,
                              socialMedia: {
                                ...companyFormData.socialMedia,
                                facebook: e.target.value,
                              },
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCompany.socialMedia?.facebook || 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className='mt-6'>
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <FileText size={20} />
                  Notes
                </h4>
                {isEditingCompany ? (
                  <textarea
                    value={companyFormData.notes || editingCompany.notes}
                    onChange={e =>
                      setCompanyFormData({
                        ...companyFormData,
                        notes: e.target.value,
                      })
                    }
                    rows={4}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900'>{editingCompany.notes}</p>
                )}
              </div>
            </div>

            <div className='flex space-x-3 pt-6 border-t'>
              {isEditingCompany ? (
                <>
                  <button
                    onClick={handleCancelEditCompany}
                    className='flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCompany}
                    className='flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium'
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowAddCompany(false);
                      setEditingCompany(null);
                    }}
                    className='flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium'
                  >
                    Close
                  </button>
                  <button
                    onClick={handleEditCompany}
                    className='flex-1 bg-constructbms-blue text-black py-2 px-4 rounded-lg hover:bg-constructbms-blue/90 transition-colors font-medium'
                  >
                    Edit Company
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {editingClient && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Edit Client
            </h3>
            <p className='text-gray-600'>
              Client edit form will be implemented here.
            </p>
            <div className='flex space-x-3 pt-4'>
              <button
                onClick={() => setEditingClient(null)}
                className='flex-1 bg-constructbms-blue text-black py-2 px-4 rounded-lg hover:bg-constructbms-green transition-colors font-medium'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomerModal && editingCustomer && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
          onClick={e => {
            if (!isEditingCustomer && e.target === e.currentTarget) {
              setShowCustomerModal(false);
              setEditingCustomer(null);
            }
          }}
        >
          <div
            className='bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto'
            onClick={e => e.stopPropagation()}
          >
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-gray-900'>
                Customer Details
              </h3>
              <div className='flex items-center gap-2'>
                {!isEditingCustomer && (
                  <button
                    onClick={handleEditCustomer}
                    className='flex items-center gap-2 px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-blue/90 transition-colors font-medium'
                  >
                    <Edit2 size={16} />
                    Edit Customer
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setEditingCustomer(null);
                  }}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Main Info */}
              <div className='lg:col-span-2 space-y-6'>
                {/* Contact Information */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <User size={20} />
                    Contact Information
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Name
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='text'
                          value={customerFormData.name || editingCustomer.name}
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              name: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>{editingCustomer.name}</p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Position
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='text'
                          value={
                            customerFormData.position ||
                            editingCustomer.position
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              position: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCustomer.position}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Email
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='email'
                          value={
                            customerFormData.email || editingCustomer.email
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              email: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>{editingCustomer.email}</p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Phone
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='tel'
                          value={
                            customerFormData.phone || editingCustomer.phone
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              phone: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>{editingCustomer.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Company
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='text'
                          value={
                            customerFormData.company || editingCustomer.company
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              company: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCustomer.company}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Industry
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='text'
                          value={
                            customerFormData.industry ||
                            editingCustomer.industry
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              industry: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCustomer.industry}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <MapPin size={20} />
                    Address
                  </h4>
                  <p className='text-gray-900'>
                    {editingCustomer.address.street}
                    <br />
                    {editingCustomer.address.city},{' '}
                    {editingCustomer.address.state}{' '}
                    {editingCustomer.address.zip}
                    <br />
                    {editingCustomer.address.country}
                  </p>
                </div>

                {/* Notes */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <FileText size={20} />
                    Notes
                  </h4>
                  {isEditingCustomer ? (
                    <WYSIWYGEditor
                      content={customerFormData.notes || editingCustomer.notes}
                      onChange={notes =>
                        setCustomerFormData({ ...customerFormData, notes })
                      }
                      placeholder='Add notes about this customer...'
                      className='min-h-[200px]'
                    />
                  ) : (
                    <div
                      className='prose max-w-none text-gray-900'
                      dangerouslySetInnerHTML={{
                        __html: editingCustomer.notes,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className='space-y-6'>
                {/* Status & Priority */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4'>
                    Status & Priority
                  </h4>
                  <div className='space-y-3'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Status
                      </label>
                      {isEditingCustomer ? (
                        <select
                          value={
                            customerFormData.status || editingCustomer.status
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              status: e.target.value as
                                | 'active'
                                | 'inactive'
                                | 'prospect'
                                | 'lead',
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        >
                          <option value='active'>Active</option>
                          <option value='inactive'>Inactive</option>
                          <option value='prospect'>Prospect</option>
                          <option value='lead'>Lead</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(editingCustomer.status)}`}
                        >
                          {editingCustomer.status}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Priority
                      </label>
                      {isEditingCustomer ? (
                        <select
                          value={
                            customerFormData.priority ||
                            editingCustomer.priority
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              priority: e.target.value as
                                | 'low'
                                | 'medium'
                                | 'high',
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        >
                          <option value='low'>Low</option>
                          <option value='medium'>Medium</option>
                          <option value='high'>High</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(editingCustomer.priority)}`}
                        >
                          {editingCustomer.priority}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Assigned To
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='text'
                          value={
                            customerFormData.assignedTo ||
                            editingCustomer.assignedTo
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              assignedTo: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCustomer.assignedTo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <PoundSterling size={20} />
                    Financial Information
                  </h4>
                  <div className='space-y-3'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Total Revenue
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='number'
                          value={
                            customerFormData.totalRevenue ||
                            editingCustomer.totalRevenue
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              totalRevenue: Number(e.target.value),
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-lg font-semibold text-green-600'>
                          {formatCurrency(editingCustomer.totalRevenue)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Last Purchase
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='date'
                          value={
                            customerFormData.lastPurchase ||
                            editingCustomer.lastPurchase
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              lastPurchase: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCustomer.lastPurchase
                            ? formatDate(editingCustomer.lastPurchase)
                            : 'N/A'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Next Follow-up
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='date'
                          value={
                            customerFormData.nextFollowUp ||
                            editingCustomer.nextFollowUp
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              nextFollowUp: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {formatDate(editingCustomer.nextFollowUp)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <Tag size={20} />
                    Tags
                    {isEditingCustomer && (
                      <button
                        onClick={() =>
                          handleManageTags(
                            customerFormData.tags || editingCustomer.tags,
                            tags =>
                              setCustomerFormData({ ...customerFormData, tags })
                          )
                        }
                        className='ml-auto text-sm text-constructbms-blue hover:text-constructbms-blue/80'
                      >
                        Manage
                      </button>
                    )}
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {(customerFormData.tags || editingCustomer.tags).map(
                      tag => (
                        <span
                          key={tag}
                          className='px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full'
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Social Media */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <Users size={20} />
                    Social Media
                  </h4>
                  <div className='space-y-3'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        LinkedIn
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='url'
                          value={
                            customerFormData.socialMedia?.linkedin ||
                            editingCustomer.socialMedia?.linkedin ||
                            ''
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              socialMedia: {
                                ...customerFormData.socialMedia,
                                linkedin: e.target.value,
                              },
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCustomer.socialMedia?.linkedin || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Twitter
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='text'
                          value={
                            customerFormData.socialMedia?.twitter ||
                            editingCustomer.socialMedia?.twitter ||
                            ''
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              socialMedia: {
                                ...customerFormData.socialMedia,
                                twitter: e.target.value,
                              },
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCustomer.socialMedia?.twitter || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Facebook
                      </label>
                      {isEditingCustomer ? (
                        <input
                          type='url'
                          value={
                            customerFormData.socialMedia?.facebook ||
                            editingCustomer.socialMedia?.facebook ||
                            ''
                          }
                          onChange={e =>
                            setCustomerFormData({
                              ...customerFormData,
                              socialMedia: {
                                ...customerFormData.socialMedia,
                                facebook: e.target.value,
                              },
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {editingCustomer.socialMedia?.facebook || 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactions & Deals */}
            <div className='mt-6 space-y-6'>
              {/* Recent Interactions */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <Activity size={20} />
                  Recent Interactions
                </h4>
                <div className='space-y-3'>
                  {editingCustomer.interactions.map(interaction => (
                    <div
                      key={interaction.id}
                      className='flex items-start gap-3 p-3 bg-white rounded-lg'
                    >
                      <div className='p-2 bg-blue-100 rounded-lg'>
                        {getInteractionIcon(interaction.type)}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center justify-between mb-1'>
                          <span className='font-medium text-gray-900 capitalize'>
                            {interaction.type}
                          </span>
                          <span className='text-sm text-gray-500'>
                            {formatDate(interaction.date)}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 mb-1'>
                          {interaction.description}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Outcome: {interaction.outcome}
                        </p>
                        {interaction.nextAction && (
                          <p className='text-sm text-blue-600 mt-1'>
                            Next: {interaction.nextAction}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Activity */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <Mail size={20} />
                  Email Activity
                </h4>
                <div className='space-y-3'>
                  {customerEmails.length === 0 ? (
                    <div className='text-sm text-gray-500 text-center py-4'>
                      No emails found for this customer.
                    </div>
                  ) : (
                    customerEmails.slice(0, 5).map(email => (
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
                              {new Date(email.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className='text-sm text-gray-600 mb-1'>
                            From: {email.sender}
                          </p>
                          <p className='text-sm text-gray-500 line-clamp-2'>
                            {email.content.substring(0, 100)}...
                          </p>
                          <div className='flex items-center gap-2 mt-2'>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(email.priority)}`}
                            >
                              {email.priority}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700`}
                            >
                              {email.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {customerEmails.length > 5 && (
                    <div className='text-center'>
                      <button className='text-sm text-constructbms-blue hover:text-constructbms-blue/80'>
                        View all {customerEmails.length} emails
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Opportunities */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <Target size={20} />
                  Opportunities
                  {isEditingCustomer && (
                    <button
                      onClick={() =>
                        handleAddTask(editingCustomer.id, {
                          title: 'New Opportunity',
                          description: 'Add new opportunity details',
                          status: 'pending',
                          priority: 'medium',
                          dueDate: new Date(
                            Date.now() + 7 * 24 * 60 * 60 * 1000
                          )
                            .toISOString()
                            .split('T')[0],
                          assignedTo: editingCustomer.assignedTo,
                        })
                      }
                      className='ml-auto text-sm text-constructbms-blue hover:text-constructbms-blue/80'
                    >
                      Add New
                    </button>
                  )}
                </h4>
                <div className='space-y-3'>
                  {editingCustomer.opportunities.map(opportunity => (
                    <div
                      key={opportunity.id}
                      className='p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h5
                          className='font-medium text-gray-900 hover:text-constructbms-blue'
                          onClick={() =>
                            handleNavigateToOpportunity(opportunity.id)
                          }
                        >
                          {opportunity.title}
                        </h5>
                        <span className='text-lg font-semibold text-green-600'>
                          {formatCurrency(opportunity.value)}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-sm text-gray-500'>
                        <span>Stage: {opportunity.stage}</span>
                        <span>{opportunity.probability}% probability</span>
                        <span>Close: {formatDate(opportunity.closeDate)}</span>
                      </div>
                      <p className='text-sm text-gray-600 mt-2'>
                        {opportunity.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <Activity size={20} />
                  Tasks
                  {isEditingCustomer && (
                    <button
                      onClick={() =>
                        handleAddTask(editingCustomer.id, {
                          title: 'New Task',
                          description: 'Add new task details',
                          status: 'pending',
                          priority: 'medium',
                          dueDate: new Date(
                            Date.now() + 7 * 24 * 60 * 60 * 1000
                          )
                            .toISOString()
                            .split('T')[0],
                          assignedTo: editingCustomer.assignedTo,
                        })
                      }
                      className='ml-auto text-sm text-constructbms-blue hover:text-constructbms-blue/80'
                    >
                      Add New
                    </button>
                  )}
                </h4>
                <div className='space-y-3'>
                  {editingCustomer.tasks.map(task => (
                    <div
                      key={task.id}
                      className='p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h5
                          className='font-medium text-gray-900 hover:text-constructbms-blue'
                          onClick={() => handleNavigateToTask(task.id)}
                        >
                          {task.title}
                        </h5>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : task.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-700'
                                : task.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
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
                        <span>Due: {formatDate(task.dueDate)}</span>
                        <span>Priority: {task.priority}</span>
                        <span>Assigned: {task.assignedTo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <FileText size={20} />
                  Documents
                </h4>
                <div className='space-y-3'>
                  {editingCustomer.documents.map(document => (
                    <div
                      key={document.id}
                      className='p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h5
                          className='font-medium text-gray-900 hover:text-constructbms-blue'
                          onClick={() => handleNavigateToDocument(document.id)}
                        >
                          {document.name}
                        </h5>
                        <span className='text-sm text-gray-500'>
                          {document.type}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-sm text-gray-500'>
                        <span>Uploaded: {formatDate(document.uploadedAt)}</span>
                        <span>By: {document.uploadedBy}</span>
                        <span>{(document.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='flex space-x-3 pt-6 border-t'>
              {isEditingCustomer ? (
                <>
                  <button
                    onClick={handleCancelEditCustomer}
                    className='flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomer}
                    className='flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium'
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowCustomerModal(false);
                      setEditingCustomer(null);
                    }}
                    className='flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium'
                  >
                    Close
                  </button>
                  <button
                    onClick={handleEditCustomer}
                    className='flex-1 bg-constructbms-blue text-black py-2 px-4 rounded-lg hover:bg-constructbms-blue/90 transition-colors font-medium'
                  >
                    Edit Customer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tag Manager Modal */}
      {showTagManager && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md mx-4'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-gray-900'>
                Manage Tags
              </h3>
              <button
                onClick={() => setShowTagManager(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={24} />
              </button>
            </div>

            <div className='space-y-4'>
              {/* Current Tags */}
              <div>
                <h4 className='font-medium text-gray-900 mb-3'>Current Tags</h4>
                <div className='flex flex-wrap gap-2 mb-4'>
                  {editingTags.map(tag => (
                    <span
                      key={tag}
                      className='px-3 py-1 bg-constructbms-blue text-black text-sm rounded-full flex items-center gap-2'
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className='hover:text-red-600'
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Available Tags */}
              <div>
                <h4 className='font-medium text-gray-900 mb-3'>
                  Available Tags
                </h4>
                <div className='flex flex-wrap gap-2 mb-4'>
                  {availableTags
                    .filter(tag => !editingTags.includes(tag))
                    .map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className='px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full hover:bg-gray-300 transition-colors'
                      >
                        + {tag}
                      </button>
                    ))}
                </div>
              </div>

              {/* Add New Tag */}
              <div>
                <h4 className='font-medium text-gray-900 mb-3'>Add New Tag</h4>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    placeholder='Enter new tag name'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        handleAddNewTag(input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={e => {
                      const input = e.currentTarget
                        .previousElementSibling as HTMLInputElement;
                      handleAddNewTag(input.value);
                      input.value = '';
                    }}
                    className='px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-blue/90 transition-colors'
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className='flex space-x-3 pt-6 border-t'>
              <button
                onClick={() => setShowTagManager(false)}
                className='flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium'
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleSaveTags(tags =>
                    setCustomerFormData({ ...customerFormData, tags })
                  )
                }
                className='flex-1 bg-constructbms-blue text-black py-2 px-4 rounded-lg hover:bg-constructbms-blue/90 transition-colors font-medium'
              >
                Save Tags
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Modal */}
      {showOpportunityModal && selectedOpportunity && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-gray-900'>
                Opportunity Details
              </h3>
              <button
                onClick={() => {
                  setShowOpportunityModal(false);
                  setSelectedOpportunity(null);
                }}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={24} />
              </button>
            </div>

            <div className='space-y-6'>
              {/* Basic Info */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <Target size={20} />
                  Opportunity Information
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Title
                    </label>
                    <p className='text-gray-900 font-medium'>
                      {selectedOpportunity.title}
                    </p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Value
                    </label>
                    <p className='text-lg font-semibold text-green-600'>
                      {formatCurrency(selectedOpportunity.value)}
                    </p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Stage
                    </label>
                    <span className='px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full'>
                      {selectedOpportunity.stage}
                    </span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Probability
                    </label>
                    <p className='text-gray-900'>
                      {selectedOpportunity.probability}%
                    </p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Close Date
                    </label>
                    <p className='text-gray-900'>
                      {formatDate(selectedOpportunity.closeDate)}
                    </p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Assigned To
                    </label>
                    <p className='text-gray-900'>
                      {selectedOpportunity.assignedTo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <FileText size={20} />
                  Description
                </h4>
                <p className='text-gray-900'>
                  {selectedOpportunity.description}
                </p>
              </div>

              {/* Additional Info */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <Settings size={20} />
                  Additional Information
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Source
                    </label>
                    <p className='text-gray-900'>
                      {selectedOpportunity.source}
                    </p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Created
                    </label>
                    <p className='text-gray-900'>
                      {formatDate(selectedOpportunity.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Last Activity
                    </label>
                    <p className='text-gray-900'>
                      {formatDate(selectedOpportunity.lastActivity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex space-x-3 pt-6 border-t'>
              <button
                onClick={() => {
                  setShowOpportunityModal(false);
                  setSelectedOpportunity(null);
                }}
                className='flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium'
              >
                Close
              </button>
              <button className='flex-1 bg-constructbms-blue text-black py-2 px-4 rounded-lg hover:bg-constructbms-blue/90 transition-colors font-medium'>
                Edit Opportunity
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md mx-4'>
            <h3 className='text-xl font-semibold mb-4'>Export Data</h3>
            <div className='mb-4'>
              <label className='block mb-2 font-medium'>Format</label>
              <select
                value={exportFormat}
                onChange={e =>
                  setExportFormat(e.target.value as 'json' | 'csv')
                }
                className='w-full border rounded px-3 py-2'
              >
                <option value='json'>JSON</option>
                <option value='csv'>CSV</option>
              </select>
            </div>
            <div className='flex gap-2 mt-4'>
              <button
                className='flex-1 bg-gray-200 py-2 rounded'
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button
                className='flex-1 bg-constructbms-blue text-black py-2 rounded'
                onClick={handleExport}
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
      {showImportModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md mx-4'>
            <h3 className='text-xl font-semibold mb-4'>Import Data</h3>
            <textarea
              value={importData}
              onChange={e => setImportData(e.target.value)}
              className='w-full border rounded px-3 py-2 mb-4'
              rows={8}
              placeholder='Paste JSON data here or drag a file...'
            />
            <div className='flex gap-2 mt-4'>
              <button
                className='flex-1 bg-gray-200 py-2 rounded'
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
              <button
                className='flex-1 bg-constructbms-blue text-black py-2 rounded'
                onClick={handleImport}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddCustomerModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-white border-b px-6 py-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-semibold text-gray-900'>
                  Add New Customer
                </h3>
                <button
                  onClick={() => setShowAddCustomerModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className='p-6'>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleAddNewCustomer();
                }}
              >
                {/* Basic Information */}
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <User size={20} />
                    Basic Information
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Full Name *
                      </label>
                      <input
                        type='text'
                        required
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='Enter full name'
                        value={newCustomerData.name || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Email Address *
                      </label>
                      <input
                        type='email'
                        required
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='email@example.com'
                        value={newCustomerData.email || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Phone Number
                      </label>
                      <input
                        type='tel'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='+1 (555) 123-4567'
                        value={newCustomerData.phone || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Position/Title
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='e.g., CEO, Manager, Director'
                        value={newCustomerData.position || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            position: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Company
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='Company name'
                        value={newCustomerData.company || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            company: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Website
                      </label>
                      <input
                        type='url'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='https://example.com'
                        value={newCustomerData.website || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            website: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <Building2 size={20} />
                    Business Information
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Industry
                      </label>
                      <select
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCustomerData.industry || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            industry: e.target.value,
                          })
                        }
                      >
                        <option value=''>Select Industry</option>
                        <option value='Technology'>Technology</option>
                        <option value='Healthcare'>Healthcare</option>
                        <option value='Finance'>Finance</option>
                        <option value='Education'>Education</option>
                        <option value='Manufacturing'>Manufacturing</option>
                        <option value='Retail'>Retail</option>
                        <option value='Real Estate'>Real Estate</option>
                        <option value='Consulting'>Consulting</option>
                        <option value='Other'>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Status
                      </label>
                      <select
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCustomerData.status || 'prospect'}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            status: e.target.value as
                              | 'active'
                              | 'inactive'
                              | 'prospect'
                              | 'lead',
                          })
                        }
                      >
                        <option value='prospect'>Prospect</option>
                        <option value='lead'>Lead</option>
                        <option value='active'>Active</option>
                        <option value='inactive'>Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Priority
                      </label>
                      <select
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCustomerData.priority || 'medium'}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            priority: e.target.value as
                              | 'low'
                              | 'medium'
                              | 'high',
                          })
                        }
                      >
                        <option value='low'>Low</option>
                        <option value='medium'>Medium</option>
                        <option value='high'>High</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Source
                      </label>
                      <select
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCustomerData.source || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            source: e.target.value,
                          })
                        }
                      >
                        <option value=''>Select Source</option>
                        <option value='Website'>Website</option>
                        <option value='Referral'>Referral</option>
                        <option value='Cold Call'>Cold Call</option>
                        <option value='Trade Show'>Trade Show</option>
                        <option value='Social Media'>Social Media</option>
                        <option value='Advertisement'>Advertisement</option>
                        <option value='Other'>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Assigned To
                      </label>
                      <select
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCustomerData.assignedTo || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            assignedTo: e.target.value,
                          })
                        }
                      >
                        <option value=''>Select Assignee</option>
                        <option value='Sarah Johnson'>Sarah Johnson</option>
                        <option value='Mike Chen'>Mike Chen</option>
                        <option value='David Rodriguez'>David Rodriguez</option>
                        <option value='Lisa Wang'>Lisa Wang</option>
                        <option value='Alex Thompson'>Alex Thompson</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Next Follow-up
                      </label>
                      <input
                        type='date'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCustomerData.nextFollowUp || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            nextFollowUp: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <MapPin size={20} />
                    Address Information
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='md:col-span-2'>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Street Address
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='123 Main Street'
                        value={newCustomerData.address?.street || ''}
                        onChange={e =>
                          updateCustomerAddress('street', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        City
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='City'
                        value={newCustomerData.address?.city || ''}
                        onChange={e =>
                          updateCustomerAddress('city', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        State/Province
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='State'
                        value={newCustomerData.address?.state || ''}
                        onChange={e =>
                          updateCustomerAddress('state', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        ZIP/Postal Code
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='ZIP Code'
                        value={newCustomerData.address?.zip || ''}
                        onChange={e =>
                          updateCustomerAddress('zip', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Country
                      </label>
                      <select
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCustomerData.address?.country || ''}
                        onChange={e =>
                          updateCustomerAddress('country', e.target.value)
                        }
                      >
                        <option value=''>Select Country</option>
                        <option value='United States'>United States</option>
                        <option value='United Kingdom'>United Kingdom</option>
                        <option value='Canada'>Canada</option>
                        <option value='Australia'>Australia</option>
                        <option value='Germany'>Germany</option>
                        <option value='France'>France</option>
                        <option value='Other'>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <Share2 size={20} />
                    Social Media
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        LinkedIn
                      </label>
                      <input
                        type='url'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='https://linkedin.com/in/username'
                        value={newCustomerData.socialMedia?.linkedin || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            socialMedia: {
                              ...newCustomerData.socialMedia,
                              linkedin: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Twitter
                      </label>
                      <input
                        type='url'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='https://twitter.com/username'
                        value={newCustomerData.socialMedia?.twitter || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            socialMedia: {
                              ...newCustomerData.socialMedia,
                              twitter: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Facebook
                      </label>
                      <input
                        type='url'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='https://facebook.com/username'
                        value={newCustomerData.socialMedia?.facebook || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            socialMedia: {
                              ...newCustomerData.socialMedia,
                              facebook: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <FileText size={20} />
                    Additional Information
                  </h4>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Tags
                      </label>
                      <div className='flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[44px]'>
                        {newCustomerData.tags?.map(tag => (
                          <span
                            key={tag}
                            className='px-2 py-1 bg-constructbms-blue text-black text-sm rounded-full flex items-center gap-1'
                          >
                            {tag}
                            <button
                              type='button'
                              onClick={() =>
                                setNewCustomerData({
                                  ...newCustomerData,
                                  tags:
                                    newCustomerData.tags?.filter(
                                      t => t !== tag
                                    ) || [],
                                })
                              }
                              className='hover:text-red-600'
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                        <input
                          type='text'
                          placeholder='Add tag...'
                          className='flex-1 min-w-[100px] border-none outline-none text-sm'
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                setNewCustomerData({
                                  ...newCustomerData,
                                  tags: [
                                    ...(newCustomerData.tags || []),
                                    input.value.trim(),
                                  ],
                                });
                                input.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Notes
                      </label>
                      <textarea
                        rows={4}
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='Add any additional notes about this customer...'
                        value={newCustomerData.notes || ''}
                        onChange={e =>
                          setNewCustomerData({
                            ...newCustomerData,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className='flex gap-3 pt-6 border-t'>
                  <button
                    type='button'
                    onClick={() => setShowAddCustomerModal(false)}
                    className='flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='flex-1 bg-constructbms-blue text-black py-3 px-4 rounded-lg hover:bg-constructbms-blue/90 transition-colors font-medium'
                  >
                    Add Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAddCompany && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-white border-b px-6 py-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-semibold text-gray-900'>
                  Add New Company
                </h3>
                <button
                  onClick={() => setShowAddCompany(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className='p-6'>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleAddNewCompany();
                }}
              >
                {/* Basic Company Information */}
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <Building2 size={20} />
                    Company Information
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Company Name *
                      </label>
                      <input
                        type='text'
                        required
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='Enter company name'
                        value={newCompanyData.name || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Industry *
                      </label>
                      <select
                        required
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCompanyData.industry || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            industry: e.target.value,
                          })
                        }
                      >
                        <option value=''>Select Industry</option>
                        <option value='Technology'>Technology</option>
                        <option value='Healthcare'>Healthcare</option>
                        <option value='Finance'>Finance</option>
                        <option value='Education'>Education</option>
                        <option value='Manufacturing'>Manufacturing</option>
                        <option value='Retail'>Retail</option>
                        <option value='Real Estate'>Real Estate</option>
                        <option value='Consulting'>Consulting</option>
                        <option value='Other'>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Company Size
                      </label>
                      <select
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCompanyData.size || 'sme'}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            size: e.target.value as
                              | 'startup'
                              | 'sme'
                              | 'enterprise',
                          })
                        }
                      >
                        <option value='startup'>Startup (1-10)</option>
                        <option value='sme'>SME (11-250)</option>
                        <option value='enterprise'>Enterprise (250+)</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Website
                      </label>
                      <input
                        type='url'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='https://example.com'
                        value={newCompanyData.website || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            website: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Phone Number
                      </label>
                      <input
                        type='tel'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='+1 (555) 123-4567'
                        value={newCompanyData.phone || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Email
                      </label>
                      <input
                        type='email'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='contact@company.com'
                        value={newCompanyData.email || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <BarChart3 size={20} />
                    Business Details
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Annual Revenue
                      </label>
                      <input
                        type='number'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='1000000'
                        value={newCompanyData.annualRevenue || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            annualRevenue: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Employee Count
                      </label>
                      <input
                        type='number'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='50'
                        value={newCompanyData.employeeCount || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            employeeCount: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Founded Year
                      </label>
                      <input
                        type='number'
                        min='1800'
                        max={new Date().getFullYear()}
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='2020'
                        value={newCompanyData.founded || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            founded: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Status
                      </label>
                      <select
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCompanyData.status || 'prospect'}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            status: e.target.value as
                              | 'active'
                              | 'inactive'
                              | 'prospect',
                          })
                        }
                      >
                        <option value='prospect'>Prospect</option>
                        <option value='active'>Active</option>
                        <option value='inactive'>Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Assigned To
                      </label>
                      <select
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCompanyData.assignedTo || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            assignedTo: e.target.value,
                          })
                        }
                      >
                        <option value=''>Select Assignee</option>
                        <option value='Sarah Johnson'>Sarah Johnson</option>
                        <option value='Mike Chen'>Mike Chen</option>
                        <option value='David Rodriguez'>David Rodriguez</option>
                        <option value='Lisa Wang'>Lisa Wang</option>
                        <option value='Alex Thompson'>Alex Thompson</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Last Contact
                      </label>
                      <input
                        type='date'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCompanyData.lastContact || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            lastContact: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <MapPin size={20} />
                    Address Information
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='md:col-span-2'>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Street Address
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='123 Business Street'
                        value={newCompanyData.address?.street || ''}
                        onChange={e =>
                          updateCompanyAddress('street', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        City
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='City'
                        value={newCompanyData.address?.city || ''}
                        onChange={e =>
                          updateCompanyAddress('city', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        State/Province
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='State'
                        value={newCompanyData.address?.state || ''}
                        onChange={e =>
                          updateCompanyAddress('state', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        ZIP/Postal Code
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='ZIP Code'
                        value={newCompanyData.address?.zip || ''}
                        onChange={e =>
                          updateCompanyAddress('zip', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Country
                      </label>
                      <select
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        value={newCompanyData.address?.country || ''}
                        onChange={e =>
                          updateCompanyAddress('country', e.target.value)
                        }
                      >
                        <option value=''>Select Country</option>
                        <option value='United States'>United States</option>
                        <option value='United Kingdom'>United Kingdom</option>
                        <option value='Canada'>Canada</option>
                        <option value='Australia'>Australia</option>
                        <option value='Germany'>Germany</option>
                        <option value='France'>France</option>
                        <option value='Other'>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <Share2 size={20} />
                    Social Media
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        LinkedIn
                      </label>
                      <input
                        type='url'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='https://linkedin.com/company/company-name'
                        value={newCompanyData.socialMedia?.linkedin || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            socialMedia: {
                              ...newCompanyData.socialMedia,
                              linkedin: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Twitter
                      </label>
                      <input
                        type='url'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='https://twitter.com/company'
                        value={newCompanyData.socialMedia?.twitter || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            socialMedia: {
                              ...newCompanyData.socialMedia,
                              twitter: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Facebook
                      </label>
                      <input
                        type='url'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='https://facebook.com/company'
                        value={newCompanyData.socialMedia?.facebook || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            socialMedia: {
                              ...newCompanyData.socialMedia,
                              facebook: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <FileText size={20} />
                    Additional Information
                  </h4>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Company Description
                      </label>
                      <textarea
                        rows={4}
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='Brief description of the company, their business model, and key offerings...'
                        value={newCompanyData.description || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Tags
                      </label>
                      <div className='flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[44px]'>
                        {newCompanyData.tags?.map(tag => (
                          <span
                            key={tag}
                            className='px-2 py-1 bg-constructbms-blue text-black text-sm rounded-full flex items-center gap-1'
                          >
                            {tag}
                            <button
                              type='button'
                              onClick={() =>
                                setNewCompanyData({
                                  ...newCompanyData,
                                  tags:
                                    newCompanyData.tags?.filter(
                                      t => t !== tag
                                    ) || [],
                                })
                              }
                              className='hover:text-red-600'
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                        <input
                          type='text'
                          placeholder='Add tag...'
                          className='flex-1 min-w-[100px] border-none outline-none text-sm'
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                setNewCompanyData({
                                  ...newCompanyData,
                                  tags: [
                                    ...(newCompanyData.tags || []),
                                    input.value.trim(),
                                  ],
                                });
                                input.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Notes
                      </label>
                      <textarea
                        rows={4}
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='Add any additional notes about this company...'
                        value={newCompanyData.notes || ''}
                        onChange={e =>
                          setNewCompanyData({
                            ...newCompanyData,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className='flex gap-3 pt-6 border-t'>
                  <button
                    type='button'
                    onClick={() => setShowAddCompany(false)}
                    className='flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='flex-1 bg-constructbms-blue text-black py-3 px-4 rounded-lg hover:bg-constructbms-blue/90 transition-colors font-medium'
                  >
                    Add Company
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-white border-b px-6 py-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-semibold text-gray-900'>
                  {activeTab === 'customers'
                    ? 'Customer Management Settings'
                    : 'Company Management Settings'}
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className='p-6'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* General Settings */}
                <div className='space-y-6'>
                  <div className='bg-gray-50 rounded-lg p-6'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                      <Settings size={20} />
                      General Settings
                    </h4>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Default View Mode
                        </label>
                        <select className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'>
                          <option value='grid'>Grid View</option>
                          <option value='list'>List View</option>
                          <option value='table'>Table View</option>
                          <option value='kanban'>Kanban View</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Items Per Page
                        </label>
                        <select className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'>
                          <option value='10'>10 items</option>
                          <option value='25'>25 items</option>
                          <option value='50'>50 items</option>
                          <option value='100'>100 items</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Default Sort Field
                        </label>
                        <select className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'>
                          <option value='name'>Name</option>
                          <option value='createdAt'>Date Created</option>
                          <option value='lastContact'>Last Contact</option>
                          {activeTab === 'customers' && (
                            <option value='totalRevenue'>Total Revenue</option>
                          )}
                          {activeTab === 'companies' && (
                            <option value='annualRevenue'>
                              Annual Revenue
                            </option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className='bg-gray-50 rounded-lg p-6'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                      <Bell size={20} />
                      Notification Settings
                    </h4>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-700'>
                            Follow-up Reminders
                          </p>
                          <p className='text-xs text-gray-500'>
                            Get notified about upcoming follow-ups
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            className='sr-only peer'
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-constructbms-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-constructbms-blue"></div>
                        </label>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-700'>
                            New Contact Alerts
                          </p>
                          <p className='text-xs text-gray-500'>
                            Notify when new contacts are added
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            className='sr-only peer'
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-constructbms-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-constructbms-blue"></div>
                        </label>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-700'>
                            Activity Updates
                          </p>
                          <p className='text-xs text-gray-500'>
                            Get updates on contact activities
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input type='checkbox' className='sr-only peer' />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-constructbms-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-constructbms-blue"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className='space-y-6'>
                  {/* Field Customization */}
                  <div className='bg-gray-50 rounded-lg p-6'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                      <Edit3 size={20} />
                      Field Customization
                    </h4>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Required Fields
                        </label>
                        <div className='space-y-2'>
                          {['name', 'email', 'phone'].map(field => (
                            <label key={field} className='flex items-center'>
                              <input
                                type='checkbox'
                                className='rounded border-gray-300 text-constructbms-blue focus:ring-constructbms-blue'
                                defaultChecked={['name', 'email'].includes(
                                  field
                                )}
                              />
                              <span className='ml-2 text-sm text-gray-700 capitalize'>
                                {field}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Custom Fields
                        </label>
                        <button className='w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-constructbms-blue hover:text-constructbms-blue transition-colors'>
                          + Add Custom Field
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Integration Settings */}
                  <div className='bg-gray-50 rounded-lg p-6'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                      <Link size={20} />
                      Integrations
                    </h4>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between p-3 bg-white rounded-lg border'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                            <Mail size={16} className='text-blue-600' />
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>
                              Email Integration
                            </p>
                            <p className='text-xs text-gray-500'>
                              Connect with email providers
                            </p>
                          </div>
                        </div>
                        <button className='text-sm text-constructbms-blue hover:text-constructbms-blue/80 font-medium'>
                          Configure
                        </button>
                      </div>
                      <div className='flex items-center justify-between p-3 bg-white rounded-lg border'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                            <Calendar size={16} className='text-green-600' />
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>
                              Calendar Sync
                            </p>
                            <p className='text-xs text-gray-500'>
                              Sync with calendar applications
                            </p>
                          </div>
                        </div>
                        <button className='text-sm text-constructbms-blue hover:text-constructbms-blue/80 font-medium'>
                          Configure
                        </button>
                      </div>
                      <div className='flex items-center justify-between p-3 bg-white rounded-lg border'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>
                            <Database size={16} className='text-purple-600' />
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>
                              CRM Integration
                            </p>
                            <p className='text-xs text-gray-500'>
                              Connect with external CRM systems
                            </p>
                          </div>
                        </div>
                        <button className='text-sm text-constructbms-blue hover:text-constructbms-blue/80 font-medium'>
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Security & Permissions */}
                  <div className='bg-gray-50 rounded-lg p-6'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                      <Shield size={20} />
                      Security & Permissions
                    </h4>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Access Control
                        </label>
                        <select className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'>
                          <option value='all'>All Users</option>
                          <option value='assigned'>Assigned Users Only</option>
                          <option value='managers'>Managers Only</option>
                          <option value='custom'>Custom Permissions</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Data Export Permissions
                        </label>
                        <select className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'>
                          <option value='all'>All Users</option>
                          <option value='managers'>Managers Only</option>
                          <option value='admins'>Administrators Only</option>
                        </select>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-700'>
                            Audit Logging
                          </p>
                          <p className='text-xs text-gray-500'>
                            Track all changes and access
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            className='sr-only peer'
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-constructbms-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-constructbms-blue"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3 pt-6 border-t mt-8'>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className='flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium'
                >
                  Cancel
                </button>
                <button className='flex-1 bg-constructbms-blue text-black py-3 px-4 rounded-lg hover:bg-constructbms-blue/90 transition-colors font-medium'>
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
