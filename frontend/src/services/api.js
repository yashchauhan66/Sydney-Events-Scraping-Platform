import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  getGoogleAuthUrl: () => `${API_BASE_URL}/auth/google`,
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

export const eventsAPI = {
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },
  
  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  
  importEvent: async (eventId, importNotes) => {
    const response = await api.post(`/events/${eventId}/import`, { importNotes });
    return response.data;
  },
  
  deleteEvent: async (eventId) => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  },
  
  getDashboardEvents: async (params = {}) => {
    const response = await api.get('/events/dashboard/all', { params });
    return response.data;
  },
  
  getEventStats: async () => {
    const response = await api.get('/events/dashboard/stats');
    return response.data;
  }
};

export const subscriptionsAPI = {
  createSubscription: async (data) => {
    const response = await api.post('/subscriptions', data);
    return response.data;
  },
  
  getSubscriptionsByEmail: async (email) => {
    const response = await api.get(`/subscriptions/email/${email}`);
    return response.data;
  },
  
  getSubscriptionsByEvent: async (eventId) => {
    const response = await api.get(`/subscriptions/event/${eventId}`);
    return response.data;
  }
};

export default api;
