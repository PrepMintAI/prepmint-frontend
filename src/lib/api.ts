// src/lib/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';
import { logger } from '@/lib/logger';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// NOTE: No need to add Authorization header manually!
// The __session cookie is httpOnly and automatically sent by the browser with every request.
// The server can read it from the cookies, but client-side JavaScript cannot access it.
api.interceptors.request.use((config) => {
  // The session cookie is included automatically due to withCredentials: true
  return config;
});

// Handle errors consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error('API Error:', error.response?.data || error.message);
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

export const awardBadge = async (userId: string, badgeId: string) => {
  return api.post('/gamify/badges', { userId, badgeId });
};

export const getUserBadges = async (userId: string) => {
  return api.get(`/gamify/badges/${userId}`);
};
