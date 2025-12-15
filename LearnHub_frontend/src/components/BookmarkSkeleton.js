import React from 'react';

// 북마크 로딩 스켈레톤 컴포넌트
function BookmarkSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {/* 썸네일 영역 */}
      <div className="h-48 bg-gray-200"></div>

      {/* 콘텐츠 영역 */}
      <div className="p-4">
        {/* 파비콘 + 도메인 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>

        {/* 제목 */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>

        {/* 설명 */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* 태그 */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-14"></div>
        </div>
      </div>
    </div>
  );
}

// 여러 개의 스켈레톤을 렌더링하는 컴포넌트
export function BookmarkSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <BookmarkSkeleton key={index} />
      ))}
    </div>
  );
}

export default BookmarkSkeleton;