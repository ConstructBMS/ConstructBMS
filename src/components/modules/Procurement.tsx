import React, { useState } from 'react';
import {
  BarChart3,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  XCircle,
  Clipboard,
} from 'lucide-react';

// Mock Data
const procurementStats = {
  totalSpend: 125000,
  openPOs: 8,
  approvedPOs: 22,
  pendingReqs: 5,
  vendors: 12,
};

const purchaseOrders = [
  {
    id: 'PO-1001',
    project: 'Project Alpha',
    vendor: 'Acme Supplies',
    amount: 15000,
    status: 'Approved',
    date: '2024-07-01',
  },
  {
    id: 'PO-1002',
    project: 'Project Beta',
    vendor: 'BuildCo',
    amount: 22000,
    status: 'Pending',
    date: '2024-07-03',
  },
  {
    id: 'PO-1003',
    project: 'Project Alpha',
    vendor: 'SteelWorks',
    amount: 18000,
    status: 'Approved',
    date: '2024-07-04',
  },
  {
    id: 'PO-1004',
    project: 'Project Gamma',
    vendor: 'ConcretePro',
    amount: 9000,
    status: 'Rejected',
    date: '2024-07-05',
  },
];

const vendors = [
  {
    id: 1,
    name: 'Acme Supplies',
    contact: 'John Smith',
    email: 'john@acme.com',
    phone: '555-1234',
    rating: 4.7,
  },
  {
    id: 2,
    name: 'BuildCo',
    contact: 'Sarah Lee',
    email: 'sarah@buildco.com',
    phone: '555-5678',
    rating: 4.5,
  },
  {
    id: 3,
    name: 'SteelWorks',
    contact: 'Mike Brown',
    email: 'mike@steelworks.com',
    phone: '555-8765',
    rating: 4.6,
  },
];

const requisitions = [
  {
    id: 'REQ-2001',
    project: 'Project Alpha',
    requester: 'Alice',
    item: 'Concrete',
    amount: 5000,
    status: 'Pending',
    date: '2024-07-02',
  },
  {
    id: 'REQ-2002',
    project: 'Project Beta',
    requester: 'Bob',
    item: 'Steel Beams',
    amount: 12000,
    status: 'Approved',
    date: '2024-07-03',
  },
  {
    id: 'REQ-2003',
    project: 'Project Gamma',
    requester: 'Charlie',
    item: 'Lumber',
    amount: 3000,
    status: 'Rejected',
    date: '2024-07-04',
  },
];

const analytics = {
  spendByProject: [
    { project: 'Project Alpha', spend: 65000 },
    { project: 'Project Beta', spend: 40000 },
    { project: 'Project Gamma', spend: 20000 },
  ],
  spendByCategory: [
    { category: 'Materials', spend: 80000 },
    { category: 'Equipment', spend: 30000 },
    { category: 'Services', spend: 15000 },
  ],
};

