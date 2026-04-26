import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export function useConfirmDialog() {
  const [dialog, setDialog] = useState(null);

  const confirm = (message, title = 'Konfirmasi') => {
    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        },
      });
    });
  };

  return { dialog, confirm, setDialog };
}

export function ConfirmDialog({ dialog, onClose }) {
  if (!dialog) return null;

  return (
    <div className="modal-backdrop" role="alertdialog" aria-modal="true">
      <div className="confirm-modal">
        <div className="confirm-header">
          <div className="confirm-icon">
            <AlertCircle size={24} />
          </div>
          <h2>{dialog.title}</h2>
          <button
            className="modal-close"
            onClick={dialog.onCancel}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="confirm-body">
          <p>{dialog.message}</p>
        </div>

        <div className="confirm-actions">
          <button
            className="secondary-button"
            onClick={dialog.onCancel}
          >
            Batal
          </button>
          <button
            className="danger-button"
            onClick={dialog.onConfirm}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
