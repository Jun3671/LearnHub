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
    <div className="group relative bg-white rounded-lg border border-neutral-200/60 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 overflow-hidden">
      {/* Thumbnail */}
      {bookmark.s3ThumbnailUrl && (
        <div
          className="relative h-48 w-full bg-neutral-100 overflow-hidden cursor-pointer"
          onClick={() => onViewDetail(bookmark)}
        >
          <img
            src={bookmark.s3ThumbnailUrl}
            alt={bookmark.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header with Favicon and URL */}
        <div className="flex items-center gap-2 mb-2">
          {getFavicon(bookmark.url) && (
            <img
              src={getFavicon(bookmark.url)}
              alt=""
              className="w-4 h-4 opacity-60"
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}
          <span className="text-xs text-neutral-500 font-medium tracking-wide truncate">
            {getHostname(bookmark.url)}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-semibold text-neutral-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200 cursor-pointer leading-snug"
          onClick={() => onViewDetail(bookmark)}
        >
          {bookmark.title || 'Untitled'}
        </h3>

        {/* Description */}
        {bookmark.description && (
          <p
            className="text-sm text-neutral-600 leading-relaxed line-clamp-3 mb-3 cursor-pointer hover:text-neutral-800 transition-colors"
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
                className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors cursor-pointer"
              >
                {tag.name}
              </span>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="text-xs px-2.5 py-1 text-neutral-400 font-medium">
                +{bookmark.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
          >
            <span>Visit</span>
            <svg
              className="w-4 h-4 transform group-hover/link:translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(bookmark)}
              className="p-1.5 hover:bg-primary-50 text-neutral-600 hover:text-primary-600 rounded-md transition-all duration-200 hover:scale-110 active:scale-95"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(bookmark.id)}
              className="p-1.5 hover:bg-rose/10 text-neutral-600 hover:text-rose rounded-md transition-all duration-200 hover:scale-110 active:scale-95"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookmarkCard;
