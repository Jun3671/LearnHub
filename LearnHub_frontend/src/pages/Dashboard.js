import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookmarkAPI, categoryAPI } from '../services/api';
import BookmarkCard from '../components/BookmarkCard';
import AddBookmarkModal from '../components/AddBookmarkModal';
import EditBookmarkModal from '../components/EditBookmarkModal';
import AddCategoryModal from '../components/AddCategoryModal';
import EditCategoryModal from '../components/EditCategoryModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import BookmarkDetailModal from '../components/BookmarkDetailModal';
import { BookmarkSkeletonGrid } from '../components/BookmarkSkeleton';

function Dashboard() {
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
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
  const [confirmModalType, setConfirmModalType] = useState('bookmark'); // 'bookmark' 또는 'category'
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
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
      console.log('Dashboard - 북마크 응답:', bookmarksRes.data); // 디버깅용
      console.log('Dashboard - 카테고리 응답:', categoriesRes.data); // 디버깅용
      setBookmarks(Array.isArray(bookmarksRes.data) ? bookmarksRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      console.log('Dashboard - 카테고리 설정 완료:', categoriesRes.data?.length || 0, '개'); // 디버깅용
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

  const handleDeleteBookmark = (id) => {
    // 삭제할 북마크 ID 저장하고 확인 모달 표시
    setDeletingBookmarkId(id);
    setConfirmModalType('bookmark');
    setShowConfirmModal(true);
  };

  const handleDeleteCategory = (id) => {
    // 삭제할 카테고리 ID 저장하고 확인 모달 표시
    setDeletingCategoryId(id);
    setConfirmModalType('category');
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    // 북마크 또는 카테고리 삭제 수행
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

  const filteredBookmarks = selectedCategory
    ? bookmarks.filter((b) => b.category?.id === selectedCategory)
    : bookmarks;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">LearnHub</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                + Add Bookmark
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-3 px-2">
                <h2 className="text-sm font-semibold text-gray-900">Categories</h2>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Add Category"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All Bookmarks
                  <span className="float-right text-gray-500">{bookmarks.length}</span>
                </button>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`group relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className="w-full text-left"
                    >
                      {category.name}
                      <span className="float-right text-gray-500 mr-12">
                        {bookmarks.filter((b) => b.category?.id === category.id).length}
                      </span>
                    </button>
                    {/* 수정 및 삭제 버튼 - hover 시 표시 */}
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(category);
                        }}
                        className="p-1 hover:bg-blue-100 rounded transition-all"
                        title="Edit Category"
                      >
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded transition-all"
                        title="Delete Category"
                      >
                        <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {loading ? (
              <BookmarkSkeletonGrid count={6} />
            ) : filteredBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first learning resource</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Your First Bookmark
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onDelete={handleDeleteBookmark}
                    onEdit={handleEditBookmark}
                    onViewDetail={handleViewDetail}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add Bookmark Modal */}
      <AddBookmarkModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchData();
          setToast({ isVisible: true, message: '북마크가 추가되었습니다.', type: 'success' });
        }}
      />

      {/* Edit Bookmark Modal */}
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

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={() => {
          fetchData();
          setToast({ isVisible: true, message: '카테고리가 추가되었습니다.', type: 'success' });
        }}
      />

      {/* Edit Category Modal */}
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

      {/* Delete Confirm Modal */}
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

      {/* Toast 알림 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Bookmark Detail Modal */}
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
