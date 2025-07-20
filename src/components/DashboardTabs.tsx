import React, { useState, useRef, useEffect } from 'react';
import {
  PencilIcon,
  XMarkIcon,
  PlusIcon,
  Cog6ToothIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';

interface DashboardTab {
  icon: string;
  id: string;
  label: string;
  moduleKey: string;
}

interface DashboardTabsProps {
  activeTab: string;
  onOpenSettings?: () => void;
  onTabAdd: () => void;
  onTabChange: (tabId: string) => void;
  onTabDelete: (tabId: string) => void;
  onTabEdit: (tabId: string, newLabel: string) => void;
  showPageBuilderControls?: boolean;
  tabs: DashboardTab[];
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onTabEdit,
  onTabDelete,
  onTabAdd,
  showPageBuilderControls = false,
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
    <div className='relative mb-6 overflow-visible'>
      {/* Tabs Section - Centered */}
      <div className='flex justify-center pt-8'>
        <div className='flex items-center'>
          {tabs.map(tab => (
            <div key={tab.id} className='relative group'>
              <div
                className={`flex items-center px-4 py-2 rounded-full cursor-pointer transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-accent font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
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
              <div className='absolute -top-6 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50'>
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
        <div className='absolute top-0 right-0 flex items-center space-x-2 z-50'>
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


        </div>
      )}
    </div>
  );
};

export default DashboardTabs;
