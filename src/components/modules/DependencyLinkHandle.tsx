import React, { useState, useRef, useEffect } from 'react';
import { LinkIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { dependenciesEngine } from '../services/DependenciesEngine';

interface DependencyLinkHandleProps {
  onDependencyCreated?: (dependencyId: string) => void;
  position: 'start' | 'end';
  projectId: string;
  taskId: string;
}

const DependencyLinkHandle: React.FC<DependencyLinkHandleProps> = ({
  taskId,
  projectId,
  position,
  onDependencyCreated,
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [dependencyCount, setDependencyCount] = useState(0);

  const handleRef = useRef<HTMLDivElement>(null);

  const canEdit = canAccess('programme.task.edit');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);

      if (isDemo) {
        const count = await dependenciesEngine.getDependencyCount(projectId);
        setDependencyCount(count);
      }
    };
    checkDemoMode();
  }, [projectId]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent) => {
    if (!canEdit || (isDemoMode && dependencyCount >= 3)) return;

    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        taskId,
        position,
        type: 'dependency-link',
      })
    );

    setIsDragging(true);
    setDragPreview({ x: e.clientX, y: e.clientY });

    // Add drag preview
    const dragImage = new Image();
    dragImage.src =
      'data:image/svg+xml;base64,' +
      btoa(`
      <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="${isDemoMode ? '#fbbf24' : '#3b82f6'}" stroke="white" stroke-width="2"/>
        <path d="M6 10 L14 10 M10 6 L10 14" stroke="white" stroke-width="2"/>
      </svg>
    `);
    e.dataTransfer.setDragImage(dragImage, 10, 10);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDragPreview(null);
  };

  // Handle drag over (for visual feedback)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'link';
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    if (!canEdit || (isDemoMode && dependencyCount >= 3)) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));

      if (data.type === 'dependency-link' && data.taskId !== taskId) {
        // Determine dependency type based on positions
        let dependencyType: 'FS' | 'SS' | 'FF' | 'SF' = 'FS';

        if (data.position === 'end' && position === 'start') {
          dependencyType = 'FS'; // Finish-to-Start
        } else if (data.position === 'start' && position === 'start') {
          dependencyType = 'SS'; // Start-to-Start
        } else if (data.position === 'end' && position === 'end') {
          dependencyType = 'FF'; // Finish-to-Finish
        } else if (data.position === 'start' && position === 'end') {
          dependencyType = 'SF'; // Start-to-Finish
        }

        // Demo mode only allows FS dependencies
        if (isDemoMode && dependencyType !== 'FS') {
          console.warn('Demo mode only supports Finish-to-Start dependencies');
          dependencyType = 'FS';
        }

        const result = await dependenciesEngine.linkTasks(
          data.taskId,
          taskId,
          dependencyType,
          projectId
        );

        if (result.success && result.dependency) {
          console.log('Dependency created:', result.dependency.id);
          if (onDependencyCreated) {
            onDependencyCreated(result.dependency.id);
          }
        } else {
          console.error('Failed to create dependency:', result.error);
        }
      }
    } catch (error) {
      console.error('Error handling dependency drop:', error);
    }
  };

  // Handle mouse move for drag preview
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setDragPreview({ x: e.clientX, y: e.clientY });
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging]);

  // Check if handle should be disabled
  const isDisabled = !canEdit || (isDemoMode && dependencyCount >= 3);

  return (
    <>
      <div
        ref={handleRef}
        draggable={!isDisabled}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          absolute w-4 h-4 rounded-full cursor-grab active:cursor-grabbing
          transition-all duration-200 z-20
          ${
            isDisabled
              ? 'bg-gray-300 cursor-not-allowed opacity-50'
              : isDemoMode
                ? 'bg-yellow-400 hover:bg-yellow-500'
                : 'bg-blue-500 hover:bg-blue-600'
          }
          ${isDragging ? 'scale-110' : 'hover:scale-110'}
        `}
        style={{
          left: position === 'start' ? '-8px' : 'auto',
          right: position === 'end' ? '-8px' : 'auto',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        title={
          isDisabled
            ? 'Cannot create dependencies (insufficient permissions or demo limit reached)'
            : `Drag to link ${position === 'start' ? 'start' : 'end'} of this task to another task${isDemoMode ? ' (Demo Mode - FS only)' : ''}`
        }
      >
        <LinkIcon
          className={`w-3 h-3 mx-auto mt-0.5 ${
            isDisabled ? 'text-gray-500' : 'text-white'
          }`}
        />
      </div>

      {/* Drag Preview */}
      {isDragging && dragPreview && (
        <div
          className='fixed pointer-events-none z-50'
          style={{
            left: dragPreview.x - 10,
            top: dragPreview.y - 10,
          }}
        >
          <div
            className={`
            w-5 h-5 rounded-full border-2 border-dashed
            ${isDemoMode ? 'border-yellow-400 bg-yellow-100' : 'border-blue-400 bg-blue-100'}
          `}
          >
            <LinkIcon
              className={`w-3 h-3 mx-auto mt-0.5 ${
                isDemoMode ? 'text-yellow-600' : 'text-blue-600'
              }`}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DependencyLinkHandle;
