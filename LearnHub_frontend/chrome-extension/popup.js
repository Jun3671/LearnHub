const API_BASE = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', async () => {
  // --- DOM References ---
  const loginView = document.getElementById('login-view');
  const bookmarkView = document.getElementById('bookmark-view');
  const loginForm = document.getElementById('login-form');
  const bookmarkForm = document.getElementById('bookmark-form');
  const logoutBtn = document.getElementById('logout-btn');
  const loginError = document.getElementById('login-error');
  const bookmarkError = document.getElementById('bookmark-error');
  const bookmarkSuccess = document.getElementById('bookmark-success');
  const pageWarning = document.getElementById('page-warning');
  const loadingOverlay = document.getElementById('loading');
  const saveBtn = document.getElementById('save-btn');

  // --- Helper Functions ---

  function showLoading() {
    loadingOverlay.classList.remove('hidden');
  }

  function hideLoading() {
    loadingOverlay.classList.add('hidden');
  }

  function showError(el, message) {
    el.textContent = message;
    el.classList.remove('hidden');
  }

  function hideError(el) {
    el.classList.add('hidden');
  }

  function showView(view) {
    loginView.classList.add('hidden');
    bookmarkView.classList.add('hidden');
    view.classList.remove('hidden');
    logoutBtn.classList.toggle('hidden', view === loginView);
  }

  // --- Token Management (chrome.storage.local) ---

  async function getToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['learnhub_token'], (result) => {
        resolve(result.learnhub_token || null);
      });
    });
  }

  async function setToken(token) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ learnhub_token: token }, resolve);
    });
  }

  async function removeToken() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(['learnhub_token'], resolve);
    });
  }

  // --- API Helper ---

  async function apiRequest(endpoint, options = {}) {
    const token = await getToken();
    const headers = { ...options.headers };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    let response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    } catch {
      throw new Error('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.');
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`AUTH_EXPIRED`);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `요청 실패 (${response.status})`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  // --- Get Current Tab Info ---

  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return { url: tab.url, title: tab.title };
  }

  function isBookmarkableUrl(url) {
    return url && url.startsWith('http');
  }

  // --- Login ---

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(loginError);

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      showLoading();
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await setToken(data.token);
      await initBookmarkView();
      showView(bookmarkView);
    } catch (err) {
      showError(loginError, err.message === 'AUTH_EXPIRED'
        ? '인증 정보가 올바르지 않습니다.'
        : (err.message || '로그인에 실패했습니다.'));
    } finally {
      hideLoading();
    }
  });

  // --- Logout ---

  logoutBtn.addEventListener('click', async () => {
    await removeToken();
    showView(loginView);
    loginForm.reset();
    bookmarkForm.reset();
  });

  // --- Init Bookmark View ---

  async function initBookmarkView() {
    const tab = await getCurrentTab();

    document.getElementById('bm-url').value = tab.url || '';
    document.getElementById('bm-title').value = tab.title || '';
    document.getElementById('bm-description').value = '';
    document.getElementById('bm-tags').value = '';
    hideError(bookmarkError);
    bookmarkSuccess.classList.add('hidden');
    saveBtn.disabled = false;

    // Check if page is bookmarkable
    if (!isBookmarkableUrl(tab.url)) {
      pageWarning.classList.remove('hidden');
      bookmarkForm.classList.add('hidden');
      return;
    }

    pageWarning.classList.add('hidden');
    bookmarkForm.classList.remove('hidden');

    // Fetch categories
    try {
      const categories = await apiRequest('/categories');
      const select = document.getElementById('bm-category');
      select.innerHTML = '<option value="">카테고리를 선택하세요</option>';

      if (Array.isArray(categories)) {
        categories.forEach((cat) => {
          const option = document.createElement('option');
          option.value = cat.id;
          option.textContent = cat.name;
          select.appendChild(option);
        });
      }
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') {
        await removeToken();
        showView(loginView);
        showError(loginError, '세션이 만료되었습니다. 다시 로그인해주세요.');
      }
    }
  }

  // --- Save Bookmark ---

  bookmarkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(bookmarkError);
    bookmarkSuccess.classList.add('hidden');

    const categoryId = document.getElementById('bm-category').value;
    const url = document.getElementById('bm-url').value;
    const title = document.getElementById('bm-title').value;
    const description = document.getElementById('bm-description').value;
    const tagsRaw = document.getElementById('bm-tags').value;

    if (!categoryId) {
      showError(bookmarkError, '카테고리를 선택해주세요.');
      return;
    }

    // Build query parameters (matches frontend api.js pattern)
    const params = new URLSearchParams();
    params.append('categoryId', categoryId);
    params.append('url', url);
    if (title) params.append('title', title);
    if (description) params.append('description', description);

    if (tagsRaw.trim()) {
      const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
      tags.forEach((tag) => params.append('tags', tag));
    }

    try {
      showLoading();
      const token = await getToken();

      let response;
      try {
        response = await fetch(`${API_BASE}/bookmarks?${params.toString()}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        throw new Error('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.');
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await removeToken();
          showView(loginView);
          showError(loginError, '세션이 만료되었습니다. 다시 로그인해주세요.');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `저장 실패 (${response.status})`);
      }

      bookmarkSuccess.classList.remove('hidden');
      saveBtn.disabled = true;
      setTimeout(() => window.close(), 1500);
    } catch (err) {
      showError(bookmarkError, err.message || '북마크 저장에 실패했습니다.');
    } finally {
      hideLoading();
    }
  });

  // --- Initialization ---

  const token = await getToken();
  if (token) {
    showView(bookmarkView);
    await initBookmarkView();
  } else {
    showView(loginView);
  }
});
