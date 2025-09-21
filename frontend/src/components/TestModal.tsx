import React, { useEffect } from 'react';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestModal({ isOpen, onClose }: TestModalProps) {
  if (!isOpen) return null;

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop, not on child elements
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent event bubbling to backdrop
    e.stopPropagation();
  };

  return (
    <div 
      className='fixed inset-0 z-50 flex items-center justify-center'
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/50'
        style={{ cursor: 'pointer' }}
      />

      {/* Modal */}
      <div
        className='relative bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4'
        onClick={handleModalClick}
        style={{ cursor: 'default' }}
      >
        <h2 className='text-xl font-bold mb-4'>Test Modal</h2>
        <p className='mb-4'>
          This is a simple test modal. Click outside to close or press ESC.
        </p>
        <button
          onClick={onClose}
          className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
        >
          Close
        </button>
      </div>
    </div>
  );
}

