import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 seconds timeout for longer operations like sync
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    
    if (token) {
      // For development tokens, use them directly
      if (token.startsWith('dev_')) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Using development token for request:', config.url);
      } else {
        // For regular tokens, use Bearer prefix
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Using JWT token for request:', config.url);
      }
    } else {
      console.warn('No token found for request:', config.url);
    }
    
    // Log the final headers for debugging
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized error for:', error.config?.url);
      
      // Only redirect to login if not already there and not a connection abort
      if (error.code !== 'ECONNABORTED') {
        localStorage.removeItem('token');
        console.log('Redirecting to login due to 401 error');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout for:', error.config?.url);
    } else {
      console.error('API error:', error.message, 'for URL:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/token', 
      new URLSearchParams({
        'username': email,
        'password': password
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  }
};

// Summary API
export const summaryAPI = {
  getRecordSummary: async () => {
    const response = await api.get('/summary/record-summary');
    return response.data;
  }
};

// Profile API
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  },
  
  updateProfile: async (profileData: any) => {
    const response = await api.put('/profile/me', profileData);
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users/');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  create: async (userData: any) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },
  
  update: async (id: number, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  syncWithDolibarr: async (id: number) => {
    const response = await api.post(`/users/${id}/sync`);
    return response.data;
  },
  
  syncAllWithDolibarr: async () => {
    const response = await api.post('/users/sync-all');
    return response.data;
  }
};

// Publications API
export const publicationsAPI = {
  getAll: async () => {
    const response = await api.get('/publications/');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/publications/${id}`);
    return response.data;
  },
  
  create: async (publicationData: any) => {
    const response = await api.post('/publications/', publicationData);
    return response.data;
  },
  
  update: async (id: number, publicationData: any) => {
    const response = await api.put(`/publications/${id}`, publicationData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/publications/${id}`);
    return response.data;
  }
};

// Teaching API for Courses and SETs
export const teachingAPI = {
  getAllCourses: async (params?: { skip?: number; limit?: number }) => {
    // Use the correct parameter names expected by the backend
    const queryParams = new URLSearchParams();
    
    // Add parameters if they exist (with defaults as per backend)
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    console.log('Teaching courses query string:', queryString);
    
    // The correct endpoint is /teaching/ not /teaching/courses based on the router definition
    const response = await api.get(`/teaching${queryString}`);
    return response.data;
  },
  
  getCourseById: async (id: number) => {
    const response = await api.get(`/teaching/${id}`);
    return response.data;
  },
  
  createCourse: async (courseData: any) => {
    const response = await api.post('/teaching/', courseData);
    return response.data;
  },
  
  updateCourse: async (id: number, courseData: any) => {
    const response = await api.put(`/teaching/${id}`, courseData);
    return response.data;
  },
  
  deleteCourse: async (id: number) => {
    const response = await api.delete(`/teaching/${id}`);
    return response.data;
  },
  
  createMultipleCourses: async (formData: FormData) => {
    const response = await api.post('/teaching/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  uploadSupportingDocument: async (formData: FormData) => {
    const response = await api.post('/teaching/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Extension/Public Services API
export const extensionAPI = {
  getAll: async (params?: { skip?: number; limit?: number }) => {
    // Use the correct parameter names expected by the backend
    const queryParams = new URLSearchParams();
    
    // Add parameters if they exist (with defaults as per backend)
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    console.log('Extension services query string:', queryString);
    
    const response = await api.get(`/extension${queryString}`);
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/extension/${id}`);
    return response.data;
  },
  
  create: async (extensionData: any) => {
    const response = await api.post('/extension/', extensionData);
    return response.data;
  },
  
  update: async (id: number, extensionData: any) => {
    const response = await api.put(`/extension/${id}`, extensionData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/extension/${id}`);
    return response.data;
  },
  
  createMultiple: async (formData: FormData) => {
    const response = await api.post('/extension/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  uploadSupportingDocument: async (formData: FormData) => {
    const response = await api.post('/extension/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Research Activities API
export const researchAPI = {
  getAll: async (params?: { skip?: number; limit?: number }) => {
    // Use the correct parameter names expected by the backend
    const queryParams = new URLSearchParams();
    
    // Add parameters if they exist (with defaults as per backend)
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    console.log('Research publications query string:', queryString);
    
    const response = await api.get(`/publications${queryString}`);
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/publications/${id}`);
    return response.data;
  },
  
  create: async (publicationData: any) => {
    const response = await api.post('/publications/', publicationData);
    return response.data;
  },
  
  update: async (id: number, publicationData: any) => {
    const response = await api.put(`/publications/${id}`, publicationData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/publications/${id}`);
    return response.data;
  },
  
  createMultiple: async (formData: FormData) => {
    const response = await api.post('/publications/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  uploadSupportingDocument: async (formData: FormData) => {
    const response = await api.post('/publications/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Authorship API
export const authorshipAPI = {
  getAll: async (params?: { skip?: number; limit?: number }) => {
    // Use the correct parameter names expected by the backend
    const queryParams = new URLSearchParams();
    
    // Add parameters if they exist (with defaults as per backend)
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    console.log('Authorship query string:', queryString);
    
    const response = await api.get(`/authorship${queryString}`);
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/authorship/${id}`);
    return response.data;
  },
  
  create: async (authorshipData: any) => {
    const response = await api.post('/authorship', authorshipData);
    return response.data;
  },
  
  update: async (id: number, authorshipData: any) => {
    const response = await api.put(`/authorship/${id}`, authorshipData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/authorship/${id}`);
    return response.data;
  },
  
  createMultiple: async (formData: FormData) => {
    const response = await api.post('/authorship/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  uploadSupportingDocument: async (formData: FormData) => {
    const response = await api.post('/authorship/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Approval API
export const approvalAPI = {
  updateStatus(type: string, id: number, status: 'approved' | 'rejected', comments?: string) {
    return api.post(`/approval/${type}/${id}/approve`, { status, comments });
  },
  
  approve(type: string, id: number, comments?: string) {
    return this.updateStatus(type, id, 'approved', comments);
  },
  
  reject(type: string, id: number, comments?: string) {
    return this.updateStatus(type, id, 'rejected', comments);
  },
  
  getPending() {
    return api.get('/approval/pending');
  },
  
  getMySubmissions() {
    return api.get('/approval/my-submissions');
  },
  
  getApprovalPaths(department?: string, college?: string) {
    let queryString = '';
    if (department) queryString += `?department=${department}`;
    if (college) queryString += department ? `&college=${college}` : `?college=${college}`;
    
    return api.get(`/approval/paths${queryString}`);
  }
};

export default api;
