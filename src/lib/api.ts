// src/lib/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests automatically
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== Helper functions for common endpoints =====

// Evaluation / Upload
export const uploadForEvaluation = async (formData: FormData) => {
  return api.post('/evaluate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getEvaluationStatus = async (jobId: string) => {
  return api.get(`/evaluate/${jobId}/status`);
};

// User role management
export const getUserRole = async () => {
  return api.get('/role');
};

export const updateUserRole = async (role: string) => {
  return api.post('/role', { role });
};

// Gamification
export const awardXp = async (userId: string, amount: number, reason: string) => {
  return api.post('/gamify/xp', { userId, amount, reason });
};

export const getUserBadges = async (userId: string) => {
  return api.get(`/gamify/badges/${userId}`);
};
