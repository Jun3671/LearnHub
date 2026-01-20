import React from 'react';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = '삭제', cancelText = '취소' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-rose/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800">{title}</h2>
              <p className="text-neutral-500 mt-1 text-sm leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-neutral-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-white font-medium transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-5 py-2.5 bg-rose hover:bg-rose/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-rose/25"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
