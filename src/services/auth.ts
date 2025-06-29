import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const authService = {
  async login(email: string, password: string) {
    try {
      console.log('Making login request to:', `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`);
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        email,
        password,
      });
      console.log('Login response:', response.data);

      // Try to find the token in different places
      const token =
        response.data.token ||
        response.data.data?.token ||
        response.data.data?.access_token;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('isAuthenticated', 'true');
        return response.data;
      }
      throw new Error('No token received in response');
    } catch (error: any) {
      console.error('Login error in auth service:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  async logout() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
    }
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ME}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true' && !!localStorage.getItem('token');
  }
};

export default authService; 