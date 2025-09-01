// src/services/api.js - Enhanced API Service with Axios
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    // Initialize token from localStorage
    this.token = localStorage.getItem('auth_token');
    
    // Set up request interceptor to add auth token
    this.setupRequestInterceptor();

  }

  setupRequestInterceptor() {
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token to request headers if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request in development
        if (import.meta.env.DEV) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params
          });
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
  }

  setupResponseInterceptor() {
    this.client.interceptors.response.use(
      (response) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        
        return response.data; // Return only the data portion
      },
      (error) => {
        // Handle different types of errors
        const { response, request, message } = error;

        if (response) {
          // Server responded with error status
          const { status, data } = response;
          
          console.error(`❌ API Error ${status}:`, data);

          // Handle token expiration (401 Unauthorized)
          if (status === 401) {
            this.handleTokenExpiration();
          }

          // Handle forbidden access (403 Forbidden)
          if (status === 403) {
            console.warn('🚫 Access denied');
          }

          // Handle validation errors (422 Unprocessable Entity)
          if (status === 422) {
            console.warn('⚠️ Validation errors:', data.errors);
          }

          // Return structured error response
          return Promise.reject({
            status,
            message: data?.message || 'An error occurred',
            errors: data?.errors || {},
            success: false
          });

        } else if (request) {
          // Network error or no response
          console.error('🌐 Network Error:', message);
          return Promise.reject({
            status: 0,
            message: 'Network error. Please check your connection.',
            success: false
          });

        } else {
          // Something else happened
          console.error('🔥 Unexpected Error:', message);
          return Promise.reject({
            status: 0,
            message: 'An unexpected error occurred',
            success: false
          });
        }
      }
    );
  }

  handleTokenExpiration() {
    console.warn('🔓 Token expired, logging out...');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.token = null;
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // ==================== AUTHENTICATION METHODS ====================

  async login(credentials) {
    try {
      const data = await this.client.post('/auth/login', credentials);
      
      if (data.success && data.token) {
        this.setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      return await this.client.post('/auth/register', userData);
    } catch (error) {
      throw error;
    }
  }

  async sendOTP(contactNumber) {
    try {
      return await this.client.post('/auth/send-otp', {
        contact_number: contactNumber
      });
    } catch (error) {
      throw error;
    }
  }

  async verifyOTP(contactNumber, otpCode) {
    try {
      const data = await this.client.post('/auth/verify-otp', {
        contact_number: contactNumber,
        otp_code: otpCode
      });
      
      if (data.success && data.token) {
        this.setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const data = await this.client.post('/auth/logout');
      this.clearToken();
      return data;
    } catch (error) {
      // Even if logout request fails, clear local tokens
      this.clearToken();
      throw error;
    }
  }

  async getMe() {
    try {
      return await this.client.get('/auth/me');
    } catch (error) {
      throw error;
    }
  }

  async refreshToken() {
    try {
      const data = await this.client.post('/auth/refresh');
      if (data.success && data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (error) {
      this.handleTokenExpiration();
      throw error;
    }
  }

  // ==================== DASHBOARD METHODS ====================

  async getPatientDashboard() {
    try {
      return await this.client.get('/patient/dashboard');
    } catch (error) {
      throw error;
    }
  }

  async getPatientAppointments(params = {}) {
    try {
      return await this.client.get('/patient/appointments', { params });
    } catch (error) {
      throw error;
    }
  }

  async getDoctorDashboard() {
    try {
      return await this.client.get('/doctor/dashboard');
    } catch (error) {
      throw error;
    }
  }

  async getDoctorPatients(params = {}) {
    try {
      return await this.client.get('/doctor/patients', { params });
    } catch (error) {
      throw error;
    }
  }

  async getAdminDashboard() {
    try {
      return await this.client.get('/admin/dashboard');
    } catch (error) {
      throw error;
    }
  }

  async getAdminUsers(params = {}) {
    try {
      return await this.client.get('/admin/users', { params });
    } catch (error) {
      throw error;
    }
  }

  async getAdminStatistics() {
    try {
      return await this.client.get('/admin/statistics');
    } catch (error) {
      throw error;
    }
  }

  // ==================== ADMIN METHODS ====================

  async createDoctor(doctorData) {
    try {
      return await this.client.post('/admin/create-doctor', doctorData);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      return await this.client.put(`/admin/users/${userId}`, userData);
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      return await this.client.delete(`/admin/users/${userId}`);
    } catch (error) {
      throw error;
    }
  }

  // ==================== FILE UPLOAD METHODS ====================

  async uploadFile(file, path = '/upload') {
    try {
      const formData = new FormData();
      formData.append('file', file);

      return await this.client.post(path, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`📤 Upload Progress: ${progress}%`);
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async downloadFile(fileUrl, filename) {
    try {
      const response = await this.client.get(fileUrl, {
        responseType: 'blob',
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'File downloaded successfully' };
    } catch (error) {
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  getCurrentUser() {
    try {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');
      if (token && user) {
        return JSON.parse(user);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }

  getAuthToken() {
    return localStorage.getItem('auth_token');
  }

  // Health check endpoint
  async healthCheck() {
    try {
      return await this.client.get('/health');
    } catch (error) {
      throw error;
    }
  }

  // Cancel request method
  cancelRequest(source) {
    if (source) {
      source.cancel('Request canceled');
    }
  }

  // Create cancel token for requests
  createCancelToken() {
    return axios.CancelToken.source();
  }

  // Generic GET method
  async get(url, config = {}) {
    try {
      return await this.client.get(url, config);
    } catch (error) {
      throw error;
    }
  }

  // Generic POST method
  async post(url, data = {}, config = {}) {
    try {
      return await this.client.post(url, data, config);
    } catch (error) {
      throw error;
    }
  }

  // Generic PUT method
  async put(url, data = {}, config = {}) {
    try {
      return await this.client.put(url, data, config);
    } catch (error) {
      throw error;
    }
  }

  // Generic DELETE method
  async delete(url, config = {}) {
    try {
      return await this.client.delete(url, config);
    } catch (error) {
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

export default apiService;

