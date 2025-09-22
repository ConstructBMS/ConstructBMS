import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SimpleTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleTestModal({ isOpen, onClose }: SimpleTestModalProps) {
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  return createPortal(
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        cursor: 'pointer',
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
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'default',
        }}
        onClick={handleModalClick}
      >
        <h2
          style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold' }}
        >
          Simple Test Modal
        </h2>
        <p style={{ margin: '0 0 16px 0' }}>
          This is a simple test modal. Click outside to close or press ESC.
        </p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}
