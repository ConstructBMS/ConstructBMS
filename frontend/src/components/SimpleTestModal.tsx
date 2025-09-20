import React from 'react';

interface SimpleTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleTestModal({ isOpen, onClose }: SimpleTestModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    console.log('Backdrop clicked!', e.target);
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    console.log('Modal clicked!', e.target);
    e.stopPropagation();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
        onClick={handleModalClick}
      >
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold' }}>
          Simple Test Modal
        </h2>
        <p style={{ margin: '0 0 16px 0' }}>
          This is a simple test modal. Click outside to close.
        </p>
        <button 
          onClick={onClose}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
