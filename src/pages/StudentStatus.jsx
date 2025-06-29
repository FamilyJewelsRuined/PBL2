import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import logStatusMahasiswaService from '../services/logStatusMahasiswa';
import { format } from 'date-fns';

const API_URL = 'https://ti054c04.agussbn.my.id/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function StudentStatus() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nim: '',
    status_awal: '',
    status_baru: '',
  });
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: statusLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['statusLogs'],
    queryFn: async () => {
      return await logStatusMahasiswaService.getAll();
    },
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/masters`, { headers: getAuthHeaders() });
      return response.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newLog) => {
      return await logStatusMahasiswaService.create({
        ...newLog,
        tanggal_perubahan: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['statusLogs']);
      queryClient.invalidateQueries(['students']);
      handleClose();
      setError('');
    },
    onError: (err) => {
      if (err.response && err.response.data) {
        const data = err.response.data;
        let msg = '';
        if (data.errors) {
          msg = Object.values(data.errors).flat().join(' | ');
        } else if (data.message) {
          msg = typeof data.message === 'object' ? Object.values(data.message).flat().join(' | ') : data.message;
        } else {
          msg = JSON.stringify(data);
        }
        setError('Gagal menambah log status: ' + msg);
      } else {
        setError(`Gagal menambah log status: ${err.message}`);
      }
    },
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      nim: '',
      status_awal: '',
      status_baru: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const selectedStudent = students?.find((s) => s.nim === formData.nim);
    if (!selectedStudent) {
      setError('Mahasiswa tidak ditemukan!');
      return;
    }
    const payload = {
      nim: selectedStudent.nim,
      status_lama: selectedStudent.status_aktif,
      status_baru: formData.status_baru === 'AKTIF',
      tanggal_perubahan: new Date().toISOString(),
    };
    createMutation.mutate(payload, {
      onError: (err) => {
        setError('Gagal menambah log status: Backend membutuhkan user_id, tapi data mahasiswa tidak memilikinya. Hubungi admin.');
      },
    });
  };

  const columns = [
    { field: 'id_log', headerName: 'ID', width: 90 },
    {
      field: 'nim',
      headerName: 'NIM',
      width: 130,
    },
    {
      field: 'status_awal',
      headerName: 'Previous Status',
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: params.value === 'AKTIF' ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'status_baru',
      headerName: 'New Status',
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: params.value === 'AKTIF' ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'tanggal_perubahan',
      headerName: 'Change Date',
      width: 150,
      valueFormatter: (params) => {
        return format(new Date(params.value), 'dd/MM/yyyy HH:mm');
      },
    },
  ];

  console.log(statusLogs);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Student Status History</Typography>
        <Button variant="contained" onClick={handleOpen}>
          Add Status Change
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={statusLogs || []}
          columns={columns}
          loading={logsLoading || studentsLoading}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Status Change</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Box sx={{ color: 'red', mb: 2 }}>{error}</Box>
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel>Student</InputLabel>
              <Select
                value={formData.nim}
                label="Student"
                onChange={(e) => {
                  const student = students?.find((s) => s.nim === e.target.value);
                  setFormData({
                    ...formData,
                    nim: e.target.value,
                    status_awal: student?.status_aktif || '',
                  });
                }}
                required
              >
                {students?.map((student) => (
                  <MenuItem key={student.nim} value={student.nim}>
                    {student.nim} - {student.nama} ({student.status_aktif})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formData.nim && (
              <Box sx={{ mt: 1, mb: 1, p: 1, background: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  <b>NIM:</b> {formData.nim}
                </Typography>
                <Typography variant="body2">
                  <b>Nama:</b> {students?.find((s) => s.nim === formData.nim)?.nama || '-'}
                </Typography>
                <Typography variant="body2">
                  <b>Status Awal:</b> {students?.find((s) => s.nim === formData.nim)?.status_aktif || '-'}
                </Typography>
              </Box>
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel>New Status</InputLabel>
              <Select
                value={formData.status_baru}
                label="New Status"
                onChange={(e) =>
                  setFormData({ ...formData, status_baru: e.target.value })
                }
                required
              >
                <MenuItem value="AKTIF">Active</MenuItem>
                <MenuItem value="TIDAK AKTIF">Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default StudentStatus; 