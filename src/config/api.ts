export const API_BASE_URL = 'https://ti054c04.agussbn.my.id/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/login',
  LOGOUT: '/logout',
  REGISTER: '/register',
  ME: '/me',

  // Resources
  MASTERS: '/masters',
  KATEGORI_UKT: '/kategori-ukt',
  TAGIHAN: '/tagihan',
  PEMBAYARAN: '/pembayaran',
  NOTIFIKASI: '/notifikasi',
  LOG_STATUS_MAHASISWA: '/log-status-mahasiswa',
  LOG_PERUBAHAN_SEMESTER: '/log-perubahan-semester',
  USER: '/user',
};

// New API from neighboring group
export const STUDENT_API_BASE_URL = '/api-mahasiswa';
export const STUDENT_API_ENDPOINTS = {
  MAHASISWA: '/mahasiswa',
}; 