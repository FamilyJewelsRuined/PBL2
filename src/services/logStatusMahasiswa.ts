import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const logStatusMahasiswaService = {
  async getAll() {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.LOG_STATUS_MAHASISWA}`, {
      headers: getAuthHeaders(),
    });
    if (Array.isArray(response.data.data)) return response.data.data;
    if (Array.isArray(response.data.data?.data)) return response.data.data.data;
    return [];
  },

  async getById(id: number | string) {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.LOG_STATUS_MAHASISWA}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  async create(data: any) {
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.LOG_STATUS_MAHASISWA}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async update(id: number | string, data: any) {
    const response = await axios.put(`${API_BASE_URL}${API_ENDPOINTS.LOG_STATUS_MAHASISWA}/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async remove(id: number | string) {
    const response = await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.LOG_STATUS_MAHASISWA}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

export default logStatusMahasiswaService; 