const Procurement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filtered POs
  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch =
      po.id.toLowerCase().includes(search.toLowerCase()) ||
      po.project.toLowerCase().includes(search.toLowerCase()) ||
      po.vendor.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className='space-y-8'>
      {/* Overview */}
      <div className='bg-white rounded-xl border p-6 grid grid-cols-2 md:grid-cols-5 gap-4'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-archer-neon'>
            ${procurementStats.totalSpend.toLocaleString()}
          </div>
          <div className='text-xs text-gray-500'>Total Spend</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-blue-500'>
            {procurementStats.openPOs}
          </div>
          <div className='text-xs text-gray-500'>Open POs</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-green-600'>
            {procurementStats.approvedPOs}
          </div>
          <div className='text-xs text-gray-500'>Approved POs</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-yellow-500'>
            {procurementStats.pendingReqs}
          </div>
          <div className='text-xs text-gray-500'>Pending Reqs</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-purple-500'>
            {procurementStats.vendors}
          </div>
          <div className='text-xs text-gray-500'>Vendors</div>
        </div>
      </div>

      {/* Recent Purchase Orders */}
      <div className='bg-white rounded-xl border p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold flex items-center gap-2'>
            <FileText className='h-5 w-5 text-archer-neon' /> Recent Purchase
            Orders
          </h2>
          <div className='flex gap-2'>
            <input
              type='text'
              placeholder='Search POs...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='px-3 py-2 border rounded-lg text-sm'
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className='px-3 py-2 border rounded-lg text-sm'
            >
              <option value='all'>All Status</option>
              <option value='Approved'>Approved</option>
              <option value='Pending'>Pending</option>
              <option value='Rejected'>Rejected</option>
            </select>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                <th className='px-4 py-3 text-left font-medium'>PO #</th>
                <th className='px-4 py-3 text-left font-medium'>Project</th>
                <th className='px-4 py-3 text-left font-medium'>Vendor</th>
                <th className='px-4 py-3 text-left font-medium'>Amount</th>
                <th className='px-4 py-3 text-left font-medium'>Status</th>
                <th className='px-4 py-3 text-left font-medium'>Date</th>
                <th className='px-4 py-3 text-left font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.map(po => (
                <tr key={po.id} className='border-b hover:bg-gray-50'>
                  <td className='px-4 py-3 font-medium'>{po.id}</td>
                  <td className='px-4 py-3'>{po.project}</td>
                  <td className='px-4 py-3'>{po.vendor}</td>
                  <td className='px-4 py-3'>${po.amount.toLocaleString()}</td>
                  <td className='px-4 py-3'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        po.status === 'Approved'
                          ? 'bg-green-100 text-green-700'
                          : po.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className='px-4 py-3'>{po.date}</td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-2'>
                      <button
                        className='p-1 text-blue-600 hover:bg-blue-100 rounded'
                        title='Download'
                      >
                        <Download className='h-4 w-4' />
                      </button>
                      <button
                        className='p-1 text-green-600 hover:bg-green-100 rounded'
                        title='Edit'
                      >
                        <Edit className='h-4 w-4' />
                      </button>
                      <button
                        className='p-1 text-red-600 hover:bg-red-100 rounded'
                        title='Reject'
                      >
                        <XCircle className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Management */}
      <div className='bg-white rounded-xl border p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold flex items-center gap-2'>
            <Users className='h-5 w-5 text-archer-neon' /> Vendors
          </h2>
          <button className='flex items-center px-4 py-2 bg-archer-neon text-black rounded-lg font-medium hover:bg-archer-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> Add Vendor
          </button>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {vendors.map(vendor => (
            <div
              key={vendor.id}
              className='border rounded-lg p-4 flex flex-col gap-2'
            >
              <div className='flex items-center gap-2'>
                <Users className='h-5 w-5 text-blue-500' />
                <span className='font-semibold'>{vendor.name}</span>
                <span className='ml-auto text-yellow-500 font-medium'>
                  {vendor.rating}★
                </span>
              </div>
              <div className='text-sm text-gray-500'>
                Contact: {vendor.contact}
              </div>
              <div className='text-sm text-gray-500'>Email: {vendor.email}</div>
              <div className='text-sm text-gray-500'>Phone: {vendor.phone}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Requisitions & Approvals */}
      <div className='bg-white rounded-xl border p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold flex items-center gap-2'>
            <Clipboard className='h-5 w-5 text-archer-neon' /> Requisitions &
            Approvals
          </h2>
          <button className='flex items-center px-4 py-2 bg-archer-neon text-black rounded-lg font-medium hover:bg-archer-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Requisition
          </button>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                <th className='px-4 py-3 text-left font-medium'>Req #</th>
                <th className='px-4 py-3 text-left font-medium'>Project</th>
                <th className='px-4 py-3 text-left font-medium'>Requester</th>
                <th className='px-4 py-3 text-left font-medium'>Item</th>
                <th className='px-4 py-3 text-left font-medium'>Amount</th>
                <th className='px-4 py-3 text-left font-medium'>Status</th>
                <th className='px-4 py-3 text-left font-medium'>Date</th>
                <th className='px-4 py-3 text-left font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.map(req => (
                <tr key={req.id} className='border-b hover:bg-gray-50'>
                  <td className='px-4 py-3 font-medium'>{req.id}</td>
                  <td className='px-4 py-3'>{req.project}</td>
                  <td className='px-4 py-3'>{req.requester}</td>
                  <td className='px-4 py-3'>{req.item}</td>
                  <td className='px-4 py-3'>${req.amount.toLocaleString()}</td>
                  <td className='px-4 py-3'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        req.status === 'Approved'
                          ? 'bg-green-100 text-green-700'
                          : req.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className='px-4 py-3'>{req.date}</td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-2'>
                      <button
                        className='p-1 text-green-600 hover:bg-green-100 rounded'
                        title='Approve'
                      >
                        <CheckCircle className='h-4 w-4' />
                      </button>
                      <button
                        className='p-1 text-red-600 hover:bg-red-100 rounded'
                        title='Reject'
                      >
                        <XCircle className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Procurement Analytics */}
      <div className='bg-white rounded-xl border p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <BarChart3 className='h-5 w-5 text-archer-neon' />
          <h2 className='text-lg font-semibold'>Procurement Analytics</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h3 className='font-medium mb-2'>Spend by Project</h3>
            <ul className='space-y-2'>
              {analytics.spendByProject.map(item => (
                <li
                  key={item.project}
                  className='flex items-center justify-between'
                >
                  <span>{item.project}</span>
                  <span className='font-semibold'>
                    ${item.spend.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className='font-medium mb-2'>Spend by Category</h3>
            <ul className='space-y-2'>
              {analytics.spendByCategory.map(item => (
                <li
                  key={item.category}
                  className='flex items-center justify-between'
                >
                  <span>{item.category}</span>
                  <span className='font-semibold'>
                    ${item.spend.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Procurement;
