import React from 'react';

// 삭제 확인 모달 컴포넌트
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = '삭제', cancelText = '취소' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-modal max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-neutral-600 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-neutral-50/80 rounded-b-xl flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-semibold transition-all active:scale-98"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-rose hover:bg-rose/90 text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow-md active:scale-98"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
