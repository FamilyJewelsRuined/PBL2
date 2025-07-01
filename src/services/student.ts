import axios from 'axios';
import { STUDENT_API_BASE_URL, STUDENT_API_ENDPOINTS } from '../config/api';

const STUDENT_API_URL = '/api-mahasiswa';

export interface Student {
  nim: string;
  nama: string;
  email: string;
  no_hp: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface StudentResponse {
  message: string;
  data: Student[];
}

export interface CreateStudentRequest {
  nim: string;
  nama: string;
  email: string;
  no_hp: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  image?: string;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  nim: string;
}

function formatTanggal(tgl: string): string {
  if (!tgl) return '';
  // Jika input sudah dalam format ISO (ada 'T')
  if (tgl.includes('T')) {
    return tgl.split('T')[0];
  }
  // Jika input DD/MM/YYYY
  if (tgl.includes('/')) {
    const [day, month, year] = tgl.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return tgl;
}

// Get all students
export const getStudents = async (): Promise<Student[]> => {
  try {
    const response = await axios.get<StudentResponse>(STUDENT_API_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Get student by NIM
export const getStudentByNim = async (nim: string): Promise<Student> => {
  try {
    const response = await axios.get<StudentResponse>(`${STUDENT_API_URL}/${nim}`);
    return response.data.data[0];
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error;
  }
};

// Create new student
export const createStudent = async (studentData: CreateStudentRequest): Promise<{ message: string }> => {
  try {
    const payload = {
      nim: studentData.nim,
      name: studentData.nama,
      email: studentData.email,
      no_hp: studentData.no_hp,
      tempat_lahir: studentData.tempat_lahir,
      tanggal_lahir: formatTanggal(studentData.tanggal_lahir),
      alamat: studentData.alamat,
      image: studentData.image || '',
    };
    const response = await axios.post('/api-tambah-mahasiswa', payload);
    return { message: response.data.message };
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

// Update student
export const updateStudent = async (nim: string, studentData: UpdateStudentRequest): Promise<Student> => {
  try {
    const response = await axios.put<StudentResponse>(`${STUDENT_API_URL}/${nim}`, studentData);
    return response.data.data[0];
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

// Delete student
export const deleteStudent = async (nim: string): Promise<void> => {
  try {
    await axios.delete(`${STUDENT_API_URL}/${nim}`);
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
}; 