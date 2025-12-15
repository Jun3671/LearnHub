import React, { useState, useEffect } from 'react';
import { bookmarkAPI, categoryAPI } from '../services/api';

function EditBookmarkModal({ isOpen, onClose, onSuccess, bookmark }) {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    categoryId: '',
    tags: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && bookmark) {
      // 북마크 데이터로 폼 초기화
      setFormData({
        url: bookmark.url || '',
        title: bookmark.title || '',
        description: bookmark.description || '',
        categoryId: bookmark.category?.id || '',
        tags: bookmark.tags?.map((tag) => tag.name).join(', ') || '',
      });
      fetchCategories();
    }
  }, [isOpen, bookmark]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      // 응답이 배열인지 확인하고 설정
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]); // 에러 발생 시 빈 배열로 설정
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAnalyzeUrl = async () => {
    if (!formData.url) {
      setError('URL을 먼저 입력해주세요.');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const response = await bookmarkAPI.analyzeUrl(formData.url);
      const { title, description, tags, suggestedCategory } = response.data;

      // AI 분석 결과를 폼에 자동 채우기
      setFormData((prev) => ({
        ...prev,
        title: title || prev.title,
        description: description || prev.description,
        tags: tags ? tags.join(', ') : prev.tags,
        categoryId: suggestedCategory || prev.categoryId,
      }));
    } catch (err) {
      console.error('AI 분석 실패:', err);
      setError(err.response?.data?.message || 'AI 분석에 실패했습니다. 수동으로 입력해주세요.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 태그를 배열로 변환
      const tagArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const requestData = {
        url: formData.url,
        title: formData.title,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        tags: tagArray,
      };

      await bookmarkAPI.update(bookmark.id, requestData);

      // 성공 시 모달 닫기
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || '북마크 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !bookmark) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-semibold text-gray-900">북마크 수정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              URL <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="url"
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                placeholder="https://example.com/article"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
              <button
                type="button"
                onClick={handleAnalyzeUrl}
                disabled={analyzing || !formData.url}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {analyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    분석 중...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI 분석
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">AI가 자동으로 제목, 설명, 태그를 추출합니다</p>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="북마크 제목을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="북마크에 대한 간단한 설명을 입력하세요 (선택사항)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              태그
            </label>
            <input
              id="tags"
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="React, Spring, AWS (쉼표로 구분)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">쉼표(,)로 구분하여 여러 태그를 입력할 수 있습니다</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookmarkModal;
