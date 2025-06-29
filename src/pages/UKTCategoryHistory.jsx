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
  Alert,
  Grid,
  InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Add as AddIcon, History as HistoryIcon, Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import uktCategoryHistoryService from '../services/uktCategoryHistory';
import axios from 'axios';

const API_URL = 'https://ti054c04.agussbn.my.id/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function UKTCategoryHistory() {
  const [open, setOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [formData, setFormData] = useState({
    nim: '',
    kategori_sesudah: '',
    alasan_perubahan: '',
    keterangan: '',
    status_pengajuan: 'pending',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterNIM, setFilterNIM] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const queryClient = useQueryClient();

  // Fetch UKT category history
  const { data: historyDataRaw, isLoading } = useQuery({
    queryKey: ['uktCategoryHistory'],
    queryFn: uktCategoryHistoryService.getAllHistory,
  });
  const historyData = Array.isArray(historyDataRaw) ? historyDataRaw : (historyDataRaw?.data || []);

  // Fetch students for dropdown
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/masters`, {
        headers: getAuthHeaders(),
      });
      return response.data.data || [];
    },
  });

  // Fetch UKT categories for dropdown
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['uktCategories'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/kategori-ukt`, {
        headers: getAuthHeaders(),
      });
      if (Array.isArray(response.data.data)) return response.data.data;
      if (Array.isArray(response.data.data?.data)) return response.data.data.data;
      return [];
    },
  });

  const createMutation = useMutation({
    mutationFn: uktCategoryHistoryService.createHistory,
    onSuccess: () => {
      queryClient.invalidateQueries(['uktCategoryHistory']);
      handleClose();
      setSuccess('Riwayat kategori UKT berhasil ditambahkan');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Create history error:', err);
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
        setError('Gagal menambah riwayat: ' + msg);
      } else {
        setError(`Gagal menambah riwayat: ${err.message}`);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: uktCategoryHistoryService.deleteHistory,
    onSuccess: () => {
      queryClient.invalidateQueries(['uktCategoryHistory']);
      setSuccess('Riwayat kategori UKT berhasil dihapus');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError('Gagal menghapus riwayat.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => uktCategoryHistoryService.updateHistory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['uktCategoryHistory']);
      handleClose();
      setSuccess('Riwayat kategori UKT berhasil diupdate');
      setTimeout(() => setSuccess(''), 3000);
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
        setError('Gagal update riwayat: ' + msg);
      } else {
        setError(`Gagal update riwayat: ${err.message}`);
      }
    },
  });

  const handleOpen = (history = null) => {
    setError('');
    if (history) {
      setSelectedHistory(history);
      setFormData({
        nim: history.nim,
        kategori_sesudah: history.kategori_sesudah,
        alasan_perubahan: history.alasan_perubahan,
        keterangan: history.keterangan,
        status_pengajuan: history.status_pengajuan || 'pending',
      });
    } else {
      setSelectedHistory(null);
      setFormData({
        nim: '',
        kategori_sesudah: '',
        alasan_perubahan: '',
        keterangan: '',
        status_pengajuan: 'pending',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedHistory(null);
    setFormData({
      nim: '',
      kategori_sesudah: '',
      alasan_perubahan: '',
      keterangan: '',
      status_pengajuan: 'pending',
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (selectedHistory) {
      const data = {
        status_pengajuan: formData.status_pengajuan,
        keterangan: formData.keterangan,
      };
      updateMutation.mutate({ id: selectedHistory.id_riwayat_kategori_ukt, data });
    } else {
      const data = {
        nim: formData.nim,
        kategori_sesudah: formData.kategori_sesudah,
        alasan_perubahan: formData.alasan_perubahan,
        keterangan: formData.keterangan,
      };
      createMutation.mutate(data);
    }
  };

  // Helper function to get student name by NIM
  const getStudentName = (nim) => {
    const student = students?.find(s => s.nim === nim);
    return student ? student.nama : nim;
  };

  // Helper function to get category name by ID
  const getCategoryName = (id) => {
    const category = categories?.find(c => c.id_kategori_ukt === id);
    return category ? category.nama_kategori : id;
  };

  // Filter data based on search and filters
  const filteredData = Array.isArray(historyData) ? historyData.filter((item) => {
    const matchesSearch = searchText === '' || 
      item.nim.toLowerCase().includes(searchText.toLowerCase()) ||
      getStudentName(item.nim).toLowerCase().includes(searchText.toLowerCase()) ||
      getCategoryName(item.id_kategori_ukt).toLowerCase().includes(searchText.toLowerCase());
    
    const matchesNIM = filterNIM === '' || item.nim === filterNIM;
    const matchesCategory = filterCategory === '' || item.id_kategori_ukt.toString() === filterCategory;
    
    return matchesSearch && matchesNIM && matchesCategory;
  }) : [];

  console.log('historyData:', historyData);

  const columns = [
    { field: 'id_riwayat_kategori_ukt', headerName: 'ID', width: 80 },
    { field: 'nim', headerName: 'NIM', width: 120 },
    {
      field: 'nama_mahasiswa',
      headerName: 'Nama Mahasiswa',
      width: 180,
      valueGetter: (params) => params.row.mahasiswa?.nama || params.row.nim,
    },
    {
      field: 'kategori_sebelum_detail',
      headerName: 'Kategori Sebelum',
      width: 150,
      valueGetter: (params) => params.row.kategori_sebelum_detail?.nama_kategori || '-',
    },
    {
      field: 'kategori_sesudah_detail',
      headerName: 'Kategori Sesudah',
      width: 150,
      valueGetter: (params) => params.row.kategori_sesudah_detail?.nama_kategori || '-',
    },
    { field: 'alasan_perubahan', headerName: 'Alasan Perubahan', width: 200 },
    { field: 'status_pengajuan', headerName: 'Status', width: 120 },
    {
      field: 'tanggal_pengajuan',
      headerName: 'Tanggal Pengajuan',
      width: 150,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('id-ID') : '-',
    },
    {
      field: 'tanggal_verifikasi',
      headerName: 'Tanggal Verifikasi',
      width: 150,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('id-ID') : '-',
    },
    { field: 'keterangan', headerName: 'Keterangan', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleOpen(params.row)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) {
                deleteMutation.mutate(params.row.id_riwayat_kategori_ukt);
              }
            }}
          >
            Hapus
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon />
          <Typography variant="h5">Riwayat Kategori UKT</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Tambah Riwayat
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Cari berdasarkan NIM, nama mahasiswa, atau kategori..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter NIM</InputLabel>
              <Select
                value={filterNIM}
                label="Filter NIM"
                onChange={(e) => setFilterNIM(e.target.value)}
              >
                <MenuItem value="">Semua NIM</MenuItem>
                {students?.map((student) => (
                  <MenuItem key={student.nim} value={student.nim}>
                    {student.nim} - {student.nama}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter Kategori</InputLabel>
              <Select
                value={filterCategory}
                label="Filter Kategori"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="">Semua Kategori</MenuItem>
                {categories?.map((category) => (
                  <MenuItem key={category.id_kategori_ukt} value={category.id_kategori_ukt.toString()}>
                    {category.nama_kategori}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchText('');
                setFilterNIM('');
                setFilterCategory('');
              }}
            >
              Reset Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 500, width: '100%' }}>
        {isLoading || studentsLoading || categoriesLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="h6" color="text.secondary">
              Memuat data...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="h6" color="error">
              Gagal memuat riwayat perubahan.
            </Typography>
          </Box>
        ) : filteredData.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="h6" color="text.secondary">
              Tidak ada data
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.id_riwayat_kategori_ukt}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #e0e0e0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
              },
            }}
          />
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedHistory ? 'Edit Riwayat Kategori UKT' : 'Tambah Riwayat Kategori UKT'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {selectedHistory ? (
              <>
                <TextField
                  margin="dense"
                  label="NIM"
                  fullWidth
                  value={formData.nim}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <TextField
                  margin="dense"
                  label="Kategori Sesudah"
                  fullWidth
                  value={formData.kategori_sesudah}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <TextField
                  margin="dense"
                  label="Alasan Perubahan"
                  fullWidth
                  value={formData.alasan_perubahan}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <FormControl fullWidth margin="dense" required>
                  <InputLabel>Status Pengajuan</InputLabel>
                  <Select
                    value={formData.status_pengajuan}
                    label="Status Pengajuan"
                    onChange={(e) => setFormData({ ...formData, status_pengajuan: e.target.value })}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="disetujui">Disetujui</MenuItem>
                    <MenuItem value="ditolak">Ditolak</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  margin="dense"
                  label="Keterangan"
                  type="text"
                  fullWidth
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                />
              </>
            ) : (
              <>
                <FormControl fullWidth margin="dense" required>
                  <InputLabel>Mahasiswa</InputLabel>
                  <Select
                    value={formData.nim}
                    label="Mahasiswa"
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  >
                    {students?.map((student) => (
                      <MenuItem key={student.nim} value={student.nim}>
                        {student.nim} - {student.nama}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="dense" required>
                  <InputLabel>Kategori Sesudah</InputLabel>
                  <Select
                    value={formData.kategori_sesudah}
                    label="Kategori Sesudah"
                    onChange={(e) => setFormData({ ...formData, kategori_sesudah: e.target.value })}
                  >
                    {categories?.map((category) => (
                      <MenuItem key={category.id_kategori_ukt} value={category.id_kategori_ukt}>
                        {category.nama_kategori}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  margin="dense"
                  label="Alasan Perubahan"
                  type="text"
                  fullWidth
                  required
                  value={formData.alasan_perubahan}
                  onChange={(e) => setFormData({ ...formData, alasan_perubahan: e.target.value })}
                />
                <TextField
                  margin="dense"
                  label="Keterangan"
                  type="text"
                  fullWidth
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Batal</Button>
            <Button type="submit" variant="contained">
              {selectedHistory ? 'Update' : 'Tambah'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default UKTCategoryHistory;
