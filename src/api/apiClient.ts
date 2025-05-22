
import axios from 'axios';
import { toast } from "@/components/ui/sonner";
import { API_BASE_URL } from '@/config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with a status code that falls out of the range of 2xx
      const status = error.response.status;
      const message = error.response.data?.error || 'An error occurred';
      
      if (status === 401) {
        // Unauthorized - clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please log in again.');
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else {
        toast.error(message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request
      toast.error('An error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
