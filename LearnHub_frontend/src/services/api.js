import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, role) => api.post('/auth/register', { email, password, role }),
};

// Bookmark API
// JWT 토큰에서 자동으로 사용자 정보를 추출하므로 userId 불필요
export const bookmarkAPI = {
  getAll: () => api.get('/bookmarks'), // 현재 로그인한 사용자의 북마크 조회
  getById: (id) => api.get(`/bookmarks/${id}`),
  create: (data) => {
    // @RequestParam 형식으로 쿼리 파라미터 전송
    const params = new URLSearchParams();
    params.append('categoryId', data.categoryId);
    params.append('url', data.url);
    if (data.title) params.append('title', data.title);
    if (data.description) params.append('description', data.description);
    if (data.thumbnailUrl) params.append('thumbnailUrl', data.thumbnailUrl);
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => params.append('tags', tag));
    }
    return api.post(`/bookmarks?${params.toString()}`);
  },
  update: (id, data) => {
    const params = new URLSearchParams();
    if (data.url) params.append('url', data.url);
    if (data.title) params.append('title', data.title);
    if (data.description) params.append('description', data.description);
    if (data.thumbnailUrl) params.append('thumbnailUrl', data.thumbnailUrl);
    if (data.categoryId) params.append('categoryId', data.categoryId);
    if (data.reanalyze) params.append('reanalyze', data.reanalyze);
    return api.put(`/bookmarks/${id}?${params.toString()}`);
  },
  delete: (id) => api.delete(`/bookmarks/${id}`),
  search: (keyword) => api.get(`/bookmarks/search?keyword=${encodeURIComponent(keyword)}`),
  // AI 분석 API - URL 콘텐츠를 AI로 분석하여 제목, 설명, 태그 추출
  analyzeUrl: (url) => api.post('/bookmarks/analyze', { url }),
};

// Category API
// JWT 토큰에서 자동으로 사용자 정보를 추출하므로 userId 불필요
export const categoryAPI = {
  getAll: () => api.get('/categories'), // 현재 로그인한 사용자의 카테고리 조회
  getById: (id) => api.get(`/categories/${id}`),
  create: (name) => api.post(`/categories?name=${encodeURIComponent(name)}`), // JWT에서 자동으로 userId 추출
  update: (id, name) => api.put(`/categories/${id}?name=${encodeURIComponent(name)}`),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Tag API
export const tagAPI = {
  getAll: () => api.get('/tags'),
  getPopular: () => api.get('/tags/popular'),
};

export default api;
