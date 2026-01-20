import React, { useState } from 'react';

function BookmarkCard({ bookmark, onDelete, onEdit, onViewDetail, onCopyLink }) {
  const [imageError, setImageError] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

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
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    if (onCopyLink) {
      await onCopyLink(bookmark.url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleCardClick = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
      {/* Thumbnail */}
      <div
        className="relative h-44 w-full bg-gradient-to-br from-neutral-100 to-neutral-50 overflow-hidden"
        onClick={handleCardClick}
      >
        {bookmark.s3ThumbnailUrl && !imageError ? (
          <img
            src={bookmark.s3ThumbnailUrl}
            alt={bookmark.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                {getFavicon(bookmark.url) ? (
                  <img
                    src={getFavicon(bookmark.url)}
                    alt=""
                    className="w-8 h-8"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                ) : (
                  <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-primary-500 font-medium">{getHostname(bookmark.url)}</span>
            </div>
          </div>
        )}

        {/* Hover Overlay with Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Top Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
              title="링크 복사"
            >
              {showCopied ? (
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(bookmark); }}
              className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
              title="수정"
            >
              <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id); }}
              className="p-2 bg-white/90 hover:bg-rose/10 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
              title="삭제"
            >
              <svg className="w-4 h-4 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetail(bookmark); }}
              className="px-3 py-1.5 bg-white/90 hover:bg-white text-neutral-700 text-sm font-medium rounded-lg shadow-sm transition-all"
            >
              상세보기
            </button>
            <span className="px-3 py-1.5 bg-black/50 text-white text-xs rounded-lg backdrop-blur-sm">
              {getHostname(bookmark.url)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4" onClick={handleCardClick}>
        {/* Source Info */}
        <div className="flex items-center gap-2 mb-2">
          {getFavicon(bookmark.url) && (
            <img
              src={getFavicon(bookmark.url)}
              alt=""
              className="w-4 h-4 rounded"
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
            {bookmark.category?.name || getHostname(bookmark.url)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-neutral-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
          {bookmark.title || 'Untitled'}
        </h3>

        {/* Description */}
        {bookmark.description && (
          <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2 mb-3">
            {bookmark.description}
          </p>
        )}

        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {bookmark.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md font-medium hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                #{tag.name}
              </span>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="text-xs px-2 py-1 text-neutral-400 font-medium">
                +{bookmark.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDate(bookmark.createdAt)}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(bookmark.url, '_blank', 'noopener,noreferrer');
            }}
            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600 font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookmarkCard;
