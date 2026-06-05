import React, { useEffect } from 'react';
import { XLg, ExclamationTriangle, QuestionCircle, CheckCircle } from 'react-bootstrap-icons';

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title = 'Confirmation requise',
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, isLoading]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Icon mapping based on variant
  const getIcon = () => {
    switch (confirmVariant) {
      case 'danger':
        return <ExclamationTriangle className="text-red-600" size={22} />;
      case 'warning':
        return <ExclamationTriangle className="text-warning" size={22} />;
      case 'success':
        return <CheckCircle className="text-emerald-600" size={22} />;
      default:
        return <QuestionCircle className="text-primary" size={22} />;
    }
  };

  // Button variant mappings
  const getConfirmButtonClass = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'btn btn-danger';
      case 'warning':
        return 'btn btn-warning text-white';
      case 'success':
        return 'btn btn-success bg-emerald-600 border-emerald-600 hover:bg-emerald-850';
      default:
        return 'btn btn-primary';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{
          zIndex: 1060,
          backdropFilter: 'blur(3px)',
          transition: 'all 0.2s ease-in-out',
        }}
        onClick={isLoading ? undefined : onCancel}
        id="confirm-modal-backdrop"
      />

      {/* Modal */}
      <div
        className="position-fixed top-50 start-50 translate-middle bg-white rounded-3 shadow-lg overflow-hidden border border-stone-200"
        style={{
          zIndex: 1061,
          width: 'calc(100% - 2rem)',
          maxWidth: '440px',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Header */}
        <div className="px-4 py-3 border-bottom border-stone-100 d-flex justify-content-between align-items-center bg-stone-50">
          <div className="d-flex align-items-center gap-2 fw-semibold text-stone-800" id="confirm-modal-title">
            {getIcon()}
            <span>{title}</span>
          </div>
          <button
            className="btn btn-link text-stone-400 p-0 border-0 d-flex align-items-center text-decoration-none"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Fermer"
            id="confirm-modal-close-btn"
          >
            <XLg size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="text-stone-600" id="confirm-modal-message">
            {message}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 d-flex justify-content-end gap-2 bg-white">
          <button
            type="button"
            className="btn btn-outline-secondary px-3 py-1.5 rounded-2"
            onClick={onCancel}
            disabled={isLoading}
            id="confirm-modal-cancel-btn"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`${getConfirmButtonClass()} px-3 py-1.5 rounded-2 d-flex align-items-center gap-2`}
            onClick={onConfirm}
            disabled={isLoading}
            id="confirm-modal-confirm-btn"
          >
            {isLoading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
