import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  BarChart3,
  Lock,
  Unlock,
  History,
  Tag,
  Send,
  Archive,
  Star,
  Copy,
  Share2,
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: string;
  version: string;
  status:
    | 'Draft'
    | 'Pending Review'
    | 'Under Review'
    | 'Approved'
    | 'Rejected'
    | 'Archived';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  assignedTo: string[];
  reviewers: string[];
  tags: string[];
  description: string;
  fileSize: string;
  isConfidential: boolean;
  expiryDate?: string;
  approvalHistory: ApprovalStep[];
}

interface ApprovalStep {
  id: string;
  reviewer: string;
  action: 'Approved' | 'Rejected' | 'Requested Changes';
  date: string;
  comments: string;
}

const DocumentControlCentre: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'DOC-001',
      title: 'Project Alpha Construction Plan',
      type: 'Construction Plan',
      version: '2.1',
      status: 'Under Review',
      priority: 'High',
      createdBy: 'John Smith',
      createdAt: '2024-07-01',
      lastModified: '2024-07-03',
      assignedTo: ['Sarah Johnson', 'Mike Wilson'],
      reviewers: ['David Brown', 'Lisa Chen'],
      tags: ['Construction', 'Planning', 'Safety'],
      description: 'Updated construction plan with new safety protocols',
      fileSize: '2.4 MB',
      isConfidential: false,
      approvalHistory: [
        {
          id: '1',
          reviewer: 'David Brown',
          action: 'Requested Changes',
          date: '2024-07-02',
          comments: 'Please update section 3.2 with additional safety measures',
        },
      ],
    },
    {
      id: 'DOC-002',
      title: 'Safety Protocol Manual',
      type: 'Safety Document',
      version: '1.0',
      status: 'Approved',
      priority: 'Critical',
      createdBy: 'Sarah Johnson',
      createdAt: '2024-06-28',
      lastModified: '2024-07-01',
      assignedTo: ['All Staff'],
      reviewers: ['Safety Committee'],
      tags: ['Safety', 'Protocol', 'Training'],
      description:
        'Comprehensive safety protocol manual for all construction sites',
      fileSize: '1.8 MB',
      isConfidential: false,
      approvalHistory: [
        {
          id: '2',
          reviewer: 'Safety Committee',
          action: 'Approved',
          date: '2024-07-01',
          comments: 'All safety requirements met and approved',
        },
      ],
    },
    {
      id: 'DOC-003',
      title: 'Budget Approval Request',
      type: 'Financial Document',
      version: '3.0',
      status: 'Pending Review',
      priority: 'High',
      createdBy: 'Mike Wilson',
      createdAt: '2024-07-04',
      lastModified: '2024-07-04',
      assignedTo: ['Finance Team'],
      reviewers: ['CFO', 'Project Director'],
      tags: ['Budget', 'Finance', 'Approval'],
      description: 'Budget approval request for additional equipment purchase',
      fileSize: '0.9 MB',
      isConfidential: true,
      approvalHistory: [],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const documentTypes = [
    'Construction Plan',
    'Safety Document',
    'Financial Document',
    'Contract',
    'Specification',
    'Report',
  ];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesPriority =
      filterPriority === 'all' || doc.priority === filterPriority;
    const matchesType = filterType === 'all' || doc.type === filterType;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Under Review':
        return 'bg-blue-100 text-blue-700';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-700';
      case 'Draft':
        return 'bg-gray-100 text-gray-700';
      case 'Archived':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-700';
      case 'High':
        return 'bg-orange-100 text-orange-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleApproveDocument = (docId: string) => {
    setDocuments(
      documents.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            status: 'Approved' as const,
            approvalHistory: [
              ...doc.approvalHistory,
              {
                id: Date.now().toString(),
                reviewer: 'Current User',
                action: 'Approved',
                date: new Date().toISOString().split('T')[0],
                comments: 'Document approved',
              },
            ],
          };
        }
        return doc;
      })
    );
  };

  const handleRejectDocument = (docId: string) => {
    setDocuments(
      documents.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            status: 'Rejected' as const,
            approvalHistory: [
              ...doc.approvalHistory,
              {
                id: Date.now().toString(),
                reviewer: 'Current User',
                action: 'Rejected',
                date: new Date().toISOString().split('T')[0],
                comments: 'Document rejected',
              },
            ],
          };
        }
        return doc;
      })
    );
  };

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'Pending Review').length,
    underReview: documents.filter(d => d.status === 'Under Review').length,
    approved: documents.filter(d => d.status === 'Approved').length,
    rejected: documents.filter(d => d.status === 'Rejected').length,
    critical: documents.filter(d => d.priority === 'Critical').length,
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Document Control Centre
          </h1>
          <p className='text-gray-600'>
            Manage document workflows, approvals, and version control
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className='flex items-center px-4 py-2 bg-archer-neon text-black rounded-lg font-medium hover:bg-archer-black hover:text-white transition-colors'
        >
          <Plus className='h-4 w-4 mr-2' />
          Upload Document
        </button>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-2 md:grid-cols-6 gap-4'>
        <div className='bg-white rounded-xl border p-4 text-center'>
          <div className='text-2xl font-bold text-blue-600'>{stats.total}</div>
          <div className='text-xs text-gray-500'>Total Documents</div>
        </div>
        <div className='bg-white rounded-xl border p-4 text-center'>
          <div className='text-2xl font-bold text-yellow-600'>
            {stats.pending}
          </div>
          <div className='text-xs text-gray-500'>Pending Review</div>
        </div>
        <div className='bg-white rounded-xl border p-4 text-center'>
          <div className='text-2xl font-bold text-blue-600'>
            {stats.underReview}
          </div>
          <div className='text-xs text-gray-500'>Under Review</div>
        </div>
        <div className='bg-white rounded-xl border p-4 text-center'>
          <div className='text-2xl font-bold text-green-600'>
            {stats.approved}
          </div>
          <div className='text-xs text-gray-500'>Approved</div>
        </div>
        <div className='bg-white rounded-xl border p-4 text-center'>
          <div className='text-2xl font-bold text-red-600'>
            {stats.rejected}
          </div>
          <div className='text-xs text-gray-500'>Rejected</div>
        </div>
        <div className='bg-white rounded-xl border p-4 text-center'>
          <div className='text-2xl font-bold text-red-600'>
            {stats.critical}
          </div>
          <div className='text-xs text-gray-500'>Critical Priority</div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-xl border p-6'>
        <div className='flex flex-wrap gap-4'>
          <div className='flex-1 min-w-64'>
            <input
              type='text'
              placeholder='Search documents...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
          >
            <option value='all'>All Status</option>
            <option value='Draft'>Draft</option>
            <option value='Pending Review'>Pending Review</option>
            <option value='Under Review'>Under Review</option>
            <option value='Approved'>Approved</option>
            <option value='Rejected'>Rejected</option>
            <option value='Archived'>Archived</option>
          </select>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
          >
            <option value='all'>All Priorities</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
          >
            <option value='all'>All Types</option>
            {documentTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className='bg-white rounded-xl border p-6'>
        <h2 className='text-lg font-semibold mb-4'>Documents</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                <th className='px-4 py-3 text-left font-medium'>Document</th>
                <th className='px-4 py-3 text-left font-medium'>Type</th>
                <th className='px-4 py-3 text-left font-medium'>Version</th>
                <th className='px-4 py-3 text-left font-medium'>Status</th>
                <th className='px-4 py-3 text-left font-medium'>Priority</th>
                <th className='px-4 py-3 text-left font-medium'>Created By</th>
                <th className='px-4 py-3 text-left font-medium'>
                  Last Modified
                </th>
                <th className='px-4 py-3 text-left font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map(doc => (
                <tr key={doc.id} className='border-b hover:bg-gray-50'>
                  <td className='px-4 py-3'>
                    <div>
                      <div className='font-medium flex items-center gap-2'>
                        {doc.title}
                        {doc.isConfidential && (
                          <Lock className='h-4 w-4 text-red-500' />
                        )}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {doc.description}
                      </div>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {doc.tags.map(tag => (
                          <span
                            key={tag}
                            className='px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <span className='px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs'>
                      {doc.type}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-gray-600'>{doc.version}</td>
                  <td className='px-4 py-3'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(doc.priority)}`}
                    >
                      {doc.priority}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-gray-600'>{doc.createdBy}</td>
                  <td className='px-4 py-3 text-gray-600'>
                    {doc.lastModified}
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => {
                          setSelectedDocument(doc);
                          setShowDocumentModal(true);
                        }}
                        className='p-1 text-blue-600 hover:bg-blue-100 rounded'
                        title='View'
                      >
                        <Eye className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => alert(`Downloading ${doc.title}`)}
                        className='p-1 text-green-600 hover:bg-green-100 rounded'
                        title='Download'
                      >
                        <Download className='h-4 w-4' />
                      </button>
                      {(doc.status === 'Pending Review' ||
                        doc.status === 'Under Review') && (
                        <>
                          <button
                            onClick={() => handleApproveDocument(doc.id)}
                            className='p-1 text-green-600 hover:bg-green-100 rounded'
                            title='Approve'
                          >
                            <CheckCircle className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => handleRejectDocument(doc.id)}
                            className='p-1 text-red-600 hover:bg-red-100 rounded'
                            title='Reject'
                          >
                            <XCircle className='h-4 w-4' />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Modal */}
      {showDocumentModal && selectedDocument && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
          <div className='bg-white rounded-xl p-6 w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>
                {selectedDocument.title}
              </h3>
              <button
                onClick={() => setShowDocumentModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <XCircle className='h-6 w-6' />
              </button>
            </div>

            <div className='grid grid-cols-2 gap-6 mb-6'>
              <div>
                <h4 className='font-medium mb-2'>Document Details</h4>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='font-medium'>Type:</span>{' '}
                    {selectedDocument.type}
                  </div>
                  <div>
                    <span className='font-medium'>Version:</span>{' '}
                    {selectedDocument.version}
                  </div>
                  <div>
                    <span className='font-medium'>Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDocument.status)}`}
                    >
                      {selectedDocument.status}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium'>Priority:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedDocument.priority)}`}
                    >
                      {selectedDocument.priority}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium'>File Size:</span>{' '}
                    {selectedDocument.fileSize}
                  </div>
                  <div>
                    <span className='font-medium'>Confidential:</span>{' '}
                    {selectedDocument.isConfidential ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className='font-medium mb-2'>People</h4>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='font-medium'>Created By:</span>{' '}
                    {selectedDocument.createdBy}
                  </div>
                  <div>
                    <span className='font-medium'>Assigned To:</span>{' '}
                    {selectedDocument.assignedTo.join(', ')}
                  </div>
                  <div>
                    <span className='font-medium'>Reviewers:</span>{' '}
                    {selectedDocument.reviewers.join(', ')}
                  </div>
                </div>
              </div>
            </div>

            <div className='mb-6'>
              <h4 className='font-medium mb-2'>Description</h4>
              <p className='text-sm text-gray-600'>
                {selectedDocument.description}
              </p>
            </div>

            <div className='mb-6'>
              <h4 className='font-medium mb-2'>Tags</h4>
              <div className='flex flex-wrap gap-2'>
                {selectedDocument.tags.map(tag => (
                  <span
                    key={tag}
                    className='px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs'
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className='mb-6'>
              <h4 className='font-medium mb-2'>Approval History</h4>
              <div className='space-y-2'>
                {selectedDocument.approvalHistory.map(step => (
                  <div
                    key={step.id}
                    className='flex items-center gap-3 p-3 bg-gray-50 rounded'
                  >
                    <div
                      className={`p-1 rounded ${
                        step.action === 'Approved'
                          ? 'bg-green-100 text-green-600'
                          : step.action === 'Rejected'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {step.action === 'Approved' ? (
                        <CheckCircle className='h-4 w-4' />
                      ) : step.action === 'Rejected' ? (
                        <XCircle className='h-4 w-4' />
                      ) : (
                        <AlertTriangle className='h-4 w-4' />
                      )}
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium'>{step.reviewer}</div>
                      <div className='text-sm text-gray-500'>
                        {step.comments}
                      </div>
                    </div>
                    <div className='text-sm text-gray-500'>{step.date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex gap-2'>
              <button className='px-4 py-2 rounded-lg bg-archer-neon text-black font-semibold'>
                <Download className='h-4 w-4 mr-2 inline' />
                Download
              </button>
              <button className='px-4 py-2 rounded-lg bg-gray-100'>
                <Edit className='h-4 w-4 mr-2 inline' />
                Edit
              </button>
              <button className='px-4 py-2 rounded-lg bg-gray-100'>
                <History className='h-4 w-4 mr-2 inline' />
                Version History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md shadow-xl'>
            <h3 className='text-lg font-semibold mb-4'>Upload Document</h3>
            <div className='space-y-4'>
              <input
                type='text'
                placeholder='Document Title'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
              />
              <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'>
                <option value=''>Select Document Type</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'>
                <option value=''>Select Priority</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <textarea
                placeholder='Description'
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
              />
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center'>
                <Upload className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                <p className='text-sm text-gray-500'>
                  Click to upload or drag and drop
                </p>
                <p className='text-xs text-gray-400'>
                  PDF, DOC, DWG, JPG up to 10MB
                </p>
              </div>
            </div>
            <div className='flex gap-2 justify-end mt-6'>
              <button
                onClick={() => setShowUploadModal(false)}
                className='px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200'
              >
                Cancel
              </button>
              <button className='px-4 py-2 rounded-lg bg-archer-neon text-black font-semibold hover:bg-archer-black hover:text-white'>
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentControlCentre;
