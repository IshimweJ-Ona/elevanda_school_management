/**
 * API Service - Centralized HTTP client for backend communication
 */

import { authStorage } from './authStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiError extends Error {
  status?: number;
  data?: any;
  code?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return authStorage.getToken();
  }

  private async request<T = any>(
    method: string,
    endpoint: string,
    body?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const options: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    };

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          authStorage.clear();
          window.dispatchEvent(new Event('auth:expired'));
        }
        const error: ApiError = new Error(
          errorData.message || `HTTP ${response.status}`
        );
        error.status = response.status;
        error.data = errorData;
        error.code = errorData.code;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Network error: ${(error as Error).message}`);
    }
  }

  // Auth endpoints
  async login(identifier: string, password: string) {
    const trimmedIdentifier = identifier.trim();
    const isEmail = trimmedIdentifier.includes('@');
    return this.request(
      'POST',
      '/api/auth/login',
      isEmail
        ? { email: trimmedIdentifier, password }
        : { phone_number: trimmedIdentifier, password },
      false
    );
  }

  // Device endpoints
  async getPendingDevices() {
    return this.request('GET', '/api/devices/pending');
  }

  async verifyDevice(deviceId: string) {
    return this.request('PATCH', `/api/devices/verify/${deviceId}`);
  }

  async denyDevice(deviceId: string) {
    return this.request('DELETE', `/api/devices/deny/${deviceId}`);
  }

  // User profile
  async getProfile() {
    return this.request('GET', '/api/user/profile');
  }

  async updateProfile(data: Partial<{
    name: string;
    email: string;
    phone_number: string;
    password: string;
  }>) {
    return this.request('PATCH', '/api/user/profile', data);
  }

  // Admin dashboard alias
  async getAdminDashboard() {
    return this.request('GET', '/api/admin/dashboard');
  }

  // Finance (admin only)
  async getInvoices(filters?: { studentId?: string; status?: string }) {
    const params = filters ? new URLSearchParams(filters as any).toString() : '';
    return this.request('GET', `/api/invoices${params ? '?' + params : ''}`);
  }

  async getPayments(filters?: { invoiceId?: string }) {
    const params = filters ? new URLSearchParams(filters as any).toString() : '';
    return this.request('GET', `/api/payments${params ? '?' + params : ''}`);
  }

  async recordPayment(data: { invoiceId: string; amount: number; method: string }) {
    return this.request('POST', '/api/payments', data);
  }

  // Admin user endpoints
  async getAllUsers() {
    return this.request('GET', '/api/admin/users');
  }

  async createStudent(data: {
    name: string;
    email: string;
    phone_number: string;
    password: string;
    classId?: string;
    admissionNumber?: string;
  }) {
    return this.request('POST', '/api/admin/create-student', data);
  }

  async createTeacher(data: {
    name: string;
    email: string;
    phone_number: string;
    password: string;
  }) {
    return this.request('POST', '/api/admin/create-teacher', data);
  }

  async createParent(data: {
    name: string;
    email: string;
    phone_number: string;
    password: string;
    studentIds?: string[];
  }) {
    return this.request('POST', '/api/admin/create-parent', data);
  }

  async updateUser(userId: string, data: any) {
    return this.request('PATCH', `/api/admin/user/${userId}`, data);
  }

  async deleteUser(userId: string) {
    return this.request('DELETE', `/api/admin/user/${userId}`);
  }

  async getDashboardStats() {
    return this.request('GET', '/api/admin/dashboard');
  }

  async getClasses() {
    return this.request('GET', '/api/admin/classes');
  }

  async createClass(data: {
    name: string;
    level?: string;
    academicYear?: string;
    teacherId?: string;
  }) {
    return this.request('POST', '/api/admin/classes', data);
  }

  // Invoice/Payment endpoints
  async createInvoice(data: {
    studentId: string;
    amount: number;
    dueDate: string;
  }) {
    return this.request('POST', '/api/invoices', data);
  }

  async payInvoice(data: {
    invoiceId: string;
    amount: number;
    method: string;
  }) {
    return this.request('POST', '/api/payments/pay', data);
  }

  // Student endpoints
  async getStudentDashboard() {
    return this.request('GET', '/api/student/dashboard');
  }

  // Parent endpoints
  async getParentDashboard() {
    return this.request('GET', '/api/parent/dashboard');
  }

  // Teacher endpoints
  async getTeacherDashboard() {
    return this.request('GET', '/api/teacher/dashboard');
  }

  async markAttendance(data: {
    studentId: string;
    classId: string;
    date: string;
    status: string;
  }) {
    return this.request('POST', '/api/teacher/attendance', data);
  }

  async gradeStudent(data: {
    examId: string;
    studentId: string;
    score: number;
    grade: string;
  }) {
    return this.request('POST', '/api/teacher/grade', data);
  }

  async createExam(data: {
    title: string;
    subject: string;
    classId: string;
  }) {
    return this.request('POST', '/api/teacher/exam', data);
  }

  async getAuditLogs() {
    return this.request('GET', '/api/admin/audit-logs');
  }

  async exportData() {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}/api/user/export`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return response.text();
  }
}

export const api = new ApiClient();
export type { ApiResponse, ApiError };
