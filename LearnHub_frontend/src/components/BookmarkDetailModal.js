import React from 'react';

function BookmarkDetailModal({ isOpen, onClose, bookmark }) {
  if (!isOpen || !bookmark) return null;

  const getHostname = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Link';
    }
  };

  const getFavicon = (url) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getFavicon(bookmark.url) && (
              <img
                src={getFavicon(bookmark.url)}
                alt=""
                className="w-8 h-8 rounded-lg bg-white p-1"
                onError={(e) => (e.target.style.display = 'none')}
              />
            )}
            <div>
              <h2 className="text-lg font-bold text-white line-clamp-1">{bookmark.title || 'Untitled'}</h2>
              <p className="text-primary-100 text-sm">{getHostname(bookmark.url)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Thumbnail */}
          {bookmark.s3ThumbnailUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-neutral-200">
              <img
                src={bookmark.s3ThumbnailUrl}
                alt={bookmark.title}
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          {/* URL */}
          <div className="mb-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between gap-4">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 hover:underline break-all text-sm flex-1"
              >
                {bookmark.url}
              </a>
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-neutral-200 rounded-lg transition-colors flex-shrink-0"
                title="링크 복사"
              >
                <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Description */}
          {bookmark.description && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                설명
              </h4>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                {bookmark.description}
              </p>
            </div>
          )}

          {/* AI Summary */}
          {bookmark.summary && (
            <div className="mb-6 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-5 border border-primary-200/50">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI 요약
              </h4>
              <p className="text-primary-700 leading-relaxed whitespace-pre-wrap">
                {bookmark.summary}
              </p>
            </div>
          )}

          {/* Category & Tags */}
          <div className="flex flex-wrap gap-6 mb-6">
            {bookmark.category && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-800 mb-2">카테고리</h4>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg font-medium text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {bookmark.category.name}
                </span>
              </div>
            )}

            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-neutral-800 mb-2">태그</h4>
                <div className="flex flex-wrap gap-2">
                  {bookmark.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-lg text-sm font-medium hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-default"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="pt-5 border-t border-neutral-200">
            <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
              {bookmark.createdAt && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>생성: {formatDate(bookmark.createdAt)}</span>
                </div>
              )}
              {bookmark.updatedAt && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>수정: {formatDate(bookmark.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl font-medium hover:bg-white transition-colors"
          >
            닫기
          </button>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            사이트 방문
          </a>
        </div>
      </div>
    </div>
  );
}

export default BookmarkDetailModal;
