import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../services/api';

function ReviewDashboard() {
  const [todayReviews, setTodayReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    fetchReviewData();
  }, []);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const [reviewsRes, statsRes] = await Promise.all([
        reviewAPI.getTodayReviews(),
        reviewAPI.getReviewStats(),
      ]);

      setTodayReviews(reviewsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('복습 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReview = async (bookmarkId) => {
    try {
      setCompleting(bookmarkId);
      await reviewAPI.completeReview(bookmarkId);

      // 목록에서 제거
      setTodayReviews(prev => prev.filter(r => r.bookmark.id !== bookmarkId));

      // 통계 다시 불러오기
      const statsRes = await reviewAPI.getReviewStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error('복습 완료 처리 실패:', error);
      alert('복습 완료 처리에 실패했습니다.');
    } finally {
      setCompleting(null);
    }
  };

  const getNextIntervalText = (reviewCount) => {
    const intervals = [1, 3, 7, 14, 30];
    const nextInterval = intervals[reviewCount] || 30;
    return `${nextInterval}일`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-neutral-500">복습 데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 복습 통계 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label="오늘 복습할 자료"
            value={stats.todayDue}
            color="primary"
          />
          <StatCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label="이번 주 복습 완료"
            value={stats.weekCompleted}
            color="green"
          />
          <StatCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            label="연속 복습"
            value={`${stats.consecutiveDays}일`}
            color="orange"
            suffix="🔥"
          />
          <StatCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
            label="총 복습 완료"
            value={stats.totalCompleted}
            color="purple"
          />
        </div>
      )}

      {/* 오늘 복습할 자료 */}
      <div className="bg-white rounded-2xl shadow-md border border-neutral-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">오늘 복습할 자료</h2>
                <p className="text-sm text-primary-100">에빙하우스 망각곡선 기반 추천</p>
              </div>
            </div>
            <div className="text-white text-right">
              <div className="text-3xl font-bold">{todayReviews.length}</div>
              <div className="text-sm text-primary-100">개</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {todayReviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">완벽합니다! 🎉</h3>
              <p className="text-neutral-500">오늘 복습할 자료가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayReviews.map((review) => (
                <ReviewCard
                  key={review.bookmark.id}
                  review={review}
                  onComplete={handleCompleteReview}
                  completing={completing === review.bookmark.id}
                  getNextInterval={getNextIntervalText}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, suffix }) {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        {suffix && <span className="text-2xl">{suffix}</span>}
      </div>
      <div className="text-2xl font-bold text-neutral-800">{value}</div>
      <div className="text-sm text-neutral-500 mt-1">{label}</div>
    </div>
  );
}

function ReviewCard({ review, onComplete, completing, getNextInterval }) {
  const { bookmark, reviewCount, nextReviewAt, lastReviewedAt } = review;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="group border border-neutral-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-neutral-800 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {bookmark.title || bookmark.metaTitle || 'Untitled'}
            </h3>
          </div>

          {bookmark.description && (
            <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
              {bookmark.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{reviewCount}회 복습 완료</span>
            </div>
            {lastReviewedAt && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>마지막 복습: {formatDate(lastReviewedAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-primary-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>다음 복습: {getNextInterval(reviewCount)} 후</span>
            </div>
          </div>

          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {bookmark.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors whitespace-nowrap"
          >
            원본 보기
          </a>
          <button
            onClick={() => onComplete(bookmark.id)}
            disabled={completing}
            className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {completing ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                처리 중
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                복습 완료
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewDashboard;
