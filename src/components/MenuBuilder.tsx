import React, { useState } from 'react';
import { useMenu } from '../contexts/MenuContext';
import type { MenuItem } from '../types/menu';

let nextId = 1000;

const MenuBuilder: React.FC = () => {
  const { menu, setMenu, resetMenu } = useMenu();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [addChildTo, setAddChildTo] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, item: MenuItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    setDragOverId(itemId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== targetId) {
      setMenu(reorderMenuItem(menu, draggedItem.id, targetId));
    }
    setDraggedItem(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverId(null);
  };

  // Recursive render
  const renderMenu = (items: MenuItem[], parentId?: string) => (
    <ul className={parentId ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}>
      {items
        .sort((a, b) => a.order - b.order)
        .map((item, index) => (
          <li key={item.id}>
            {/* Drop line indicator above the item */}
            {dragOverId === item.id && draggedItem?.id !== item.id && (
              <div className='mb-2 p-2 bg-green-100 border-2 border-dashed border-green-400 rounded text-center text-sm text-green-700'>
                Drop here to reorder
              </div>
            )}

            <div
              className={`mb-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                draggedItem?.id === item.id
                  ? 'border-blue-500 bg-blue-50 opacity-50 shadow-lg'
                  : dragOverId === item.id
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
              draggable
              onDragStart={e => handleDragStart(e, item)}
              onDragOver={e => handleDragOver(e, item.id)}
              onDrop={e => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
            >
              <div className='flex items-center space-x-3'>
                <div className='flex items-center space-x-1'>
                  <span className='cursor-move text-gray-400 hover:text-gray-600 transition-colors'>
                    ⋮⋮
                  </span>
                  <div className='flex flex-col space-y-1'>
                    {index > 0 && (
                      <button
                        onClick={() =>
                          setMenu(moveMenuItem(menu, item.id, 'up'))
                        }
                        className='p-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors'
                        title='Move Up'
                      >
                        ↑
                      </button>
                    )}
                    {index < items.length - 1 && (
                      <button
                        onClick={() =>
                          setMenu(moveMenuItem(menu, item.id, 'down'))
                        }
                        className='p-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors'
                        title='Move Down'
                      >
                        ↓
                      </button>
                    )}
                  </div>
                </div>

                <div className='flex-1'>
                  {editingId === item.id ? (
                    <input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => {
                        setMenu(updateMenuName(menu, item.id, editValue));
                        setEditingId(null);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setMenu(updateMenuName(menu, item.id, editValue));
                          setEditingId(null);
                        }
                        if (e.key === 'Escape') {
                          setEditingId(null);
                        }
                      }}
                      className='w-full border border-gray-300 px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      autoFocus
                    />
                  ) : (
                    <div className='flex items-center space-x-2'>
                      <span
                        onClick={() => {
                          setEditingId(item.id);
                          setEditValue(item.label);
                        }}
                        className='cursor-pointer hover:text-blue-600 transition-colors font-medium'
                      >
                        {item.label}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {item.type === 'parent' ? 'Parent' : 'Child'}
                      </span>
                      {item.moduleKey && (
                        <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                          {item.moduleKey}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() =>
                      setMenu(toggleMenuItemVisibility(menu, item.id))
                    }
                    className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                      item.visible
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {item.visible ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => setMenu(removeMenuItem(menu, item.id))}
                    className='text-xs px-3 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-700 font-medium transition-colors'
                  >
                    Delete
                  </button>
                  {item.type === 'parent' && (
                    <button
                      onClick={() => setAddChildTo(item.id)}
                      className='text-xs px-3 py-1 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition-colors'
                    >
                      Add Child
                    </button>
                  )}
                </div>
              </div>
              {addChildTo === item.id && (
                <div className='flex items-center mt-3 space-x-2 p-3 bg-gray-50 rounded-md'>
                  <input
                    value={newChildName}
                    onChange={e => setNewChildName(e.target.value)}
                    placeholder='New child name'
                    className='flex-1 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newChildName.trim()) {
                        setMenu(
                          addChildMenuItem(menu, item.id, newChildName.trim())
                        );
                        setNewChildName('');
                        setAddChildTo(null);
                      }
                      if (e.key === 'Escape') {
                        setAddChildTo(null);
                        setNewChildName('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newChildName.trim()) {
                        setMenu(
                          addChildMenuItem(menu, item.id, newChildName.trim())
                        );
                        setNewChildName('');
                        setAddChildTo(null);
                      }
                    }}
                    className='px-4 py-2 bg-constructbms-blue text-black rounded-md hover:bg-constructbms-dark font-medium transition-colors'
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setAddChildTo(null);
                      setNewChildName('');
                    }}
                    className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-medium transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              )}
              {item.children && renderMenu(item.children, item.id)}
            </div>

            {/* Drop line indicator below the item */}
            {dragOverId === item.id && draggedItem?.id !== item.id && (
              <div className='mt-2 p-2 bg-green-100 border-2 border-dashed border-green-400 rounded text-center text-sm text-green-700'>
                Drop here to reorder
              </div>
            )}
          </li>
        ))}
    </ul>
  );

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Menu Builder</h1>
        <p className='text-gray-600 mb-4'>
          Drag items to reorder. Click names to edit. Use buttons to manage
          visibility and structure. Changes are applied immediately to the
          sidebar.
        </p>
        <div className='flex items-center space-x-4'>
          <button
            onClick={resetMenu}
            className='px-6 py-3 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-dark font-medium transition-colors'
          >
            Reset to Default
          </button>
          <div className='flex items-center space-x-2'>
            <input
              value={newParentName}
              onChange={e => setNewParentName(e.target.value)}
              placeholder='New parent name'
              className='border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              onKeyDown={e => {
                if (e.key === 'Enter' && newParentName.trim()) {
                  setMenu(addParentMenuItem(menu, newParentName.trim()));
                  setNewParentName('');
                }
              }}
            />
            <button
              onClick={() => {
                if (newParentName.trim()) {
                  setMenu(addParentMenuItem(menu, newParentName.trim()));
                  setNewParentName('');
                }
              }}
              className='px-6 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-dark font-medium transition-colors'
            >
              Add Parent
            </button>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>
          Menu Structure
        </h2>
        {renderMenu(menu)}
      </div>
    </div>
  );
};

// --- Helper functions ---
function updateMenuName(
  menu: MenuItem[],
  id: string,
  newName: string
): MenuItem[] {
  return menu.map(item =>
    item.id === id
      ? { ...item, label: newName }
      : {
          ...item,
          children: item.children
            ? updateMenuName(item.children, id, newName)
            : item.children,
        }
  );
}

function toggleMenuItemVisibility(menu: MenuItem[], id: string): MenuItem[] {
  return menu.map(item =>
    item.id === id
      ? { ...item, visible: !item.visible }
      : {
          ...item,
          children: item.children
            ? toggleMenuItemVisibility(item.children, id)
            : item.children,
        }
  );
}

function removeMenuItem(menu: MenuItem[], id: string): MenuItem[] {
  return menu
    .filter(item => item.id !== id)
    .map(item => ({
      ...item,
      children: item.children
        ? removeMenuItem(item.children, id)
        : item.children,
    }));
}

function addParentMenuItem(menu: MenuItem[], label: string): MenuItem[] {
  return [
    ...menu,
    {
      id: `parent-${nextId++}`,
      label,
      type: 'parent',
      visible: true,
      order: menu.length + 1,
      children: [],
    },
  ];
}

function addChildMenuItem(
  menu: MenuItem[],
  parentId: string,
  label: string
): MenuItem[] {
  return menu.map(item =>
    item.id === parentId && item.type === 'parent'
      ? {
          ...item,
          children: [
            ...(item.children || []),
            {
              id: `child-${nextId++}`,
              label,
              type: 'child',
              parentId,
              visible: true,
              order: (item.children?.length || 0) + 1,
            },
          ],
        }
      : {
          ...item,
          children: item.children
            ? addChildMenuItem(item.children, parentId, label)
            : item.children,
        }
  );
}

function reorderMenuItem(
  menu: MenuItem[],
  draggedId: string,
  targetId: string
): MenuItem[] {
  const findItem = (items: MenuItem[], id: string): MenuItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItem(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const removeItem = (items: MenuItem[], id: string): MenuItem[] => {
    return items.filter(item => {
      if (item.id === id) return false;
      if (item.children) {
        item.children = removeItem(item.children, id);
      }
      return true;
    });
  };

  const addItemAtPosition = (
    items: MenuItem[],
    targetId: string,
    itemToAdd: MenuItem
  ): MenuItem[] => {
    return items.map(item => {
      if (item.id === targetId) {
        return {
          ...item,
          children: item.children ? [itemToAdd, ...item.children] : [itemToAdd],
        };
      }
      if (item.children) {
        return {
          ...item,
          children: addItemAtPosition(item.children, targetId, itemToAdd),
        };
      }
      return item;
    });
  };

  const updateOrder = (items: MenuItem[]): MenuItem[] => {
    return items.map((item, index) => ({
      ...item,
      order: index + 1,
      children: item.children ? updateOrder(item.children) : undefined,
    }));
  };

  const draggedItem = findItem(menu, draggedId);
  if (!draggedItem) return menu;

  const menuWithoutDragged = removeItem(menu, draggedId);
  const menuWithDraggedAtTarget = addItemAtPosition(
    menuWithoutDragged,
    targetId,
    draggedItem
  );
  return updateOrder(menuWithDraggedAtTarget);
}

function moveMenuItem(
  menu: MenuItem[],
  itemId: string,
  direction: 'up' | 'down'
): MenuItem[] {
  const findItemAndParent = (
    items: MenuItem[],
    id: string
  ): { index: number, item: MenuItem | null; parent: MenuItem[] | null; } => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        return { item: items[i], parent: items, index: i };
      }
      if (items[i].children) {
        const result = findItemAndParent(items[i].children!, id);
        if (result.item) return result;
      }
    }
    return { item: null, parent: null, index: -1 };
  };

  const { item, parent, index } = findItemAndParent(menu, itemId);
  if (!item || !parent || index === -1) return menu;

  const newParent = [...parent];
  const newIndex =
    direction === 'up'
      ? Math.max(0, index - 1)
      : Math.min(newParent.length - 1, index + 1);

  if (newIndex === index) return menu;

  // Remove item from current position
  newParent.splice(index, 1);
  // Insert item at new position
  newParent.splice(newIndex, 0, item);

  // Update order values
  newParent.forEach((item, idx) => {
    item.order = idx + 1;
  });

  return menu;
}

export default MenuBuilder;
