import axios from 'axios';

/**
 * Custom event dispatched when the refresh-token flow fails irrecoverably.
 * The AuthContext listens for it and performs a clean logout via React state
 * (so we never end up with sessionStorage cleared but AuthContext stale).
 */
export const AUTH_FORCED_LOGOUT_EVENT = 'auth:forced-logout';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT access token to every request ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Single-flight refresh ───────────────────────────────────────────────────
// If multiple requests 401 in parallel, we want exactly one refresh call —
// the rest queue on its promise and resolve once a new access token is in.
let refreshInflight = null;

function performRefresh() {
  const refreshToken = sessionStorage.getItem('refreshToken');
  if (!refreshToken) return Promise.reject(new Error('no refresh token'));

  // Bypass our own api instance so the request itself can't trigger this
  // interceptor recursively.
  return axios
    .post('/api/v1/users/refresh-token/', { refresh_token: refreshToken })
    .then((res) => {
      if (!res.data?.success) throw new Error(res.data?.msg || 'refresh failed');
      const { access_token, refresh_token } = res.data.data;
      sessionStorage.setItem('token', access_token);
      sessionStorage.setItem('refreshToken', refresh_token);
      return access_token;
    });
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      if (!refreshInflight) {
        refreshInflight = performRefresh().finally(() => {
          // Clear shortly after so a fresh 401 can trigger another attempt
          // (e.g. after a long network outage when the second token also expires).
          setTimeout(() => { refreshInflight = null; }, 0);
        });
      }
      const newAccessToken = await refreshInflight;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed — broadcast a forced-logout event. The AuthContext owns
      // the actual cleanup + navigation so we don't end up with stale state.
      window.dispatchEvent(new CustomEvent(AUTH_FORCED_LOGOUT_EVENT));
      return Promise.reject(refreshError);
    }
  }
);

export default api;
