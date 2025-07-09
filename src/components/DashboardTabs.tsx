import React, { useState, useRef, useEffect } from 'react';
import {
  PencilIcon,
  XMarkIcon,
  PlusIcon,
  Cog6ToothIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';

interface DashboardTab {
  id: string;
  label: string;
  icon: string;
  moduleKey: string;
}

interface DashboardTabsProps {
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onTabEdit: (tabId: string, newLabel: string) => void;
  onTabDelete: (tabId: string) => void;
  onTabAdd: () => void;
  showPageBuilderControls?: boolean;
  onAddWidgets?: () => void;
  onOpenSettings?: () => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onTabEdit,
  onTabDelete,
  onTabAdd,
  showPageBuilderControls = false,
  onAddWidgets,
  onOpenSettings,
}) => {
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTab && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTab]);

  const handleEditStart = (tab: DashboardTab) => {
    setEditingTab(tab.id);
    setEditValue(tab.label);
  };

  const handleEditSave = () => {
    if (editingTab && editValue.trim()) {
      onTabEdit(editingTab, editValue.trim());
    }
    setEditingTab(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingTab(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <div className='relative mb-6'>
      {/* Tabs Section - Centered */}
      <div className='flex justify-center'>
        <div className='flex items-center bg-gray-100 rounded-full p-1 shadow-sm'>
          {tabs.map(tab => (
            <div key={tab.id} className='relative group'>
              <div
                className={`flex items-center px-4 py-2 rounded-full cursor-pointer transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                {editingTab === tab.id ? (
                  <input
                    ref={editInputRef}
                    type='text'
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleEditSave}
                    className='bg-transparent border-none outline-none text-sm font-medium min-w-0'
                    style={{ width: `${Math.max(editValue.length * 8, 60)}px` }}
                  />
                ) : (
                  <span className='text-sm font-medium whitespace-nowrap'>
                    {tab.label}
                  </span>
                )}
              </div>

              {/* Edit/Delete buttons - only show on hover */}
              <div className='absolute -top-5 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                <div className='flex bg-white rounded-full shadow-lg border border-gray-200'>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleEditStart(tab);
                    }}
                    className='p-1 hover:bg-gray-50 rounded-l-full transition-colors'
                    title='Edit tab name'
                  >
                    <PencilIcon className='h-3 w-3 text-gray-500' />
                  </button>
                  <div className='w-px bg-gray-200'></div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onTabDelete(tab.id);
                    }}
                    className='p-1 hover:bg-red-50 rounded-r-full transition-colors'
                    title='Delete tab'
                  >
                    <XMarkIcon className='h-3 w-3 text-red-500' />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add new tab button */}
          <button
            onClick={onTabAdd}
            className='ml-2 p-2 rounded-full bg-white hover:bg-gray-50 transition-colors shadow-sm border border-gray-200'
            title='Add new page'
          >
            <PlusIcon className='h-4 w-4 text-gray-600' />
          </button>
        </div>
      </div>

      {/* Page Builder Controls - Positioned absolutely on the right */}
      {showPageBuilderControls && (
        <div className='absolute top-0 right-0 flex items-center space-x-2'>
          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className='bg-white rounded-lg shadow-sm border border-gray-200 p-2 hover:bg-gray-50 transition-colors'
              title='Dashboard Settings'
            >
              <Cog6ToothIcon className='h-4 w-4 text-gray-600' />
            </button>
          )}

          {/* Add Widget Button - Hard Hat Icon */}
          <button
            onClick={onAddWidgets}
            className='bg-white rounded-lg shadow-sm border border-gray-200 p-2 hover:bg-gray-50 transition-colors'
            title='Add Widgets'
          >
            <svg
              className='h-4 w-4 text-gray-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardTabs;
