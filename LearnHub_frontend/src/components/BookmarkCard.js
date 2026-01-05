import React from 'react';

function BookmarkCard({ bookmark, onDelete, onEdit, onViewDetail }) {
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

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Thumbnail */}
      {bookmark.s3ThumbnailUrl && (
        <div
          className="h-48 w-full bg-gray-100 overflow-hidden cursor-pointer"
          onClick={() => onViewDetail(bookmark)}
        >
          <img
            src={bookmark.s3ThumbnailUrl}
            alt={bookmark.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Header with Favicon and URL */}
        <div className="flex items-center gap-2 mb-2">
          {getFavicon(bookmark.url) && (
            <img
              src={getFavicon(bookmark.url)}
              alt=""
              className="w-4 h-4"
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}
          <span className="text-xs text-gray-500 truncate">{getHostname(bookmark.url)}</span>
        </div>

        {/* Title */}
        <h3
          className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors cursor-pointer"
          onClick={() => onViewDetail(bookmark)}
        >
          {bookmark.title || 'Untitled'}
        </h3>

        {/* Description */}
        {bookmark.description && (
          <p
            className="text-sm text-gray-600 line-clamp-3 mb-3 cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => onViewDetail(bookmark)}
            title="클릭하여 전체 내용 보기"
          >
            {bookmark.description}
          </p>
        )}

        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {bookmark.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md"
              >
                {tag.name}
              </span>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="text-xs px-2 py-1 text-gray-500">+{bookmark.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Visit →
          </a>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(bookmark)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(bookmark.id)}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookmarkCard;
