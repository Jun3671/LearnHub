import React, { useEffect, useState } from 'react';

function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress > 0 ? newProgress : 0;
        });
      }, 100);

      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
        setProgress(100);
      };
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: 'bg-white',
      border: 'border-primary-200',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      progressBg: 'bg-primary-500',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-white',
      border: 'border-rose/30',
      iconBg: 'bg-rose/10',
      iconColor: 'text-rose',
      progressBg: 'bg-rose',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-white',
      border: 'border-blue/30',
      iconBg: 'bg-blue/10',
      iconColor: 'text-blue',
      progressBg: 'bg-blue',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  const style = styles[type] || styles.success;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`relative flex items-start gap-3 px-4 py-4 rounded-xl border ${style.bg} ${style.border} shadow-lg min-w-[320px] max-w-md overflow-hidden`}>
        {/* Icon */}
        <div className={`flex-shrink-0 w-9 h-9 ${style.iconBg} ${style.iconColor} rounded-lg flex items-center justify-center`}>
          {style.icon}
        </div>

        {/* Message */}
        <div className="flex-1 pt-1">
          <p className="text-sm font-medium text-neutral-800 leading-relaxed">{message}</p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress bar */}
        <div
          className={`absolute bottom-0 left-0 h-1 ${style.progressBg} rounded-b-xl transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default Toast;
