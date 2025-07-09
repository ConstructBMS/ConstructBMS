import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit2,
  Search,
  Target,
  TrendingUp,
  Star,
  Zap,
  Shield,
} from 'lucide-react';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status:
    | 'completed'
    | 'in-progress'
    | 'planned'
    | 'testing'
    | 'idea'
    | 'Complete'
    | 'In Progress'
    | 'Debugging'
    | 'Idea';
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  assignedTo?: string;
  estimatedCompletion?: string;
  actualCompletion?: string;
  tags?: string[];
  dependencies?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ChangeLogEntry {
  id: string;
  version: string;
  date: string;
  type: 'feature' | 'bugfix' | 'improvement' | 'breaking' | 'security';
  title: string;
  description: string;
  author: string;
  affectedComponents: string[];
  breakingChanges?: string[];
}

const initialItems = [
  {
    id: '1',
    title: 'Dynamic Sidebar/Menu System',
    status: 'Complete',
    description:
      'Context-driven, supports parent/child, expand/collapse, filtering by module/permissions.',
  },
  {
    id: '2',
    title: 'Heroicons for Menu Icons',
    status: 'Complete',
    description:
      'Modern icons, active highlighting, visible in collapsed/expanded states.',
  },
  {
    id: '3',
    title: 'Collapsible Sidebar',
    status: 'Complete',
    description:
      'Hamburger/chevron toggle, flush with content, no ghost space.',
  },
  {
    id: '4',
    title: 'Only One Parent Expanded',
    status: 'Complete',
    description: 'Auto-collapse other parents when one is expanded.',
  },
  {
    id: '5',
    title: 'Sidebar Auto-Expands on Icon Click',
    status: 'Complete',
    description:
      'Clicking any icon when collapsed expands the sidebar and triggers the action.',
  },
  {
    id: '6',
    title: 'Core/Additional Modules Sections',
    status: 'Complete',
    description: 'Section headers and divider, dynamic filtering.',
  },
  {
    id: '7',
    title: 'MenuBuilder and ModulesPage',
    status: 'Complete',
    description: 'Live menu/module editing, real-time updates.',
  },
  {
    id: '8',
    title: 'Improved Loading Spinner',
    status: 'Complete',
    description: 'Larger, bolder, more visible spinner.',
  },
  {
    id: '9',
    title: 'Bugfix: Heroicons Import',
    status: 'Complete',
    description: 'Fixed ClipboardListIcon import to ClipboardDocumentListIcon.',
  },
  {
    id: '10',
    title: 'Bugfix: Sidebar Margin/Flex Layout',
    status: 'Complete',
    description: 'No leftover space, main content always fills area.',
  },
  {
    id: '11',
    title: 'Bugfix: Sidebar Collapse/Expand Logic',
    status: 'Complete',
    description: 'Sidebar and content animate together, no ghost sidebar.',
  },
  {
    id: '12',
    title: 'Bugfix: Sidebar Icons Missing',
    status: 'Complete',
    description: 'All menu icons now display correctly.',
  },
  {
    id: '13',
    title: 'Bugfix: Sidebar Menu Auto-Collapse',
    status: 'Complete',
    description: 'Only one parent menu can be expanded at a time.',
  },
  {
    id: '14',
    title: 'Profile Loading Sequence',
    status: 'Idea',
    description: 'Analyze and optimize app loading sequence for speed.',
  },
  {
    id: '15',
    title: 'Optimize Data Fetching',
    status: 'Idea',
    description:
      'Defer non-critical data fetching, load dashboard widgets after main UI.',
  },
  {
    id: '16',
    title: 'Bundle Size/Code Splitting',
    status: 'Idea',
    description:
      'Implement code splitting and bundle optimization for faster loads.',
  },
];

const statuses = ['Idea', 'In Progress', 'Debugging', 'Complete'] as const;
type StatusType = (typeof statuses)[number];

type ViewType = 'kanban' | 'grid' | 'list';

const Roadmap: React.FC = () => {
  const [items, setItems] = useState<RoadmapItem[]>(initialItems);
  const [view, setView] = useState<ViewType>('kanban');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Drag and drop handlers for Kanban
  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDrop = (status: StatusType) => {
    if (draggedId !== null) {
      setItems(items =>
        items.map(item => (item.id === draggedId ? { ...item, status } : item))
      );
      setDraggedId(null);
    }
  };

  // View switcher
  const renderViewSwitcher = () => (
    <div className='flex space-x-2 mb-6'>
      <button
        onClick={() => setView('kanban')}
        className={`px-4 py-2 rounded ${view === 'kanban' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
      >
        Kanban
      </button>
      <button
        onClick={() => setView('grid')}
        className={`px-4 py-2 rounded ${view === 'grid' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
      >
        Grid
      </button>
      <button
        onClick={() => setView('list')}
        className={`px-4 py-2 rounded ${view === 'list' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
      >
        List
      </button>
    </div>
  );

  // Kanban board
  const renderKanban = () => (
    <div className='flex gap-6 overflow-x-auto'>
      {statuses.map(status => (
        <div
          key={status}
          className='flex-1 min-w-[260px] bg-gray-50 rounded-lg shadow-sm p-3'
        >
          <div className='font-bold text-gray-700 mb-3 text-center'>
            {status}
          </div>
          <div
            className='min-h-[80px] flex flex-col gap-3'
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(status)}
          >
            {items
              .filter(item => item.status === status)
              .map(item => (
                <div
                  key={item.id}
                  className='bg-white rounded shadow p-3 cursor-move border border-gray-200 hover:border-green-400 transition'
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                >
                  <div className='font-semibold text-gray-900 mb-1'>
                    {item.title}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {item.description}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Grid view
  const renderGrid = () => (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
      {items.map(item => (
        <div
          key={item.id}
          className='bg-white rounded-lg shadow p-4 border border-gray-200'
        >
          <div className='text-xs font-bold text-gray-500 mb-1'>
            {item.status}
          </div>
          <div className='font-semibold text-gray-900 mb-1'>{item.title}</div>
          <div className='text-xs text-gray-500'>{item.description}</div>
        </div>
      ))}
    </div>
  );

  // List view
  const renderList = () => (
    <div className='divide-y divide-gray-200 bg-white rounded-lg shadow'>
      {statuses.map(status => (
        <div key={status}>
          <div className='px-4 py-2 bg-gray-50 font-bold text-gray-700'>
            {status}
          </div>
          {items
            .filter(item => item.status === status)
            .map(item => (
              <div key={item.id} className='px-4 py-3'>
                <div className='font-semibold text-gray-900 mb-1'>
                  {item.title}
                </div>
                <div className='text-xs text-gray-500'>{item.description}</div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6'>Roadmap</h1>
      {renderViewSwitcher()}
      {view === 'kanban' && renderKanban()}
      {view === 'grid' && renderGrid()}
      {view === 'list' && renderList()}
    </div>
  );
};

export default Roadmap;
