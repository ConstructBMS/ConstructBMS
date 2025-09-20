import React from 'react';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestModal({ isOpen, onClose }: TestModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div 
        className='fixed inset-0 bg-black/50' 
        onClick={onClose}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Modal */}
      <div 
        className='relative bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='text-xl font-bold mb-4'>Test Modal</h2>
        <p className='mb-4'>This is a simple test modal. Click outside to close.</p>
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
