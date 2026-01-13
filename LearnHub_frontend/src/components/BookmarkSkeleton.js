import React from 'react';

// 북마크 로딩 스켈레톤 컴포넌트
function BookmarkSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-neutral-200/60 overflow-hidden">
      {/* 썸네일 영역 */}
      <div className="h-48 skeleton-shimmer"></div>

      {/* 콘텐츠 영역 */}
      <div className="p-4">
        {/* 파비콘 + 도메인 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 skeleton-shimmer rounded"></div>
          <div className="h-3 skeleton-shimmer rounded w-24"></div>
        </div>

        {/* 제목 */}
        <div className="h-5 skeleton-shimmer rounded-md w-3/4 mb-2"></div>

        {/* 설명 */}
        <div className="space-y-2 mb-4">
          <div className="h-3 skeleton-shimmer rounded-md w-full"></div>
          <div className="h-3 skeleton-shimmer rounded-md w-5/6"></div>
        </div>

        {/* 태그 */}
        <div className="flex gap-2 mb-3">
          <div className="h-6 skeleton-shimmer rounded-full w-16"></div>
          <div className="h-6 skeleton-shimmer rounded-full w-20"></div>
          <div className="h-6 skeleton-shimmer rounded-full w-14"></div>
        </div>

        {/* 하단 액션 */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
          <div className="h-4 skeleton-shimmer rounded w-20"></div>
          <div className="flex gap-2">
            <div className="w-7 h-7 skeleton-shimmer rounded-md"></div>
            <div className="w-7 h-7 skeleton-shimmer rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 여러 개의 스켈레톤을 렌더링하는 컴포넌트
export function BookmarkSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <BookmarkSkeleton key={index} />
      ))}
    </div>
  );
}

export default BookmarkSkeleton;