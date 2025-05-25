import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:9000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  registerUser: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  changePassword: async (data: { current_password: string, new_password: string }) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
};

// Faculty API
export const facultyApi = {
  getAll: async () => {
    const response = await api.get('/faculty');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/faculty/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/faculty', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/faculty/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/faculty/${id}`);
  },
  
  syncWithDolibarr: async (id: number) => {
    const response = await api.post(`/faculty/${id}/sync`);
    return response.data;
  },
};

// Publications API
export const publicationsApi = {
  getAll: async (facultyId?: number) => {
    const params = facultyId ? { faculty_id: facultyId } : {};
    const response = await api.get('/publications', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/publications/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/publications', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/publications/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/publications/${id}`);
  },
};

// Teaching API
export const teachingApi = {
  getAll: async (facultyId?: number) => {
    const params = facultyId ? { faculty_id: facultyId } : {};
    const response = await api.get('/teaching', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/teaching/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/teaching', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/teaching/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/teaching/${id}`);
  },
};

// Extension Services API
export const extensionApi = {
  getAll: async (facultyId?: number) => {
    const params = facultyId ? { faculty_id: facultyId } : {};
    const response = await api.get('/extension', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/extension/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/extension', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/extension/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/extension/${id}`);
  },
};

export default api;
