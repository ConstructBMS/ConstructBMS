import React, { useState } from 'react';
import { useMenu } from '../contexts/MenuContext';
import { ChevronUp, ChevronDown, Move, Eye, EyeOff } from 'lucide-react';

const ModulesPage: React.FC = () => {
  const { modules, setModules, menu, setMenu } = useMenu();
  const [draggedModule, setDraggedModule] = useState<string | null>(null);
  const [dragOverModule, setDragOverModule] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<
    'core' | 'additional' | null
  >(null);
  const [dropPreviewIndex, setDropPreviewIndex] = useState<number | null>(null);
  const [dropPreviewSection, setDropPreviewSection] = useState<
    'core' | 'additional' | null
  >(null);

  const handleToggleModule = (moduleKey: string) => {
    setModules({
      ...modules,
      [moduleKey]: {
        ...modules[moduleKey],
        active: !modules[moduleKey].active,
      },
    });
  };

  const handleMoveModule = (
    moduleKey: string,
    newType: 'core' | 'additional'
  ) => {
    setModules({
      ...modules,
      [moduleKey]: {
        ...modules[moduleKey],
        type: newType,
      },
    });
  };

  const handleDragStart = (e: React.DragEvent, moduleKey: string) => {
    setDraggedModule(moduleKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (
    e: React.DragEvent,
    moduleKey: string,
    section: 'core' | 'additional'
  ) => {
    e.preventDefault();
    setDragOverModule(moduleKey);
    setDragOverSection(section);

    // Calculate drop preview index
    const sectionModules = section === 'core' ? coreModules : additionalModules;
    const moduleIndex = sectionModules.findIndex(([key]) => key === moduleKey);
    setDropPreviewIndex(moduleIndex);
    setDropPreviewSection(section);
  };

  const handleDrop = (
    e: React.DragEvent,
    targetModuleKey: string,
    targetSection: 'core' | 'additional'
  ) => {
    e.preventDefault();
    if (!draggedModule) return;

    // Use dropPreviewIndex and dropPreviewSection if set
    if (dropPreviewIndex !== null && dropPreviewSection) {
      const sectionModules =
        dropPreviewSection === 'core' ? coreModules : additionalModules;
      const draggedModuleData = modules[draggedModule];
      let newModulesArr = Object.entries(modules).filter(
        ([key]) => key !== draggedModule
      );

      // Build new section arrays
      let coreArr = newModulesArr.filter(([_, m]) => m.type === 'core');
      let addArr = newModulesArr.filter(([_, m]) => m.type === 'additional');

      // Insert dragged module at the preview index in the correct section
      const insertArr = dropPreviewSection === 'core' ? coreArr : addArr;
      insertArr.splice(dropPreviewIndex, 0, [
        draggedModule,
        { ...draggedModuleData, type: dropPreviewSection },
      ]);

      // Recombine
      const finalArr = [
        ...(dropPreviewSection === 'core' ? insertArr : coreArr),
        ...(dropPreviewSection === 'additional' ? insertArr : addArr),
      ];
      const newModules = Object.fromEntries(finalArr);
      setModules(newModules);
    } else {
      // fallback: old logic
      const draggedModuleData = modules[draggedModule];
      const targetModuleData = modules[targetModuleKey];
      if (draggedModuleData.type !== targetSection) {
        setModules({
          ...modules,
          [draggedModule]: {
            ...draggedModuleData,
            type: targetSection,
          },
        });
      } else {
        const moduleEntries = Object.entries(modules);
        const draggedIndex = moduleEntries.findIndex(
          ([key]) => key === draggedModule
        );
        const targetIndex = moduleEntries.findIndex(
          ([key]) => key === targetModuleKey
        );
        const reorderedModules = [...moduleEntries];
        const [draggedEntry] = reorderedModules.splice(draggedIndex, 1);
        reorderedModules.splice(targetIndex, 0, draggedEntry);
        const newModules = Object.fromEntries(reorderedModules);
        setModules(newModules);
      }
    }
    setDraggedModule(null);
    setDragOverModule(null);
    setDragOverSection(null);
    setDropPreviewIndex(null);
    setDropPreviewSection(null);
  };

  const handleDragEnd = () => {
    setDraggedModule(null);
    setDragOverModule(null);
    setDragOverSection(null);
    setDropPreviewIndex(null);
    setDropPreviewSection(null);
  };

  const handleSectionDrop = (
    e: React.DragEvent,
    section: 'core' | 'additional'
  ) => {
    e.preventDefault();
    if (!draggedModule) return;
    if (dropPreviewIndex !== null && dropPreviewSection) {
      const sectionModules =
        dropPreviewSection === 'core' ? coreModules : additionalModules;
      const draggedModuleData = modules[draggedModule];
      let newModulesArr = Object.entries(modules).filter(
        ([key]) => key !== draggedModule
      );
      let coreArr = newModulesArr.filter(([_, m]) => m.type === 'core');
      let addArr = newModulesArr.filter(([_, m]) => m.type === 'additional');
      const insertArr = dropPreviewSection === 'core' ? coreArr : addArr;
      insertArr.splice(dropPreviewIndex, 0, [
        draggedModule,
        { ...draggedModuleData, type: dropPreviewSection },
      ]);
      const finalArr = [
        ...(dropPreviewSection === 'core' ? insertArr : coreArr),
        ...(dropPreviewSection === 'additional' ? insertArr : addArr),
      ];
      const newModules = Object.fromEntries(finalArr);
      setModules(newModules);
    } else {
      // fallback: just move to end of section
      const draggedModuleData = modules[draggedModule];
      setModules({
        ...modules,
        [draggedModule]: {
          ...draggedModuleData,
          type: section,
        },
      });
    }
    setDraggedModule(null);
    setDragOverModule(null);
    setDragOverSection(null);
    setDropPreviewIndex(null);
    setDropPreviewSection(null);
  };

  const coreModules = Object.entries(modules).filter(
    ([_, module]) => module.type === 'core'
  );
  const additionalModules = Object.entries(modules).filter(
    ([_, module]) => module.type === 'additional'
  );

  const renderModuleCard = (
    moduleKey: string,
    module: any,
    isCore: boolean,
    index: number
  ) => {
    const isDragging = draggedModule === moduleKey;
    const isDragOver = dragOverModule === moduleKey;
    const isDragOverSection =
      dragOverSection === (isCore ? 'core' : 'additional');
    const showDropPreview =
      dropPreviewSection === (isCore ? 'core' : 'additional') &&
      dropPreviewIndex === index &&
      draggedModule !== moduleKey;

    return (
      <div key={moduleKey}>
        {/* Drop preview placeholder */}
        {showDropPreview && (
          <div className='h-24 bg-green-100 border-2 border-dashed border-green-400 rounded-lg mb-4 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-green-700 font-medium'>Drop here</div>
              <div className='text-xs text-green-600'>
                Module will be placed here
              </div>
            </div>
          </div>
        )}

        <div
          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50 opacity-50 shadow-lg transform rotate-2 scale-105'
              : isDragOver
                ? 'border-green-500 bg-green-50 shadow-md transform scale-105'
                : module.active
                  ? isCore
                    ? 'border-green-200 bg-green-50'
                    : 'border-purple-200 bg-purple-50'
                  : 'border-gray-200 bg-gray-50'
          }`}
          draggable
          onDragStart={e => handleDragStart(e, moduleKey)}
          onDragOver={e =>
            handleDragOver(e, moduleKey, isCore ? 'core' : 'additional')
          }
          onDrop={e => handleDrop(e, moduleKey, isCore ? 'core' : 'additional')}
          onDragEnd={handleDragEnd}
        >
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center space-x-2'>
              <Move className='h-4 w-4 text-gray-400 cursor-move' />
              <h3 className='font-medium text-gray-900'>{module.name}</h3>
            </div>
            <div className='flex items-center space-x-2'>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  module.active
                    ? isCore
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {module.active ? 'Active' : 'Inactive'}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  isCore
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {isCore ? 'Core' : 'Additional'}
              </span>
            </div>
          </div>

          <div className='flex items-center space-x-2 mb-3'>
            <button
              onClick={() => handleToggleModule(moduleKey)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                module.active
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : isCore
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              {module.active ? 'Deactivate' : 'Activate'}
            </button>

            {isCore ? (
              <button
                onClick={() => handleMoveModule(moduleKey, 'additional')}
                className='px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 text-sm font-medium transition-colors'
                title='Move to Additional'
              >
                <ChevronDown className='h-4 w-4' />
              </button>
            ) : (
              <button
                onClick={() => handleMoveModule(moduleKey, 'core')}
                className='px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium transition-colors'
                title='Move to Core'
              >
                <ChevronUp className='h-4 w-4' />
              </button>
            )}
          </div>

          {/* Module Key Display */}
          <div className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
            Key: {moduleKey}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Module Management
        </h1>
        <p className='text-gray-600 mb-4'>
          Drag modules to reorder. Move modules between Core and Additional
          sections. Changes are applied immediately to the sidebar.
        </p>
      </div>

      {/* Core Modules */}
      <div className='mb-8'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
          <span className='w-2 h-2 bg-blue-500 rounded-full mr-3'></span>
          Core Modules
        </h2>
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
            dragOverSection === 'core' && draggedModule
              ? 'border-green-400 bg-green-50'
              : 'border-transparent'
          }`}
          onDragOver={e => {
            e.preventDefault();
            setDragOverSection('core');
            if (draggedModule && coreModules.length === 0) {
              setDropPreviewIndex(0);
              setDropPreviewSection('core');
            }
          }}
          onDrop={e => handleSectionDrop(e, 'core')}
        >
          {coreModules.map(([key, module], index) =>
            renderModuleCard(key, module, true, index)
          )}
          {dragOverSection === 'core' &&
            draggedModule &&
            coreModules.length === 0 && (
              <div className='col-span-full p-8 text-center border-2 border-dashed border-green-400 bg-green-50 rounded-lg'>
                <span className='text-green-700 font-medium'>
                  Drop here to add to Core Modules
                </span>
              </div>
            )}
          {/* Drop preview for end of core modules */}
          {dragOverSection === 'core' &&
            draggedModule &&
            coreModules.length > 0 && (
              <div className='h-24 bg-green-100 border-2 border-dashed border-green-400 rounded-lg flex items-center justify-center'>
                <div className='text-center'>
                  <div className='text-green-700 font-medium'>Drop here</div>
                  <div className='text-xs text-green-600'>
                    Add to end of Core Modules
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Additional Modules */}
      <div className='mb-8'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
          <span className='w-2 h-2 bg-purple-500 rounded-full mr-3'></span>
          Additional Modules
        </h2>
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
            dragOverSection === 'additional' && draggedModule
              ? 'border-green-400 bg-green-50'
              : 'border-transparent'
          }`}
          onDragOver={e => {
            e.preventDefault();
            setDragOverSection('additional');
            if (draggedModule && additionalModules.length === 0) {
              setDropPreviewIndex(0);
              setDropPreviewSection('additional');
            }
          }}
          onDrop={e => handleSectionDrop(e, 'additional')}
        >
          {additionalModules.map(([key, module], index) =>
            renderModuleCard(key, module, false, index)
          )}
          {dragOverSection === 'additional' &&
            draggedModule &&
            additionalModules.length === 0 && (
              <div className='col-span-full p-8 text-center border-2 border-dashed border-green-400 bg-green-50 rounded-lg'>
                <span className='text-green-700 font-medium'>
                  Drop here to add to Additional Modules
                </span>
              </div>
            )}
          {/* Drop preview for end of additional modules */}
          {dragOverSection === 'additional' &&
            draggedModule &&
            additionalModules.length > 0 && (
              <div className='h-24 bg-green-100 border-2 border-dashed border-green-400 rounded-lg flex items-center justify-center'>
                <div className='text-center'>
                  <div className='text-green-700 font-medium'>Drop here</div>
                  <div className='text-xs text-green-600'>
                    Add to end of Additional Modules
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Summary */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <h3 className='font-medium text-blue-900 mb-2'>Module Summary</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
          <div>
            <span className='text-blue-700'>Total Modules:</span>
            <span className='ml-2 font-medium'>
              {Object.keys(modules).length}
            </span>
          </div>
          <div>
            <span className='text-green-700'>Active:</span>
            <span className='ml-2 font-medium'>
              {Object.values(modules).filter(m => m.active).length}
            </span>
          </div>
          <div>
            <span className='text-gray-700'>Core:</span>
            <span className='ml-2 font-medium'>{coreModules.length}</span>
          </div>
          <div>
            <span className='text-purple-700'>Additional:</span>
            <span className='ml-2 font-medium'>{additionalModules.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulesPage;
