import React, { useState, useEffect, useRef } from 'react';
import { bookmarkAPI, categoryAPI } from '../services/api';

function AddBookmarkModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    categoryId: '',
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const tagInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      // Reset form when modal opens
      setFormData({ url: '', title: '', description: '', categoryId: '' });
      setTags([]);
      setTagInput('');
      setError('');
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const newTag = tagInput.trim().replace(/^#/, '');
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
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
      const { title, description, tags: suggestedTags, suggestedCategory } = response.data;

      setFormData((prev) => ({
        ...prev,
        title: title || prev.title,
        description: description || prev.description,
        categoryId: suggestedCategory || prev.categoryId,
      }));

      if (suggestedTags && suggestedTags.length > 0) {
        setTags(suggestedTags);
      }
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
      const requestData = {
        url: formData.url,
        title: formData.title,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        tags: tags,
      };

      await bookmarkAPI.create(requestData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || '북마크 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const suggestedTags = ['Spring', 'React', 'Error', 'Tutorial', 'AWS', 'Docker'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">새 북마크 추가</h2>
            <p className="text-primary-100 text-sm mt-0.5">AI가 자동으로 정보를 추출해드립니다</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="p-4 bg-rose/10 border border-rose/20 rounded-xl text-rose text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* URL with AI Analyze Button */}
          <div>
            <label htmlFor="url" className="block text-sm font-semibold text-neutral-700 mb-2">
              URL <span className="text-rose">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  id="url"
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  required
                  placeholder="https://example.com/article"
                  className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none bg-neutral-50 hover:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleAnalyzeUrl}
                disabled={analyzing || !formData.url}
                className="px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {analyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>분석 중</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>AI 분석</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-neutral-700 mb-2">
              제목 <span className="text-rose">*</span>
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="북마크 제목을 입력하세요"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none bg-neutral-50 hover:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-neutral-700 mb-2">
              설명
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="북마크에 대한 간단한 설명을 입력하세요"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none bg-neutral-50 hover:bg-white resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-semibold text-neutral-700 mb-2">
              카테고리 <span className="text-rose">*</span>
            </label>
            <div className="relative">
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none bg-neutral-50 hover:bg-white appearance-none cursor-pointer"
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              태그
            </label>
            <div
              className="tag-input-container cursor-text"
              onClick={() => tagInputRef.current?.focus()}
            >
              {tags.map((tag, index) => (
                <span key={index} className="tag-badge">
                  #{tag}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeTag(index); }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? "태그를 입력하세요 (Enter로 추가)" : ""}
                className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
              />
            </div>
            {/* Suggested Tags */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-neutral-500">추천:</span>
              {suggestedTags.filter(t => !tags.includes(t)).slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTags([...tags, tag])}
                  className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 font-semibold transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>추가 중...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>북마크 추가</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBookmarkModal;
