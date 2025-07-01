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
import { Edit as EditIcon, Search as SearchIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../services/student';

function Students() {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    nim: '',
    nama: '',
    email: '',
    no_hp: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    image: '',
  });
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const createMutation = useMutation({
    mutationFn: createStudent,
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
    mutationFn: ({ nim, ...data }) => updateStudent(nim, data),
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
    mutationFn: deleteStudent,
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
        email: student.email,
        no_hp: student.no_hp,
        tempat_lahir: student.tempat_lahir,
        tanggal_lahir: student.tanggal_lahir ? student.tanggal_lahir.split('T')[0] : '',
        alamat: student.alamat,
        image: student.image || '',
      });
    } else {
      setSelectedStudent(null);
      setFormData({
        nim: '',
        nama: '',
        email: '',
        no_hp: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        alamat: '',
        image: '',
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
      email: '',
      no_hp: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      alamat: '',
      image: '',
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const dataToSubmit = {
      ...formData,
      tanggal_lahir: formData.tanggal_lahir ? new Date(formData.tanggal_lahir).toISOString() : '',
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
      student.nama.toLowerCase().includes(searchText.toLowerCase()) ||
      student.nim.toLowerCase().includes(searchText.toLowerCase()) ||
      student.email.toLowerCase().includes(searchText.toLowerCase())
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
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'no_hp', headerName: 'No. HP', width: 130 },
    { field: 'tempat_lahir', headerName: 'Tempat Lahir', width: 150 },
    {
      field: 'tanggal_lahir',
      headerName: 'Tanggal Lahir',
      width: 130,
      valueGetter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('id-ID');
      },
    },
    { field: 'alamat', headerName: 'Alamat', width: 200 },
    {
      field: 'image',
      headerName: 'Foto',
      width: 100,
      renderCell: (params) => (
        <Box
          component="img"
          src={params.value || '/default-avatar.png'}
          alt="Student"
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      ),
    },
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
        <Typography variant="h5">Master Mahasiswa</Typography>
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
          loading={studentsLoading}
          getRowId={(row) => row.nim}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedStudent ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <TextField
                margin="dense"
                label="No. HP"
                fullWidth
                value={formData.no_hp}
                onChange={(e) =>
                  setFormData({ ...formData, no_hp: e.target.value })
                }
                required
              />
              <TextField
                margin="dense"
                label="Tempat Lahir"
                fullWidth
                value={formData.tempat_lahir}
                onChange={(e) =>
                  setFormData({ ...formData, tempat_lahir: e.target.value })
                }
                required
              />
              <TextField
                margin="dense"
                label="Tanggal Lahir"
                type="date"
                fullWidth
                value={formData.tanggal_lahir}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal_lahir: e.target.value })
                }
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                margin="dense"
                label="Alamat"
                fullWidth
                multiline
                rows={3}
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
                required
                sx={{ gridColumn: '1 / -1' }}
              />
              <TextField
                margin="dense"
                label="Image URL"
                fullWidth
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                sx={{ gridColumn: '1 / -1' }}
              />
            </Box>
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