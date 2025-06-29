import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return { Authorization: token ? `Bearer ${token}` : '' };
}

const paymentService = {
  async getAll() {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.PEMBAYARAN}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data?.data || [];
  },

  async getById(id: number | string) {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.PEMBAYARAN}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  async create(paymentData: any) {
    const formData = new FormData();
    Object.keys(paymentData).forEach((key) => {
      formData.append(key, paymentData[key]);
    });
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.PEMBAYARAN}`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(id: number | string, paymentData: any) {
    let headers: Record<string, string> = getAuthHeaders();
    let data = paymentData;
    if (paymentData instanceof FormData) {
      headers = { ...headers, 'Content-Type': 'multipart/form-data' };
    }
    const response = await axios.put(`${API_BASE_URL}${API_ENDPOINTS.PEMBAYARAN}/${id}`, data, {
      headers,
    });
    return response.data;
  },

  async remove(id: number | string) {
    const response = await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.PEMBAYARAN}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

export default paymentService; 