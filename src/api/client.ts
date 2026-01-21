import axios from 'axios';
import type { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: При подключении реального API необходимо реализовать аутентификацию

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as { message?: string })?.message || error.message;
      
      if (status === 401) {
        // перенаправить на страницу входа
      }
      
      return Promise.reject(new Error(message));
    }
    
    if (error.request) {
      return Promise.reject(new Error('Нет ответа от сервера'));
    }
    
    return Promise.reject(error);
  }
);

