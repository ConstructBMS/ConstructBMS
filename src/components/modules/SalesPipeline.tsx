import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  BarChart3,
  Target,
  TrendingUp,
  PoundSterling,
  PieChart,
  LineChart,
} from 'lucide-react';

interface Deal {
  id: number;
  title: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  owner: string;
  closeDate: string;
  notes: string;
}

const SalesPipeline: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([
    {
      id: 1,
      title: 'Office Building Project',
      company: 'TechCorp Solutions',
      value: 125000,
      stage: 'Proposal',
      probability: 75,
      owner: 'John Smith',
      closeDate: '2024-08-15',
      notes: 'Large office complex renovation',
    },
    {
      id: 2,
      title: 'Residential Development',
      company: 'GrowthStart Inc',
      value: 75000,
      stage: 'Negotiation',
      probability: 60,
      owner: 'Sarah Johnson',
      closeDate: '2024-07-30',
      notes: '50-unit residential project',
    },
    {
      id: 3,
      title: 'Warehouse Construction',
      company: 'LogisticsPro',
      value: 200000,
      stage: 'Qualification',
      probability: 40,
      owner: 'Mike Wilson',
      closeDate: '2024-09-20',
      notes: 'Industrial warehouse facility',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');

  const stages = [
    'Qualification',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost',
  ];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'all' || deal.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const totalDeals = deals.length;
  const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Sales Pipeline</h1>
          <p className='text-gray-600'>
            Manage your sales opportunities and deals
          </p>
        </div>
        <button className='flex items-center px-4 py-2 bg-archer-neon text-black rounded-lg font-medium hover:bg-archer-black hover:text-white transition-colors'>
          <Plus className='h-4 w-4 mr-2' />
          Add Deal
        </button>
      </div>

      {/* Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white rounded-xl border p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-2xl font-bold text-blue-600'>
                £{totalValue.toLocaleString()}
              </div>
              <div className='text-sm text-gray-500'>Total Value</div>
            </div>
            <PoundSterling className='h-8 w-8 text-blue-500' />
          </div>
        </div>
        <div className='bg-white rounded-xl border p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-2xl font-bold text-green-600'>
                {totalDeals}
              </div>
              <div className='text-sm text-gray-500'>Total Deals</div>
            </div>
            <Target className='h-8 w-8 text-green-500' />
          </div>
        </div>
        <div className='bg-white rounded-xl border p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-2xl font-bold text-purple-600'>
                £{avgDealSize.toLocaleString()}
              </div>
              <div className='text-sm text-gray-500'>Avg Deal Size</div>
            </div>
            <BarChart3 className='h-8 w-8 text-purple-500' />
          </div>
        </div>
        <div className='bg-white rounded-xl border p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-2xl font-bold text-orange-600'>
                {stages.length}
              </div>
              <div className='text-sm text-gray-500'>Pipeline Stages</div>
            </div>
            <TrendingUp className='h-8 w-8 text-orange-500' />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-xl border p-6'>
        <div className='flex flex-wrap gap-4'>
          <div className='flex-1 min-w-64'>
            <input
              type='text'
              placeholder='Search deals...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
            />
          </div>
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
          >
            <option value='all'>All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deals Table */}
      <div className='bg-white rounded-xl border p-6'>
        <h2 className='text-lg font-semibold mb-4'>Deals</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                <th className='px-4 py-3 text-left font-medium'>Deal</th>
                <th className='px-4 py-3 text-left font-medium'>Company</th>
                <th className='px-4 py-3 text-left font-medium'>Value</th>
                <th className='px-4 py-3 text-left font-medium'>Stage</th>
                <th className='px-4 py-3 text-left font-medium'>Probability</th>
                <th className='px-4 py-3 text-left font-medium'>Owner</th>
                <th className='px-4 py-3 text-left font-medium'>Close Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map(deal => (
                <tr key={deal.id} className='border-b hover:bg-gray-50'>
                  <td className='px-4 py-3 font-medium'>{deal.title}</td>
                  <td className='px-4 py-3'>{deal.company}</td>
                  <td className='px-4 py-3'>£{deal.value.toLocaleString()}</td>
                  <td className='px-4 py-3'>
                    <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs'>
                      {deal.stage}
                    </span>
                  </td>
                  <td className='px-4 py-3'>{deal.probability}%</td>
                  <td className='px-4 py-3'>{deal.owner}</td>
                  <td className='px-4 py-3'>{deal.closeDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className='bg-white rounded-xl border p-6'>
        <h2 className='text-lg font-semibold mb-4'>Pipeline Stages</h2>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          {stages.map(stage => {
            const stageDeals = deals.filter(deal => deal.stage === stage);
            const stageValue = stageDeals.reduce(
              (sum, deal) => sum + deal.value,
              0
            );

            return (
              <div key={stage} className='border rounded-lg p-4'>
                <h3 className='font-semibold mb-2'>{stage}</h3>
                <div className='text-2xl font-bold text-archer-neon'>
                  {stageDeals.length}
                </div>
                <div className='text-sm text-gray-500'>
                  £{stageValue.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SalesPipeline;
