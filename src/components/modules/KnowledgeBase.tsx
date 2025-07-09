import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const demoArticles = [
  {
    id: 1,
    title: 'How to create a project',
    category: 'Projects',
    status: 'published',
    updated: '2024-01-20',
  },
  {
    id: 2,
    title: 'Managing tasks',
    category: 'Tasks',
    status: 'draft',
    updated: '2024-01-18',
  },
  {
    id: 3,
    title: 'User roles explained',
    category: 'Users',
    status: 'published',
    updated: '2024-01-15',
  },
];

const KnowledgeBase: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('knowledgeBaseStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem(
      'knowledgeBaseStatsExpanded',
      JSON.stringify(newState)
    );
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Knowledge Base</h1>
        <p className='text-gray-600'>Browse help articles and documentation</p>
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
          Knowledge Base Metrics
        </button>

        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <BookOpen className='h-8 w-8 text-archer-neon mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Articles</p>
                <p className='text-2xl font-bold'>{demoArticles.length}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Published</p>
                <p className='text-2xl font-bold'>
                  {demoArticles.filter(a => a.status === 'published').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <BookOpen className='h-8 w-8 text-blue-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Drafts</p>
                <p className='text-2xl font-bold'>
                  {demoArticles.filter(a => a.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='bg-white rounded-xl border p-6 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Articles</h2>
          <button className='flex items-center px-4 py-2 bg-archer-neon text-black rounded-lg text-sm font-medium hover:bg-archer-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Article
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Title
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Category
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {demoArticles.map(article => (
              <tr key={article.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{article.title}</td>
                <td className='px-4 py-2'>{article.category}</td>
                <td className='px-4 py-2 capitalize'>{article.status}</td>
                <td className='px-4 py-2'>{article.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KnowledgeBase;
