import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'https://ti054c04.agussbn.my.id/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function UKTCategories() {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    nama_kategori: '',
    nominal: '',
    jenis_program: '',
    status: true,
  });
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['uktCategories'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/kategori-ukt`, {
        headers: getAuthHeaders(),
      });
      console.log('API Response for UKT Categories:', response.data);
      return response.data.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newCategory) => {
      const response = await axios.post(
        `${API_URL}/kategori-ukt`,
        newCategory,
        { headers: getAuthHeaders() }
      );
      if (response.data.status === 'error') {
        throw new Error(
          response.data.message || 'An unknown error occurred while creating.'
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['uktCategories']);
      handleClose();
    },
    onError: (err) => {
      console.error('Create category error:', err);
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
        setError('Gagal menambah kategori: ' + msg);
      } else {
        setError(`Gagal menambah kategori: ${err.message}`);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedCategory) => {
      const response = await axios.put(
        `${API_URL}/kategori-ukt/${updatedCategory.id_kategori_ukt}`,
        updatedCategory,
        { headers: getAuthHeaders() }
      );
      if (response.data.status === 'error') {
        throw new Error(
          response.data.message || 'An unknown error occurred while updating.'
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['uktCategories']);
      handleClose();
    },
    onError: (err) => {
      if (err.response && err.response.data && err.response.data.message) {
        setError('Gagal mengedit kategori: ' + err.response.data.message);
      } else {
        setError(`Gagal mengedit kategori: ${err.message}`);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/kategori-ukt/${id}`, {
        headers: getAuthHeaders(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['uktCategories']);
    },
    onError: (err) => {
      setError('Gagal menghapus kategori.');
    },
  });

  const handleOpen = (category = null) => {
    setError('');
    if (category) {
      setSelectedCategory(category);
      setFormData({
        nama_kategori: category.nama_kategori,
        nominal: category.nominal,
        jenis_program: category.jenis_program || '',
        status: category.status === true || category.status === 'Aktif' || category.status === 1,
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        nama_kategori: '',
        nominal: '',
        jenis_program: '',
        status: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory(null);
    setFormData({
      nama_kategori: '',
      nominal: '',
      jenis_program: '',
      status: true,
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const data = {
      ...formData,
      nominal: parseFloat(formData.nominal),
      status: Boolean(formData.status),
    };

    if (selectedCategory) {
      updateMutation.mutate({
        id_kategori_ukt: selectedCategory.id_kategori_ukt,
        ...data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { field: 'id_kategori_ukt', headerName: 'ID', width: 90 },
    { field: 'nama_kategori', headerName: 'Nama Kategori', width: 200 },
    { field: 'jenis_program', headerName: 'Jenis Program', width: 150 },
    {
      field: 'nominal',
      headerName: 'Nominal',
      width: 150,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(params.value);
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: params.value ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            textAlign: 'center',
            width: '80px',
          }}
        >
          {params.value ? 'Aktif' : 'Nonaktif'}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            onClick={() => handleOpen(params.row)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this category?')) {
                deleteMutation.mutate(params.row.id_kategori_ukt);
              }
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">UKT Categories</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add New Category
        </Button>
      </Box>

      {error && (
        <Box sx={{ color: 'red', mb: 2 }}>{error}</Box>
      )}

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={categories || []}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id_kategori_ukt}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              fullWidth
              value={formData.nama_kategori}
              onChange={(e) =>
                setFormData({ ...formData, nama_kategori: e.target.value })
              }
              required
            />
            <TextField
              margin="dense"
              label="Amount"
              type="number"
              fullWidth
              value={formData.nominal}
              onChange={(e) =>
                setFormData({ ...formData, nominal: e.target.value })
              }
              required
            />
            <TextField
              margin="dense"
              label="Jenis Program"
              fullWidth
              value={formData.jenis_program}
              onChange={(e) =>
                setFormData({ ...formData, jenis_program: e.target.value })
              }
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                required
              >
                <MenuItem value={true}>Aktif</MenuItem>
                <MenuItem value={false}>Nonaktif</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedCategory ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default UKTCategories; 