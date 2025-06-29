import { useState, useMemo } from 'react';
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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Edit as EditIcon, Search as SearchIcon, Delete as DeleteIcon } from '@mui/icons-material';

const API_URL = 'https://ti054c04.agussbn.my.id/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function Students() {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    nim: '',
    nama: '',
    status_aktif: 'AKTIF',
    id_kategori_ukt: '',
    semester: '',
    jenis_program: '',
    keterangan_status: '',
  });
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/masters`, {
        headers: getAuthHeaders(),
      });
      console.log('API /masters response:', response.data);
      return response.data.data || [];
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['uktCategories'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/kategori-ukt`, {
        headers: getAuthHeaders(),
      });
      return response.data.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newStudent) => {
      const response = await axios.post(`${API_URL}/masters`, newStudent, {
        headers: getAuthHeaders(),
      });
      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Gagal menambah mahasiswa.');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      handleClose();
    },
    onError: (err) => {
      if (err.response && err.response.data) {
        const data = err.response.data;
        let msg = '';
        if (data.errors) {
          msg = Object.values(data.errors).flat().join(' | ');
        } else if (data.message) {
          msg =
            typeof data.message === 'object'
              ? Object.values(data.message).flat().join(' | ')
              : data.message;
        } else {
          msg = JSON.stringify(data);
        }
        setError('Gagal menambah mahasiswa: ' + msg);
      } else {
        setError(`Gagal menambah mahasiswa: ${err.message}`);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedStudent) => {
      const response = await axios.put(
        `${API_URL}/masters/${updatedStudent.nim}`,
        updatedStudent,
        { headers: getAuthHeaders() }
      );
      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Gagal mengedit mahasiswa.');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      handleClose();
    },
    onError: (err) => {
      if (err.response && err.response.data) {
        const data = err.response.data;
        let msg = '';
        if (data.errors) {
          msg = Object.values(data.errors).flat().join(' | ');
        } else if (data.message) {
          msg =
            typeof data.message === 'object'
              ? Object.values(data.message).flat().join(' | ')
              : data.message;
        } else {
          msg = JSON.stringify(data);
        }
        setError('Gagal mengedit mahasiswa: ' + msg);
      } else {
        setError(`Gagal mengedit mahasiswa: ${err.message}`);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (nim) => {
      const response = await axios.delete(`${API_URL}/masters/${nim}`, {
        headers: getAuthHeaders(),
      });
      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Gagal menghapus mahasiswa.');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
    },
    onError: (err) => setError(err.message || 'Gagal menghapus mahasiswa.'),
  });

  const handleOpen = (student = null) => {
    setError('');
    if (student) {
      setSelectedStudent(student);
      setFormData({
        nim: student.nim,
        nama: student.nama,
        status_aktif: student.status_aktif === true || student.status_aktif === 'AKTIF' ? 'AKTIF' : 'TIDAK AKTIF',
        id_kategori_ukt: student.id_kategori_ukt,
        semester: student.semester || '',
        jenis_program: student.jenis_program || '',
        keterangan_status: student.keterangan_status || '',
      });
    } else {
      setSelectedStudent(null);
      setFormData({
        nim: '',
        nama: '',
        status_aktif: 'AKTIF',
        id_kategori_ukt: '',
        semester: '',
        jenis_program: '',
        keterangan_status: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStudent(null);
    setFormData({
      nim: '',
      nama: '',
      status_aktif: 'AKTIF',
      id_kategori_ukt: '',
      semester: '',
      jenis_program: '',
      keterangan_status: '',
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const dataToSubmit = {
      ...formData,
      semester: formData.semester ? parseInt(formData.semester, 10) : null,
      id_kategori_ukt: formData.id_kategori_ukt
        ? parseInt(formData.id_kategori_ukt, 10)
        : null,
      status_aktif: formData.status_aktif === 'AKTIF',
    };

    console.log('Data to submit:', dataToSubmit);

    if (selectedStudent) {
      updateMutation.mutate(dataToSubmit);
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((student) =>
      student.nama.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [students, searchText]);

  const columns = [
    {
      field: 'no',
      headerName: 'No',
      width: 50,
      renderCell: (params) => params.api.getRowIndexRelativeToVisibleRows(params.row.nim) + 1,
    },
    { field: 'nim', headerName: 'NIM', width: 130 },
    { field: 'nama', headerName: 'Nama', width: 200 },
    { field: 'semester', headerName: 'Semester', width: 100 },
    { field: 'jenis_program', headerName: 'Jenis Program', width: 150 },
    {
      field: 'kategori_ukt',
      headerName: 'ID Kategori',
      width: 150,
      valueGetter: (params) => {
        const category = categories?.find(
          (cat) => cat.id_kategori_ukt === params.row.id_kategori_ukt
        );
        return category ? category.nama_kategori : '';
      },
    },
    {
      field: 'status_aktif',
      headerName: 'Status Keaktifkan',
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
    { field: 'keterangan_status', headerName: 'Keterangan', width: 200 },
    {
      field: 'actions',
      headerName: 'Edit',
      width: 80,
      renderCell: (params) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => handleOpen(params.row)}
        >
          <EditIcon />
        </IconButton>
      ),
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 80,
      renderCell: (params) => (
        <IconButton
          color="error"
          size="small"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this student?')) {
              deleteMutation.mutate(params.row.nim);
            }
          }}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Master</Typography>
        <Box>
          <TextField
            label="Cari Mahasiswa"
            variant="outlined"
            size="small"
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            onClick={() => handleOpen()}
          >
            Add New Student
          </Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ color: 'red', mb: 2 }}>{error}</Box>
      )}

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredStudents}
          columns={columns}
          loading={studentsLoading || categoriesLoading}
          getRowId={(row) => row.nim}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedStudent ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="NIM"
              fullWidth
              value={formData.nim}
              onChange={(e) =>
                setFormData({ ...formData, nim: e.target.value })
              }
              required
              disabled={!!selectedStudent}
            />
            <TextField
              margin="dense"
              label="Nama"
              fullWidth
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Status Keaktifkan</InputLabel>
              <Select
                value={formData.status_aktif}
                label="Status Keaktifkan"
                onChange={(e) =>
                  setFormData({ ...formData, status_aktif: e.target.value })
                }
              >
                <MenuItem value="AKTIF">Aktif</MenuItem>
                <MenuItem value="TIDAK AKTIF">Tidak Aktif</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Kategori UKT</InputLabel>
              <Select
                value={formData.id_kategori_ukt}
                label="Kategori UKT"
                onChange={(e) =>
                  setFormData({ ...formData, id_kategori_ukt: e.target.value })
                }
                required
              >
                {categories?.map((cat) => (
                  <MenuItem key={cat.id_kategori_ukt} value={cat.id_kategori_ukt}>
                    {cat.nama_kategori}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Semester"
              type="number"
              fullWidth
              value={formData.semester}
              onChange={(e) =>
                setFormData({ ...formData, semester: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Jenis Program"
              fullWidth
              value={formData.jenis_program}
              onChange={(e) =>
                setFormData({ ...formData, jenis_program: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Keterangan Status"
              fullWidth
              value={formData.keterangan_status}
              onChange={(e) =>
                setFormData({ ...formData, keterangan_status: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedStudent ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Students; 