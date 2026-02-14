import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookmarkAPI, categoryAPI, tagAPI } from '../services/api';
import BookmarkCard from '../components/BookmarkCard';
import AddBookmarkModal from '../components/AddBookmarkModal';
import EditBookmarkModal from '../components/EditBookmarkModal';
import AddCategoryModal from '../components/AddCategoryModal';
import EditCategoryModal from '../components/EditCategoryModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import BookmarkDetailModal from '../components/BookmarkDetailModal';
import ReviewDashboard from '../components/ReviewDashboard';
import { BookmarkSkeletonGrid } from '../components/BookmarkSkeleton';

function Dashboard() {
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingBookmarkId, setDeletingBookmarkId] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [confirmModalType, setConfirmModalType] = useState('bookmark');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('bookmarks'); // 'bookmarks' or 'review'
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookmarksRes, categoriesRes] = await Promise.all([
        bookmarkAPI.getAll(),
        categoryAPI.getAll(),
      ]);
      setBookmarks(Array.isArray(bookmarksRes.data) ? bookmarksRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);

      // 인기 태그 로드 시도
      try {
        const tagsRes = await tagAPI.getPopular();
        setPopularTags(Array.isArray(tagsRes.data) ? tagsRes.data : []);
      } catch {
        // 태그 API 실패 시 북마크에서 태그 추출
        const allTags = bookmarksRes.data?.flatMap(b => b.tags || []) || [];
        const tagCounts = allTags.reduce((acc, tag) => {
          acc[tag.name] = (acc[tag.name] || 0) + 1;
          return acc;
        }, {});
        const sortedTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name]) => ({ name }));
        setPopularTags(sortedTags);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // 스마트 검색: 제목, 설명, 태그 모두 검색
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const response = await bookmarkAPI.search(query);
        setBookmarks(response.data);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      fetchData();
    }
  };

  // 태그 필터 토글
  const toggleTagFilter = (tagName) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  // 필터링된 북마크 (카테고리 + 태그 + 검색)
  const filteredBookmarks = useMemo(() => {
    let result = bookmarks;

    // 카테고리 필터
    if (selectedCategory) {
      result = result.filter(b => b.category?.id === selectedCategory);
    }

    // 태그 필터 (선택된 모든 태그를 포함하는 북마크)
    if (selectedTags.length > 0) {
      result = result.filter(b =>
        selectedTags.every(selectedTag =>
          b.tags?.some(t => t.name.toLowerCase() === selectedTag.toLowerCase())
        )
      );
    }

    // 로컬 검색 필터 (태그로 시작하면 태그 검색)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (query.startsWith('#')) {
        const tagQuery = query.slice(1);
        result = result.filter(b =>
          b.tags?.some(t => t.name.toLowerCase().includes(tagQuery))
        );
      }
    }

    return result;
  }, [bookmarks, selectedCategory, selectedTags, searchQuery]);

  const handleDeleteBookmark = (id) => {
    setDeletingBookmarkId(id);
    setConfirmModalType('bookmark');
    setShowConfirmModal(true);
  };

  const handleDeleteCategory = (id) => {
    setDeletingCategoryId(id);
    setConfirmModalType('category');
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (confirmModalType === 'bookmark') {
      try {
        await bookmarkAPI.delete(deletingBookmarkId);
        setBookmarks(bookmarks.filter((b) => b.id !== deletingBookmarkId));
        setShowConfirmModal(false);
        setDeletingBookmarkId(null);
        setToast({ isVisible: true, message: '북마크가 삭제되었습니다.', type: 'success' });
      } catch (error) {
        console.error('Failed to delete bookmark:', error);
        setToast({ isVisible: true, message: '북마크 삭제에 실패했습니다.', type: 'error' });
      }
    } else if (confirmModalType === 'category') {
      try {
        await categoryAPI.delete(deletingCategoryId);
        setCategories(categories.filter((c) => c.id !== deletingCategoryId));
        if (selectedCategory === deletingCategoryId) {
          setSelectedCategory(null);
        }
        setShowConfirmModal(false);
        setDeletingCategoryId(null);
        setToast({ isVisible: true, message: '카테고리가 삭제되었습니다.', type: 'success' });
      } catch (error) {
        console.error('Failed to delete category:', error);
        setToast({ isVisible: true, message: '카테고리 삭제에 실패했습니다.', type: 'error' });
      }
    }
  };

  const handleEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    setShowEditModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowEditCategoryModal(true);
  };

  const handleViewDetail = (bookmark) => {
    setSelectedBookmark(bookmark);
    setShowDetailModal(true);
  };

  // 링크 복사 기능
  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setToast({ isVisible: true, message: '링크가 클립보드에 복사되었습니다!', type: 'success' });
    } catch (error) {
      setToast({ isVisible: true, message: '링크 복사에 실패했습니다.', type: 'error' });
    }
  };

  // 모든 태그 추출 (필터용)
  const allTags = useMemo(() => {
    const tagMap = new Map();
    bookmarks.forEach(b => {
      b.tags?.forEach(t => {
        if (!tagMap.has(t.name)) {
          tagMap.set(t.name, { ...t, count: 1 });
        } else {
          tagMap.get(t.name).count++;
        }
      });
    });
    return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
  }, [bookmarks]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-primary-600 italic">LearnHub</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => { setActiveTab('bookmarks'); setSelectedCategory(null); setSelectedTags([]); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'bookmarks' && !selectedCategory ? 'bg-primary-50 text-primary-600' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                🏠 홈
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'review' ? 'bg-primary-50 text-primary-600' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                📚 복습
              </button>
              {categories.slice(0, 3).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveTab('bookmarks'); setSelectedCategory(cat.id); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id ? 'bg-primary-50 text-primary-600' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              {categories.length > 3 && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  더보기 →
                </button>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium text-sm transition-all hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                북마크 추가
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-600 rounded-lg font-medium text-sm hover:bg-neutral-100 hover:border-neutral-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="bg-gradient-to-b from-primary-50/50 to-neutral-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center bg-white rounded-xl border-2 border-neutral-200 focus-within:border-primary-400 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="pl-5">
                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="궁금한 기술, 회사, 주제를 검색해보세요!"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 px-4 py-4 text-base outline-none bg-transparent placeholder-neutral-400"
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                className="m-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                검색
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <p className="text-center text-sm text-neutral-500 mt-3">
              #태그로 검색하거나 키워드를 입력하세요 (예: #Spring, #Error, FastAPI)
            </p>
          </div>
        </div>
      </section>

      {/* Tag Filter Section */}
      {allTags.length > 0 && (
        <section className="bg-white border-b border-neutral-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-sm font-medium text-neutral-500 whitespace-nowrap">인기 태그:</span>
              {allTags.slice(0, 12).map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => toggleTagFilter(tag.name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedTags.includes(tag.name)
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  #{tag.name}
                  {tag.count && <span className="ml-1 opacity-70">({tag.count})</span>}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-3 py-1.5 text-sm text-rose hover:bg-rose/10 rounded-full transition-colors"
                >
                  필터 초기화
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Categories Card */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    카테고리
                  </h3>
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="p-1.5 hover:bg-primary-50 text-primary-600 rounded-lg transition-all"
                    title="카테고리 추가"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                      selectedCategory === null
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>전체 보기</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === null ? 'bg-primary-200 text-primary-800' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {bookmarks.length}
                    </span>
                  </button>
                  {categories.map((category) => (
                    <div key={category.id} className="group relative">
                      <button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                          selectedCategory === category.id
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="truncate pr-8">{category.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedCategory === category.id ? 'bg-primary-200 text-primary-800' : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          {bookmarks.filter((b) => b.category?.id === category.id).length}
                        </span>
                      </button>
                      {/* Edit/Delete buttons on hover */}
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditCategory(category); }}
                          className="p-1 hover:bg-primary-100 text-neutral-400 hover:text-primary-600 rounded transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {!category.isDefault && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                            className="p-1 hover:bg-rose/10 text-neutral-400 hover:text-rose rounded transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-5 text-white shadow-lg">
                <h3 className="font-semibold mb-2">새 북마크 추가</h3>
                <p className="text-sm text-primary-100 mb-4">AI가 자동으로 제목, 설명, 태그를 추출해드립니다.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full py-2.5 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                >
                  + 북마크 추가
                </button>
              </div>
            </div>
          </aside>

          {/* Bookmark Grid */}
          <div className="flex-1">
            {activeTab === 'review' ? (
              <ReviewDashboard />
            ) : (
              <>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-800">
                      {selectedCategory
                        ? categories.find(c => c.id === selectedCategory)?.name
                        : '전체 북마크'}
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                      {filteredBookmarks.length}개의 북마크
                      {selectedTags.length > 0 && ` · ${selectedTags.map(t => '#' + t).join(', ')} 필터 적용`}
                    </p>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    카테고리
                  </button>
                </div>

                {loading ? (
              <BookmarkSkeletonGrid count={6} />
            ) : filteredBookmarks.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 rounded-full mb-6">
                  <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  {searchQuery || selectedTags.length > 0 ? '검색 결과가 없습니다' : '아직 북마크가 없습니다'}
                </h3>
                <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
                  {searchQuery || selectedTags.length > 0
                    ? '다른 키워드나 태그로 검색해보세요'
                    : '첫 번째 북마크를 추가하여 학습 라이브러리를 시작하세요'}
                </p>
                {!searchQuery && selectedTags.length === 0 && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    첫 번째 북마크 추가하기
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onDelete={handleDeleteBookmark}
                    onEdit={handleEditBookmark}
                    onViewDetail={handleViewDetail}
                    onCopyLink={handleCopyLink}
                  />
                ))}
              </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl animate-slide-in-right">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-semibold text-neutral-800">카테고리</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => { setSelectedCategory(null); setSidebarOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  selectedCategory === null ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                전체 보기 ({bookmarks.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => { setSelectedCategory(category.id); setSidebarOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {category.name} ({bookmarks.filter(b => b.category?.id === category.id).length})
                </button>
              ))}
              <button
                onClick={() => { setShowCategoryModal(true); setSidebarOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg font-medium text-primary-600 hover:bg-primary-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                카테고리 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center sm:hidden z-30"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modals */}
      <AddBookmarkModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchData();
          setToast({ isVisible: true, message: '북마크가 추가되었습니다.', type: 'success' });
        }}
      />

      <EditBookmarkModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingBookmark(null);
        }}
        onSuccess={() => {
          fetchData();
          setToast({ isVisible: true, message: '북마크가 수정되었습니다.', type: 'success' });
        }}
        bookmark={editingBookmark}
      />

      <AddCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={() => {
          fetchData();
          setToast({ isVisible: true, message: '카테고리가 추가되었습니다.', type: 'success' });
        }}
      />

      <EditCategoryModal
        isOpen={showEditCategoryModal}
        onClose={() => {
          setShowEditCategoryModal(false);
          setEditingCategory(null);
        }}
        onSuccess={() => {
          fetchData();
          setToast({ isVisible: true, message: '카테고리가 수정되었습니다.', type: 'success' });
        }}
        category={editingCategory}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setDeletingBookmarkId(null);
          setDeletingCategoryId(null);
        }}
        onConfirm={confirmDelete}
        title={confirmModalType === 'bookmark' ? '북마크 삭제' : '카테고리 삭제'}
        message={
          confirmModalType === 'bookmark'
            ? '정말로 이 북마크를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
            : '정말로 이 카테고리를 삭제하시겠습니까? 카테고리에 속한 북마크는 삭제되지 않습니다.'
        }
        confirmText="삭제"
        cancelText="취소"
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      <BookmarkDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedBookmark(null);
        }}
        bookmark={selectedBookmark}
      />
    </div>
  );
}

export default Dashboard;
