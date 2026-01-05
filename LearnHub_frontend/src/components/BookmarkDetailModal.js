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
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">북마크 상세</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Thumbnail */}
          {bookmark.s3ThumbnailUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
              <img
                src={bookmark.s3ThumbnailUrl}
                alt={bookmark.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Title & URL */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {getFavicon(bookmark.url) && (
                <img
                  src={getFavicon(bookmark.url)}
                  alt=""
                  className="w-5 h-5"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              )}
              <span className="text-sm text-gray-500">{getHostname(bookmark.url)}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {bookmark.title || 'Untitled'}
            </h3>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 hover:underline break-all"
            >
              {bookmark.url}
            </a>
          </div>

          {/* Description */}
          {bookmark.description && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">설명</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {bookmark.description}
              </p>
            </div>
          )}

          {/* Summary */}
          {bookmark.summary && (
            <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                AI 요약
              </h4>
              <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                {bookmark.summary}
              </p>
            </div>
          )}

          {/* Category */}
          {bookmark.category && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">카테고리</h4>
              <span className="inline-block px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg font-medium">
                {bookmark.category.name}
              </span>
            </div>
          )}

          {/* Tags */}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">태그</h4>
              <div className="flex flex-wrap gap-2">
                {bookmark.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {bookmark.createdAt && (
                <div>
                  <span className="text-gray-500">생성일:</span>{' '}
                  <span className="text-gray-900">{formatDate(bookmark.createdAt)}</span>
                </div>
              )}
              {bookmark.updatedAt && (
                <div>
                  <span className="text-gray-500">수정일:</span>{' '}
                  <span className="text-gray-900">{formatDate(bookmark.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex gap-3 justify-end">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            사이트 방문
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-medium border border-gray-300 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookmarkDetailModal;
