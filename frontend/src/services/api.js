import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/register/', userData),
  login: (credentials) => api.post('/login/', credentials),
  searchUsers: (query) => api.get(`/search/?search=${query}`),
};

// Friends API calls
export const friendsAPI = {
  list: () => api.get('/friends/'),
  add: (friendId) => api.post('/friends/', { friend_id: friendId }),
};

// Bills API calls
export const billsAPI = {
  list: () => api.get('/bills/'),
  create: (billData) => api.post('/bills/', billData),
};

// Groups API calls
export const groupsAPI = {
  list: () => api.get('/groups/'),
  create: (groupData) => api.post('/groups/', groupData),
};

// Settlements API calls
export const settlementsAPI = {
  list: () => api.get('/settlements/'),
  create: (settlementData) => api.post('/settlements/', settlementData),
};

// Balances API calls
export const balancesAPI = {
  get: () => api.get('/balances/'),
};

// Analytics API calls
export const analyticsAPI = {
  get: () => api.get('/analytics/'),
  insights: () => api.get('/insights/'),
};

export default api;
