import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  CurrencyPoundIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CogIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface ProcurementProps {
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
}

interface ProcurementPackage {
  actualCost: number;
  assignedTo?: string;
  budget: number;
  category: 'materials' | 'mep' | 'subcontractor' | 'specialist' | 'plant' | 'professional' | 'logistics';
  createdAt: Date;
  deliveryDate?: Date;
  description: string;
  documents: string[];
  id: string;
  isDemoData?: boolean;
  leadTime: number;
  name: string;
  notes: string;
  orderDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  projectName: string;
  status: 'planning' | 'tender' | 'evaluation' | 'negotiation' | 'ordered' | 'submittal' | 'expediting' | 'delivery' | 'quality' | 'completed';
  supplierId?: string;
  supplierName?: string;
  updatedAt: Date;
}

interface Supplier {
  address: string;
  contactPerson: string;
  email: string;
  id: string;
  isDemoData?: boolean;
  leadTime: number;
  name: string;
  notes: string;
  paymentTerms: string;
  phone: string;
  preQualified: boolean;
  rating: number;
  type: 'materials' | 'subcontractor' | 'specialist' | 'logistics';
}

interface TenderEnquiry {
  commercialTerms: string;
  documents: string[];
  enquiryDate: Date;
  id: string;
  isDemoData?: boolean;
  leadTime?: number;
  notes: string;
  packageId: string;
  packageName: string;
  quoteAmount?: number;
  responseDate?: Date;
  status: 'sent' | 'received' | 'evaluated' | 'selected' | 'rejected';
  supplierId: string;
  supplierName: string;
  technicalCompliance: 'compliant' | 'non-compliant' | 'partial';
}

