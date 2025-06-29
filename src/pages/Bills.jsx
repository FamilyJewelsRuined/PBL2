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
  Checkbox,
  ListItemText,
  OutlinedInput,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = 'https://ti054c04.agussbn.my.id/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function Bills() {
  const [open, setOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [formData, setFormData] = useState({
    nim: '',
    kategori_ukt_id: '',
    semester: '',
    tahun_akademik: '',
    tanggal_jatuh_tempo: '',
    nominal: '',
    status_pembayaran: 'belum_lunas',
    keterangan: '',
  });
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: billsRaw, isLoading: billsLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/tagihan`, { headers: getAuthHeaders() });
      console.log('API /tagihan response:', response.data);
      if (Array.isArray(response.data.data)) return response.data.data;
      if (Array.isArray(response.data.data?.data)) return response.data.data.data;
      if (Array.isArray(response.data)) return response.data;
      return [];
    },
  });
  const bills = Array.isArray(billsRaw) ? billsRaw : [];

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/masters`, { headers: getAuthHeaders() });
      return response.data.data || [];
    },
  });

  const { data: categoriesRaw = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['uktCategories'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/kategori-ukt`, { headers: getAuthHeaders() });
      console.log('API /kategori-ukt response:', response.data);
      if (Array.isArray(response.data.data)) return response.data.data;
      if (Array.isArray(response.data.data?.data)) return response.data.data.data;
      if (Array.isArray(response.data)) return response.data;
      return [];
    },
  });
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];

  const createMutation = useMutation({
    mutationFn: async (newBill) => {
      const response = await axios.post(`${API_URL}/tagihan`, newBill, { headers: getAuthHeaders() });
      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Gagal membuat tagihan.');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bills']);
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedBill) => {
      const response = await axios.put(
        `${API_URL}/tagihan/${updatedBill.id_tagihan}`,
        updatedBill,
        { headers: getAuthHeaders() }
      );
      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Gagal mengupdate tagihan.');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bills']);
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id_tagihan) => {
      const response = await axios.delete(`${API_URL}/tagihan/${id_tagihan}`, { headers: getAuthHeaders() });
      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Gagal menghapus tagihan.');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bills']);
    },
  });

  const generateMassMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(`${API_URL}/tagihan/bulk-store`, payload, { headers: getAuthHeaders() });
      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Gagal generate tagihan massal.');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bills']);
      setOpenGenerate(false);
      setGenerateForm({
        id_kategori_ukt: [],
        semester: '',
        tahun_akademik: '',
        tanggal_jatuh_tempo: '',
        keterangan: '',
      });
      setGenerateError('');
    },
    onError: (err) => {
      setGenerateError(err.message || 'Gagal generate tagihan massal.');
    },
  });

  const handleOpen = (bill = null) => {
    if (bill) {
      setSelectedBill(bill);
      setFormData({
        nim: bill.nim,
        kategori_ukt_id: bill.kategori_ukt_id || '',
        semester: bill.semester || '',
        tahun_akademik: bill.tahun_akademik || '',
        tanggal_jatuh_tempo: format(
          new Date(bill.tanggal_jatuh_tempo),
          'yyyy-MM-dd'
        ),
        nominal: bill.nominal,
        status_pembayaran: bill.status_pembayaran || 'belum_lunas',
        keterangan: bill.keterangan || '',
      });
    } else {
      setSelectedBill(null);
      setFormData({
        nim: '',
        kategori_ukt_id: '',
        semester: '',
        tahun_akademik: '',
        tanggal_jatuh_tempo: '',
        nominal: '',
        status_pembayaran: 'belum_lunas',
        keterangan: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBill(null);
    setFormData({
      nim: '',
      kategori_ukt_id: '',
      semester: '',
      tahun_akademik: '',
      tanggal_jatuh_tempo: '',
      nominal: '',
      status_pembayaran: 'belum_lunas',
      keterangan: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedStudent = students?.find((student) => student.nim === formData.nim);
    if (!selectedStudent) {
      setError('Mahasiswa tidak ditemukan!');
      return;
    }
    if (Number(formData.nominal) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    // Duplicate check (ignore current bill if editing)
    const isDuplicate = bills.some(
      (bill) =>
        bill.nim === formData.nim &&
        String(bill.semester) === String(formData.semester) &&
        String(bill.tahun_akademik) === String(formData.tahun_akademik) &&
        String(bill.kategori_ukt_id) === String(formData.kategori_ukt_id) &&
        (!selectedBill || bill.id_tagihan !== selectedBill.id_tagihan)
    );
    if (isDuplicate) {
      setError('A bill for this student with the same semester, academic year, and UKT category already exists.');
      return;
    }
    const dataToSubmit = {
      nim: selectedStudent.nim,
      kategori_ukt_id: Number(formData.kategori_ukt_id),
      semester: Number(formData.semester),
      tahun_akademik: formData.tahun_akademik,
      nominal: Number(formData.nominal),
      tanggal_jatuh_tempo: formData.tanggal_jatuh_tempo,
      status_pembayaran: formData.status_pembayaran,
      keterangan: formData.keterangan,
    };
    if (selectedBill) {
      updateMutation.mutate({
        id_tagihan: selectedBill.id_tagihan,
        ...dataToSubmit,
      }, {
        onError: (err) => {
          setError('Gagal update tagihan: Backend membutuhkan user_id, tapi data mahasiswa tidak memilikinya. Hubungi admin.');
        },
      });
    } else {
      createMutation.mutate(dataToSubmit, {
        onError: (err) => {
          setError('Gagal membuat tagihan: Backend membutuhkan user_id, tapi data mahasiswa tidak memilikinya. Hubungi admin.');
        },
      });
    }
  };

  const handleGenerateBills = () => {
    setOpenGenerate(true);
  };

  const [openGenerate, setOpenGenerate] = useState(false);
  const [generateMode, setGenerateMode] = useState('auto'); // 'auto' | 'custom'
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    id_kategori_ukt: [],
    semester: '',
    tahun_akademik: '',
    tanggal_jatuh_tempo: '',
    keterangan: '',
  });
  const [generateError, setGenerateError] = useState('');

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setGenerateError('');
    setGenerateLoading(true);

    if (!generateForm.id_kategori_ukt.length) {
      setGenerateError('Pilih minimal satu kategori UKT!');
      setGenerateLoading(false);
      return;
    }
    if (!generateForm.semester || !generateForm.tahun_akademik || !generateForm.tanggal_jatuh_tempo) {
      setGenerateError('Semester, tahun akademik, dan tanggal jatuh tempo wajib diisi!');
      setGenerateLoading(false);
      return;
    }

    try {
      if (generateMode === 'auto') {
        // Mode otomatis (bulk-store)
        await generateMassMutation.mutateAsync({
          id_kategori_ukt: generateForm.id_kategori_ukt,
          semester: Number(generateForm.semester),
          tahun_akademik: generateForm.tahun_akademik,
          tanggal_jatuh_tempo: generateForm.tanggal_jatuh_tempo,
          keterangan: generateForm.keterangan,
        });
      } else {
        // Mode custom (bulk-create)
        // Filter mahasiswa sesuai kategori UKT & semester, dan belum punya tagihan yang sama
        const filteredStudents = students.filter((m) => {
          const alreadyExists = bills.some(
            (bill) =>
              bill.nim === m.nim &&
              String(bill.semester) === String(generateForm.semester) &&
              String(bill.tahun_akademik) === String(generateForm.tahun_akademik) &&
              String(bill.kategori_ukt_id) === String(m.id_kategori_ukt)
          );
          return (
            generateForm.id_kategori_ukt.includes(m.id_kategori_ukt) &&
            String(m.semester) === String(generateForm.semester) &&
            !alreadyExists
          );
        });
        if (!filteredStudents.length) {
          setGenerateError('All selected students already have bills for this semester, academic year, and UKT category.');
          setGenerateLoading(false);
          return;
        }
        // Buat array data
        const data = filteredStudents.map((m) => ({
          nim: m.nim,
          kategori_ukt_id: m.id_kategori_ukt,
          semester: m.semester,
          tahun_akademik: generateForm.tahun_akademik,
          nominal: m.nominal,
          tanggal_jatuh_tempo: generateForm.tanggal_jatuh_tempo,
          status_pembayaran: 'belum_lunas',
          keterangan: generateForm.keterangan || `Tagihan UKT Semester ${m.semester}`,
        }));
        // Kirim ke bulk-create
        await axios.post(`${API_URL}/tagihan/bulk-create`, { data }, { headers: getAuthHeaders() });
        queryClient.invalidateQueries(['bills']);
        setOpenGenerate(false);
        setGenerateForm({
          id_kategori_ukt: [],
          semester: '',
          tahun_akademik: '',
          tanggal_jatuh_tempo: '',
          keterangan: '',
        });
      }
    } catch (err) {
      setGenerateError(err?.response?.data?.message || err.message || 'Gagal generate tagihan massal.');
    }
    setGenerateLoading(false);
  };

  const columns = [
    { field: 'id_tagihan', headerName: 'ID', width: 90 },
    {
      field: 'nim',
      headerName: 'NIM',
      width: 200,
      valueGetter: (params) => {
        const student = students?.find((s) => s.nim === params.row.nim);
        return student ? `${params.row.nim} - ${student.nama}` : params.row.nim;
      },
    },
    { field: 'semester', headerName: 'Semester', width: 100 },
    { field: 'tahun_akademik', headerName: 'Tahun Akademik', width: 150 },
    {
      field: 'tanggal_jatuh_tempo',
      headerName: 'Tanggal Jatuh Tempo',
      width: 130,
      valueFormatter: (params) => {
        return format(new Date(params.value), 'dd/MM/yyyy');
      },
    },
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
      field: 'status_pembayaran',
      headerName: 'Status Pembayaran',
      width: 130,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor:
              params.value === 'lunas' ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    { field: 'keterangan', headerName: 'Keterangan', width: 200 },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={() => handleOpen(params.row)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => deleteMutation.mutate(params.row.id_tagihan)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Tuition Bills</Typography>
        <Box>
          <Button
            variant="contained"
            onClick={handleGenerateBills}
            sx={{ mr: 2 }}
          >
            Generate Bills
          </Button>
          <Button variant="contained" onClick={() => handleOpen()}>
            Add New Bill
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={bills}
          columns={columns}
          loading={billsLoading || studentsLoading || categoriesLoading}
          getRowId={(row) => row.id_tagihan}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedBill ? 'Edit Bill' : 'Add New Bill'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel>NIM</InputLabel>
              <Select
                value={formData.nim}
                label="NIM"
                onChange={(e) =>
                  setFormData({ ...formData, nim: e.target.value })
                }
                required
              >
                {students?.map((student) => (
                  <MenuItem key={student.nim} value={student.nim}>
                    {student.nim} - {student.nama}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Kategori</InputLabel>
              <Select
                value={formData.kategori_ukt_id}
                label="Kategori"
                onChange={(e) =>
                  setFormData({ ...formData, kategori_ukt_id: e.target.value })
                }
                required
              >
                {categories.length === 0 && (
                  <MenuItem disabled value="">
                    Tidak ada data kategori UKT
                  </MenuItem>
                )}
                {categories.map((category, idx) => (
                  <MenuItem
                    key={category.id_kategori_ukt ?? category.id ?? idx}
                    value={category.id_kategori_ukt ?? category.id ?? ''}
                  >
                    {category.nama_kategori ?? category.nama ?? 'Tanpa Nama'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Semester"
              type="text"
              fullWidth
              value={formData.semester}
              onChange={(e) =>
                setFormData({ ...formData, semester: e.target.value })
              }
              required
            />
            <TextField
              margin="dense"
              label="Tahun Akademik"
              type="text"
              fullWidth
              value={formData.tahun_akademik}
              onChange={(e) =>
                setFormData({ ...formData, tahun_akademik: e.target.value })
              }
              required
            />
            <TextField
              margin="dense"
              label="Tanggal Jatuh Tempo"
              type="date"
              fullWidth
              value={formData.tanggal_jatuh_tempo}
              onChange={(e) =>
                setFormData({ ...formData, tanggal_jatuh_tempo: e.target.value })
              }
              required
              InputLabelProps={{
                shrink: true,
              }}
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
              InputProps={{
                startAdornment: 'Rp ',
                inputProps: { min: 1 },
              }}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Status Pembayaran</InputLabel>
              <Select
                value={formData.status_pembayaran}
                label="Status Pembayaran"
                onChange={(e) =>
                  setFormData({ ...formData, status_pembayaran: e.target.value })
                }
              >
                <MenuItem value="belum_lunas">belum_lunas</MenuItem>
                <MenuItem value="lunas">lunas</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Keterangan"
              type="text"
              fullWidth
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({ ...formData, keterangan: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedBill ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openGenerate} onClose={() => setOpenGenerate(false)}>
        <DialogTitle>Generate Bills Berdasarkan Kategori UKT</DialogTitle>
        <form onSubmit={handleGenerateSubmit}>
          <DialogContent>
            {generateError && <Alert severity="error" sx={{ mb: 2 }}>{generateError}</Alert>}
            <FormControl fullWidth margin="dense">
              <InputLabel>Mode Generate</InputLabel>
              <Select
                value={generateMode}
                onChange={e => setGenerateMode(e.target.value)}
              >
                <MenuItem value="auto">Otomatis (bulk-store)</MenuItem>
                <MenuItem value="custom">Custom per Mahasiswa (bulk-create)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel id="kategori-multi-label">Kategori UKT</InputLabel>
              <Select
                labelId="kategori-multi-label"
                multiple
                value={generateForm.id_kategori_ukt}
                onChange={e => setGenerateForm(f => ({ ...f, id_kategori_ukt: e.target.value }))}
                input={<OutlinedInput label="Kategori UKT" />}
                renderValue={selected =>
                  categories.filter(c => selected.includes(c.id_kategori_ukt)).map(c => c.nama_kategori).join(', ')
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category.id_kategori_ukt} value={category.id_kategori_ukt}>
                    <Checkbox checked={generateForm.id_kategori_ukt.indexOf(category.id_kategori_ukt) > -1} />
                    <ListItemText primary={category.nama_kategori} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Semester"
              type="number"
              fullWidth
              value={generateForm.semester}
              onChange={e => setGenerateForm(f => ({ ...f, semester: e.target.value }))}
              required
            />
            <TextField
              margin="dense"
              label="Tahun Akademik"
              type="text"
              fullWidth
              value={generateForm.tahun_akademik}
              onChange={e => setGenerateForm(f => ({ ...f, tahun_akademik: e.target.value }))}
              required
            />
            <TextField
              margin="dense"
              label="Tanggal Jatuh Tempo"
              type="date"
              fullWidth
              value={generateForm.tanggal_jatuh_tempo}
              onChange={e => setGenerateForm(f => ({ ...f, tanggal_jatuh_tempo: e.target.value }))}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="dense"
              label="Keterangan"
              type="text"
              fullWidth
              value={generateForm.keterangan}
              onChange={e => setGenerateForm(f => ({ ...f, keterangan: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenGenerate(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={generateLoading}>
              {generateLoading ? 'Generating...' : 'Generate'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Bills; 