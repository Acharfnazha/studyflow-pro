import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (d: any) => api.post('/auth/register', d),
  login: (d: any) => api.post('/auth/login', d),
  logout: (t: string) => api.post('/auth/logout', { refreshToken: t }),
  me: () => api.get('/auth/me'),
  updateProfile: (d: any) => api.put('/auth/profile', d),
  changePassword: (d: any) => api.put('/auth/change-password', d),
};

export const coursesApi = {
  getAll: () => api.get('/courses'),
  getOne: (id: string) => api.get(`/courses/${id}`),
  create: (d: any) => api.post('/courses', d),
  update: (id: string, d: any) => api.put(`/courses/${id}`, d),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

export const tasksApi = {
  getAll: (p?: any) => api.get('/tasks', { params: p }),
  getOne: (id: string) => api.get(`/tasks/${id}`),
  getToday: () => api.get('/tasks/today'),
  getOverdue: () => api.get('/tasks/overdue'),
  create: (d: any) => api.post('/tasks', d),
  update: (id: string, d: any) => api.put(`/tasks/${id}`, d),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

export const notesApi = {
  getAll: (p?: any) => api.get('/notes', { params: p }),
  getOne: (id: string) => api.get(`/notes/${id}`),
  create: (d: any) => api.post('/notes', d),
  update: (id: string, d: any) => api.put(`/notes/${id}`, d),
  delete: (id: string) => api.delete(`/notes/${id}`),
};

export const sessionsApi = {
  getAll: () => api.get('/sessions'),
  create: (d: any) => api.post('/sessions', d),
  delete: (id: string) => api.delete(`/sessions/${id}`),
};

export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  weekly: () => api.get('/analytics/weekly'),
  courses: () => api.get('/analytics/courses'),
  recommendations: () => api.get('/analytics/recommendations'),
};
