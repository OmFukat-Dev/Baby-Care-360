// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include authorization token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<T>(url, config);
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.patch<T>(url, data, config);
  }
}

export const apiClient = new ApiClient();

// Auth endpoints
export const authApi = {
  register: (data: { email: string; first_name: string; last_name: string; password: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
  updateProfile: (data: Partial<any>) =>
    apiClient.put('/auth/me', data),
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
};

// Baby endpoints
export const babyApi = {
  create: (data: any) =>
    apiClient.post('/babies', data),
  getAll: () =>
    apiClient.get('/babies'),
  getById: (id: number) =>
    apiClient.get(`/babies/${id}`),
  update: (id: number, data: any) =>
    apiClient.put(`/babies/${id}`, data),
  delete: (id: number) =>
    apiClient.delete(`/babies/${id}`),
  getSuggestions: (id: number) =>
    apiClient.get(`/babies/${id}/suggestions`),
};

// Vaccination endpoints
export const vaccinationApi = {
  getAll: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/vaccinations`),
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/vaccinations/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/vaccinations`, data),
  update: (babyId: number, id: number, data: any) =>
    apiClient.put(`/babies/${babyId}/vaccinations/${id}`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/vaccinations/${id}`),
};

// Polio endpoints
export const polioApi = {
  getAll: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/polio`),
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/polio/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/polio`, data),
  update: (babyId: number, id: number, data: any) =>
    apiClient.put(`/babies/${babyId}/polio/${id}`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/polio/${id}`),
};

// Checkup endpoints
export const checkupApi = {
  getAll: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/checkups`),
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/checkups/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/checkups`, data),
  update: (babyId: number, id: number, data: any) =>
    apiClient.put(`/babies/${babyId}/checkups/${id}`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/checkups/${id}`),
};

// Growth measurement endpoints (Phase 4)
export const growthApi = {
  getAll: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/growth`),
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/growth/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/growth`, data),
  update: (babyId: number, id: number, data: any) =>
    apiClient.put(`/babies/${babyId}/growth/${id}`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/growth/${id}`),
};

// Feeding record endpoints (Phase 5)
export const feedingApi = {
  getAll: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/feeding`),
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/feeding/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/feeding`, data),
  update: (babyId: number, id: number, data: any) =>
    apiClient.put(`/babies/${babyId}/feeding/${id}`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/feeding/${id}`),
};

// Food introduction endpoints (Phase 5)
export const foodApi = {
  getAll: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/foods`),
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/foods/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/foods`, data),
  update: (babyId: number, id: number, data: any) =>
    apiClient.put(`/babies/${babyId}/foods/${id}`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/foods/${id}`),
};

// Meal plan endpoints (Phase 5)
export const mealPlanApi = {
  getAll: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/meal-plans`),
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/meal-plans/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/meal-plans`, data),
  update: (babyId: number, id: number, data: any) =>
    apiClient.put(`/babies/${babyId}/meal-plans/${id}`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/meal-plans/${id}`),
};

// Milestone endpoints (Phase 6)
export const milestoneApi = {
  getAll: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/milestones`),
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/milestones/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/milestones`, data),
  update: (babyId: number, id: number, data: any) =>
    apiClient.put(`/babies/${babyId}/milestones/${id}`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/milestones/${id}`),
};

// Sleep record endpoints (Phase 6)
export const sleepApi = {
  getAll: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/sleep`),
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/sleep/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/sleep`, data),
  update: (babyId: number, id: number, data: any) =>
    apiClient.put(`/babies/${babyId}/sleep/${id}`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/sleep/${id}`),
};

// Medicine record endpoints (Phase 6)
export const medicineApi = {
  getAll: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/medicines`),
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/medicines/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/medicines`, data),
  update: (babyId: number, id: number, data: any) =>
    apiClient.put(`/babies/${babyId}/medicines/${id}`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/medicines/${id}`),
};

// Health document endpoints (Phase 7)
export const documentApi = {
  getAll: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/documents`),
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/documents/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/documents`, data),
  update: (babyId: number, id: number, data: any) =>
    apiClient.put(`/babies/${babyId}/documents/${id}`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/documents/${id}`),
};

// Reminder endpoints (Phase 7)
export const reminderApi = {
  getAll: (babyId: number, status?: string) => {
    const url = status 
      ? `/babies/${babyId}/reminders?status=${status}` 
      : `/babies/${babyId}/reminders`;
    return apiClient.get(url);
  },
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/reminders/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/reminders`, data),
  update: (babyId: number, id: number, data: any) =>
    apiClient.put(`/babies/${babyId}/reminders/${id}`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/reminders/${id}`),
};

// Health timeline endpoint (Phase 7)
export const timelineApi = {
  getTimeline: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/timeline`),
};

// Health metrics endpoints (Phase 8)
export const metricsApi = {
  getCurrent: (babyId: number) =>
    apiClient.get(`/babies/${babyId}/metrics`),
  getHistory: (babyId: number, days: number = 30) =>
    apiClient.get(`/babies/${babyId}/metrics/history?days=${days}`),
};

// Report endpoints (Phase 8)
export const reportApi = {
  getAll: (babyId: number, type?: string) => {
    const url = type 
      ? `/babies/${babyId}/reports?type=${type}` 
      : `/babies/${babyId}/reports`;
    return apiClient.get(url);
  },
  getById: (babyId: number, id: number) =>
    apiClient.get(`/babies/${babyId}/reports/${id}`),
  create: (babyId: number, data: any) =>
    apiClient.post(`/babies/${babyId}/reports`, data),
  delete: (babyId: number, id: number) =>
    apiClient.delete(`/babies/${babyId}/reports/${id}`),
};

// Statistics endpoint (Phase 8)
export const statisticsApi = {
  getStats: (babyId: number, days: number = 90) =>
    apiClient.get(`/babies/${babyId}/statistics?days=${days}`),
};

export default apiClient;