const Procurement: React.FC<ProcurementProps> = ({ onNavigateToModule }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'packages' | 'suppliers' | 'tenders' | 'reports'>('packages');
  const [packages, setPackages] = useState<ProcurementPackage[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [tenders, setTenders] = useState<TenderEnquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ProcurementPackage | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load demo data for now - replace with actual API calls
      const demoPackages: ProcurementPackage[] = [
        {
          id: '1',
          name: 'Partition Systems',
          category: 'materials',
          description: 'Metal stud walls, glazed partitions, acoustic panels',
          projectId: 'proj-1',
          projectName: 'London Office Fit-out',
          status: 'ordered',
          budget: 45000,
          actualCost: 42000,
          leadTime: 6,
          supplierId: 'supp-1',
          supplierName: 'Partition Solutions Ltd',
          orderDate: new Date('2024-01-15'),
          deliveryDate: new Date('2024-02-15'),
          priority: 'high',
          assignedTo: 'John Smith',
          notes: 'All samples approved, ready for production',
          documents: ['spec-001.pdf', 'order-001.pdf'],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          isDemoData: true,
        },
        {
          id: '2',
          name: 'HVAC Systems',
          category: 'mep',
          description: 'Ductwork, fan coil units, chillers',
          projectId: 'proj-1',
          projectName: 'London Office Fit-out',
          status: 'evaluation',
          budget: 85000,
          actualCost: 0,
          leadTime: 8,
          priority: 'critical',
          assignedTo: 'Sarah Johnson',
          notes: 'Three quotes received, technical evaluation in progress',
          documents: ['tender-001.pdf', 'spec-002.pdf'],
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-20'),
          isDemoData: true,
        },
        {
          id: '3',
          name: 'Joinery Package',
          category: 'subcontractor',
          description: 'Custom joinery and built-in furniture',
          projectId: 'proj-1',
          projectName: 'London Office Fit-out',
          status: 'tender',
          budget: 65000,
          actualCost: 0,
          leadTime: 10,
          priority: 'high',
          assignedTo: 'Mike Wilson',
          notes: 'Tender enquiries sent to 5 pre-qualified joinery contractors',
          documents: ['tender-002.pdf'],
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18'),
          isDemoData: true,
        },
      ];

      const demoSuppliers: Supplier[] = [
        {
          id: 'supp-1',
          name: 'Partition Solutions Ltd',
          type: 'materials',
          contactPerson: 'David Brown',
          email: 'david@partitionsolutions.co.uk',
          phone: '+44 20 7123 4567',
          address: 'Unit 5, Industrial Estate, London SW1 1AA',
          preQualified: true,
          rating: 4.5,
          leadTime: 6,
          paymentTerms: '30 days',
          notes: 'Reliable supplier, good quality products',
          isDemoData: true,
        },
        {
          id: 'supp-2',
          name: 'MEP Systems Ltd',
          type: 'subcontractor',
          contactPerson: 'Lisa Thompson',
          email: 'lisa@mepsystems.co.uk',
          phone: '+44 20 7123 4568',
          address: 'Building 3, Business Park, London E1 1BB',
          preQualified: true,
          rating: 4.2,
          leadTime: 8,
          paymentTerms: '45 days',
          notes: 'Specialist MEP contractor, competitive pricing',
          isDemoData: true,
        },
      ];

      const demoTenders: TenderEnquiry[] = [
        {
          id: 'tender-1',
          packageId: '2',
          packageName: 'HVAC Systems',
          supplierId: 'supp-2',
          supplierName: 'MEP Systems Ltd',
          enquiryDate: new Date('2024-01-15'),
          responseDate: new Date('2024-01-20'),
          status: 'received',
          quoteAmount: 82000,
          leadTime: 8,
          technicalCompliance: 'compliant',
          commercialTerms: '45 days payment, 2-year warranty',
          notes: 'Competitive quote, good technical compliance',
          documents: ['quote-001.pdf', 'technical-spec.pdf'],
          isDemoData: true,
        },
      ];

      setPackages(demoPackages);
      setSuppliers(demoSuppliers);
      setTenders(demoTenders);
    } catch (error) {
      console.error('Error loading procurement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800';
      case 'tender': return 'bg-blue-100 text-blue-800';
      case 'evaluation': return 'bg-yellow-100 text-yellow-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'ordered': return 'bg-green-100 text-green-800';
      case 'submittal': return 'bg-purple-100 text-purple-800';
      case 'expediting': return 'bg-indigo-100 text-indigo-800';
      case 'delivery': return 'bg-teal-100 text-teal-800';
      case 'quality': return 'bg-pink-100 text-pink-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-600';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'materials': return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'mep': return <CogIcon className="h-5 w-5" />;
      case 'subcontractor': return <UserGroupIcon className="h-5 w-5" />;
      case 'specialist': return <DocumentTextIcon className="h-5 w-5" />;
      case 'plant': return <TruckIcon className="h-5 w-5" />;
      case 'professional': return <DocumentDuplicateIcon className="h-5 w-5" />;
      case 'logistics': return <TruckIcon className="h-5 w-5" />;
      default: return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesStatus = filterStatus === 'all' || pkg.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || pkg.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || pkg.priority === filterPriority;
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  const handleViewDocuments = (documents: string[]) => {
    // Navigate to Document Hub with filtered view
    if (onNavigateToModule) {
      onNavigateToModule('DocumentHub', { filter: 'procurement', documents });
    }
  };

  const handleViewProject = (projectId: string) => {
    // Navigate to Projects module
    if (onNavigateToModule) {
      onNavigateToModule('Projects', { projectId });
    }
  };

  const handleViewSupplier = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setSelectedSupplier(supplier);
      setShowSupplierModal(true);
    }
  };

  const handleViewTenders = (packageId: string) => {
    const packageTenders = tenders.filter(t => t.packageId === packageId);
    // Navigate to tenders tab with filtered view
    setActiveTab('tenders');
    // Could also open a modal with tender details
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Procurement</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage materials, subcontractors, and supply chain
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPackageModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Package
              </button>
              <button
                onClick={() => setShowSupplierModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Supplier
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'packages', name: 'Packages', icon: ClipboardDocumentListIcon },
              { id: 'suppliers', name: 'Suppliers', icon: BuildingOfficeIcon },
              { id: 'tenders', name: 'Tenders', icon: DocumentTextIcon },
              { id: 'reports', name: 'Reports', icon: ChartBarIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'packages' && (
          <div className="p-6">
            {/* Filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="tender">Tender</option>
                  <option value="evaluation">Evaluation</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="ordered">Ordered</option>
                  <option value="submittal">Submittal</option>
                  <option value="expediting">Expediting</option>
                  <option value="delivery">Delivery</option>
                  <option value="quality">Quality Check</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="materials">Materials</option>
                  <option value="mep">MEP</option>
                  <option value="subcontractor">Subcontractor</option>
                  <option value="specialist">Specialist</option>
                  <option value="plant">Plant & Tools</option>
                  <option value="professional">Professional Services</option>
                  <option value="logistics">Logistics</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Packages Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-gray-600">Loading packages...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(pkg.category)}
                          <span className="text-sm font-medium text-gray-500 capitalize">
                            {pkg.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(pkg.priority)}`}>
                            {pkg.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pkg.status)}`}>
                            {pkg.status}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {pkg.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {pkg.description}
                      </p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Project:</span>
                          <button
                            onClick={() => handleViewProject(pkg.projectId)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {pkg.projectName}
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Budget:</span>
                          <span className="font-medium">£{pkg.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Lead Time:</span>
                          <span className="font-medium">{pkg.leadTime} weeks</span>
                        </div>
                        {pkg.supplierName && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Supplier:</span>
                            <button
                              onClick={() => handleViewSupplier(pkg.supplierId!)}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {pkg.supplierName}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          {pkg.documents.length > 0 && (
                            <button
                              onClick={() => handleViewDocuments(pkg.documents)}
                              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                            >
                              <DocumentTextIcon className="h-4 w-4 mr-1" />
                              {pkg.documents.length} docs
                            </button>
                          )}
                          {tenders.filter(t => t.packageId === pkg.id).length > 0 && (
                            <button
                              onClick={() => handleViewTenders(pkg.id)}
                              className="inline-flex items-center text-sm text-green-600 hover:text-green-700"
                            >
                              <DocumentTextIcon className="h-4 w-4 mr-1" />
                              {tenders.filter(t => t.packageId === pkg.id).length} tenders
                            </button>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPackage(pkg);
                              setShowPackageModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPackage(pkg);
                              setShowPackageModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Suppliers & Subcontractors</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lead Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {supplier.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {supplier.address}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {supplier.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {supplier.contactPerson}
                          </div>
                          <div className="text-sm text-gray-500">
                            {supplier.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {supplier.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                              {supplier.rating}
                            </span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= supplier.rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {supplier.leadTime} weeks
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setShowSupplierModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setShowSupplierModal(true);
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tenders' && (
          <div className="p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tender Enquiries</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Package
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quote
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lead Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Compliance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {tenders.map((tender) => (
                      <tr key={tender.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {tender.packageName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {tender.supplierName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tender.status === 'selected' ? 'bg-green-100 text-green-800' :
                            tender.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            tender.status === 'evaluated' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {tender.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {tender.quoteAmount ? `£${tender.quoteAmount.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {tender.leadTime ? `${tender.leadTime} weeks` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tender.technicalCompliance === 'compliant' ? 'bg-green-100 text-green-800' :
                            tender.technicalCompliance === 'non-compliant' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tender.technicalCompliance}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              // Open tender details modal
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Packages</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{packages.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {packages.filter(p => p.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {packages.filter(p => p.status !== 'completed' && p.status !== 'planning').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CurrencyPoundIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Budget</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      £{packages.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
                <div className="space-y-3">
                  {['planning', 'tender', 'evaluation', 'negotiation', 'ordered', 'submittal', 'expediting', 'delivery', 'quality', 'completed'].map((status) => {
                    const count = packages.filter(p => p.status === status).length;
                    const percentage = packages.length > 0 ? (count / packages.length) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{status}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getStatusColor(status).replace('text-', 'bg-').replace('bg-gray-100', 'bg-gray-300')}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                  {['materials', 'mep', 'subcontractor', 'specialist', 'plant', 'professional', 'logistics'].map((category) => {
                    const count = packages.filter(p => p.category === category).length;
                    const totalBudget = packages.filter(p => p.category === category).reduce((sum, p) => sum + p.budget, 0);
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{category}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{count} packages</div>
                          <div className="text-sm text-gray-500">£{totalBudget.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Package Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedPackage ? 'Edit Package' : 'New Package'}
              </h2>
              <button
                onClick={() => {
                  setShowPackageModal(false);
                  setSelectedPackage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400">
                Package details form would go here with all the procurement fields.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedSupplier ? 'Edit Supplier' : 'New Supplier'}
              </h2>
              <button
                onClick={() => {
                  setShowSupplierModal(false);
                  setSelectedSupplier(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400">
                Supplier details form would go here with contact information and qualifications.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Procurement;
