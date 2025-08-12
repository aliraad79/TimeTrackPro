import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  UserCreate,
  UserLogin,
  Location,
  LocationCreate,
  TimeEntry,
  ClockInRequest,
  ClockOutRequest,
  VacationRequest,
  VacationRequestCreate,
  AuthToken
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: UserLogin): Promise<AuthToken> {
    const response: AxiosResponse<AuthToken> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/users/me');
    return response.data;
  }

  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get('/users');
    return response.data;
  }

  async createUser(userData: UserCreate): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(`/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.api.delete(`/users/${userId}`);
  }

  // Location endpoints
  async getLocations(): Promise<Location[]> {
    const response: AxiosResponse<Location[]> = await this.api.get('/locations');
    return response.data;
  }

  async getAllLocations(): Promise<Location[]> {
    const response: AxiosResponse<Location[]> = await this.api.get('/locations/all');
    return response.data;
  }

  async createLocation(locationData: LocationCreate): Promise<Location> {
    const response: AxiosResponse<Location> = await this.api.post('/locations', locationData);
    return response.data;
  }

  async updateLocation(locationId: number, locationData: Partial<Location>): Promise<Location> {
    const response: AxiosResponse<Location> = await this.api.put(`/locations/${locationId}`, locationData);
    return response.data;
  }

  async deleteLocation(locationId: number): Promise<void> {
    await this.api.delete(`/locations/${locationId}`);
  }

  // Time Entry endpoints
  async clockIn(request: ClockInRequest): Promise<TimeEntry> {
    const response: AxiosResponse<TimeEntry> = await this.api.post('/time-entries/clock-in', request);
    return response.data;
  }

  async clockOut(request: ClockOutRequest): Promise<TimeEntry> {
    const response: AxiosResponse<TimeEntry> = await this.api.post('/time-entries/clock-out', request);
    return response.data;
  }

  async getMyTimeEntries(): Promise<TimeEntry[]> {
    const response: AxiosResponse<TimeEntry[]> = await this.api.get('/time-entries/my-entries');
    return response.data;
  }

  async getMyActiveEntry(): Promise<TimeEntry> {
    const response: AxiosResponse<TimeEntry> = await this.api.get('/time-entries/my-active');
    return response.data;
  }

  async getActiveEmployees(): Promise<TimeEntry[]> {
    const response: AxiosResponse<TimeEntry[]> = await this.api.get('/time-entries/active-employees');
    return response.data;
  }

  async updateTimeEntry(entryId: number, updateData: Partial<TimeEntry>): Promise<TimeEntry> {
    const response: AxiosResponse<TimeEntry> = await this.api.put(`/time-entries/${entryId}`, updateData);
    return response.data;
  }

  // Vacation Request endpoints
  async getMyVacationRequests(): Promise<VacationRequest[]> {
    const response: AxiosResponse<VacationRequest[]> = await this.api.get('/vacation-requests/my-requests');
    return response.data;
  }

  async getPendingRequests(): Promise<VacationRequest[]> {
    const response: AxiosResponse<VacationRequest[]> = await this.api.get('/vacation-requests/pending');
    return response.data;
  }

  async createVacationRequest(requestData: VacationRequestCreate): Promise<VacationRequest> {
    const response: AxiosResponse<VacationRequest> = await this.api.post('/vacation-requests', requestData);
    return response.data;
  }

  async approveVacationRequest(requestId: number): Promise<void> {
    await this.api.put(`/vacation-requests/${requestId}/approve`);
  }

  async rejectVacationRequest(requestId: number, rejectionReason: string): Promise<void> {
    await this.api.put(`/vacation-requests/${requestId}/reject`, { rejection_reason: rejectionReason });
  }

  async updateVacationRequest(requestId: number, updateData: Partial<VacationRequest>): Promise<VacationRequest> {
    const response: AxiosResponse<VacationRequest> = await this.api.put(`/vacation-requests/${requestId}`, updateData);
    return response.data;
  }

  async cancelVacationRequest(requestId: number): Promise<void> {
    await this.api.delete(`/vacation-requests/${requestId}`);
  }
}

export const apiService = new ApiService();
