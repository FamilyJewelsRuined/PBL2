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
import { format } from 'date-fns';
import paymentService from '../services/payment';

const API_URL = 'https://ti054c04.agussbn.my.id/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function Payments() {
  const [open, setOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({
    id_tagihan: '',
    tanggal_bayar: '',
    bukti_pembayaran: '',
    status_verifikasi: 'menunggu',
  });
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      return await paymentService.getAll();
    },
  });

  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/tagihan`, { headers: getAuthHeaders() });
      if (Array.isArray(response.data.data)) return response.data.data;
      if (Array.isArray(response.data.data?.data)) return response.data.data.data;
      return [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newPayment) => {
      return await paymentService.create(newPayment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedPayment) => {
      let dataToSend;
      if (updatedPayment.bukti_pembayaran instanceof File) {
        dataToSend = new FormData();
        dataToSend.append('id_tagihan', updatedPayment.id_tagihan);
        dataToSend.append('tanggal_bayar', updatedPayment.tanggal_bayar);
        dataToSend.append('status_verifikasi', updatedPayment.status_verifikasi);
        dataToSend.append('bukti_pembayaran', updatedPayment.bukti_pembayaran);
      } else {
        dataToSend = {
          id_tagihan: updatedPayment.id_tagihan,
          tanggal_bayar: updatedPayment.tanggal_bayar,
          status_verifikasi: updatedPayment.status_verifikasi,
        };
      }
      return await paymentService.update(updatedPayment.id_pembayaran, dataToSend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      handleClose();
      setError('');
    },
    onError: (err) => {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Gagal update pembayaran.');
      } else {
        setError('Gagal update pembayaran.');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await paymentService.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
    },
  });

  const handleOpen = (payment = null) => {
    if (payment) {
      setSelectedPayment(payment);
      setFormData({
        id_tagihan: payment.id_tagihan,
        tanggal_bayar: format(new Date(payment.tanggal_bayar), 'yyyy-MM-dd'),
        bukti_pembayaran: payment.bukti_pembayaran || '',
        status_verifikasi: (payment.status_verifikasi || 'menunggu').toLowerCase(),
      });
    } else {
      setSelectedPayment(null);
      setFormData({
        id_tagihan: '',
        tanggal_bayar: '',
        bukti_pembayaran: '',
        status_verifikasi: 'menunggu',
      });
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPayment(null);
    setFormData({
      id_tagihan: '',
      tanggal_bayar: '',
      bukti_pembayaran: '',
      status_verifikasi: 'menunggu',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let dataToSend;
    if (selectedPayment) {
      if (formData.bukti_pembayaran instanceof File) {
        dataToSend = new FormData();
        dataToSend.append('id_tagihan', formData.id_tagihan);
        dataToSend.append('tanggal_bayar', formData.tanggal_bayar);
        dataToSend.append('status_verifikasi', formData.status_verifikasi);
        dataToSend.append('bukti_pembayaran', formData.bukti_pembayaran);
      } else {
        dataToSend = {
          id_tagihan: formData.id_tagihan,
          tanggal_bayar: formData.tanggal_bayar,
          status_verifikasi: formData.status_verifikasi,
        };
      }
      updateMutation.mutate({
        id_pembayaran: selectedPayment.id_pembayaran,
        ...dataToSend,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    { field: 'id_pembayaran', headerName: 'ID Pembayaran', width: 90 },
    {
      field: 'id_tagihan',
      headerName: 'ID Tagihan',
      width: 200,
      valueGetter: (params) => {
        const bill = bills?.find((b) => b.id_tagihan === params.row.id_tagihan);
        return bill
          ? `Bill #${bill.id_tagihan} - ${bill.semester}`
          : params.row.id_tagihan;
      },
    },
    {
      field: 'semester',
      headerName: 'Semester',
      width: 150,
      valueGetter: (params) => {
        const bill = bills?.find((b) => b.id_tagihan === params.row.id_tagihan);
        return bill ? bill.semester : '';
      },
    },
    {
      field: 'tanggal_bayar',
      headerName: 'Tanggal Pembayaran',
      width: 130,
      valueFormatter: (params) => {
        return format(new Date(params.value), 'dd/MM/yyyy');
      },
    },
    {
      field: 'bukti_pembayaran',
      headerName: 'Bukti Pembayaran',
      width: 150,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => window.open(
            params.value && !params.value.startsWith('http') ? `${API_URL}/storage/${params.value}` : params.value,
            '_blank'
          )}
          disabled={!params.value}
        >
          View Proof
        </Button>
      ),
    },
    {
      field: 'status_verifikasi',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor:
              params.value === 'TERVERIFIKASI'
                ? '#4caf50'
                : params.value === 'DITOLAK'
                ? '#f44336'
                : '#ff9800',
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
      field: 'actions',
      headerName: 'Aksi',
      width: 180,
      renderCell: (params) => (
        <>
          <Button size="small" onClick={() => handleOpen(params.row)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => deleteMutation.mutate(params.row.id_pembayaran)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Payments</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add New Payment
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={payments || []}
          columns={columns}
          loading={paymentsLoading || billsLoading}
          getRowId={(row) => row.id_pembayaran}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedPayment ? 'Edit Payment' : 'Add New Payment'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Box sx={{ color: 'red', mb: 2 }}>{error}</Box>
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel>Nominal (dari Tagihan)</InputLabel>
              <Select
                value={formData.id_tagihan}
                label="Nominal (dari Tagihan)"
                onChange={(e) =>
                  setFormData({ ...formData, id_tagihan: e.target.value })
                }
                required
              >
                {bills?.map((bill) => (
                  <MenuItem key={bill.id_tagihan} value={bill.id_tagihan}>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(bill.nominal)} - {bill.semester}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Tanggal Pembayaran"
              type="date"
              fullWidth
              value={formData.tanggal_bayar}
              onChange={(e) =>
                setFormData({ ...formData, tanggal_bayar: e.target.value })
              }
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              margin="dense"
              label="Bukti Pembayaran"
              type="file"
              fullWidth
              inputProps={{ accept: 'image/*' }}
              onChange={(e) =>
                setFormData({ ...formData, bukti_pembayaran: e.target.files[0] })
              }
              required={!selectedPayment}
            />
            {selectedPayment && selectedPayment.bukti_pembayaran && typeof selectedPayment.bukti_pembayaran === 'string' && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">Bukti pembayaran lama:</Typography>
                <a
                  href={selectedPayment.bukti_pembayaran.startsWith('http')
                    ? selectedPayment.bukti_pembayaran
                    : `${API_URL}/storage/${selectedPayment.bukti_pembayaran}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lihat Bukti Pembayaran
                </a>
              </Box>
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel>Status Verifikasi</InputLabel>
              <Select
                value={formData.status_verifikasi}
                label="Status Verifikasi"
                onChange={(e) =>
                  setFormData({ ...formData, status_verifikasi: e.target.value })
                }
              >
                <MenuItem value="menunggu">Menunggu</MenuItem>
                <MenuItem value="diterima">Diterima</MenuItem>
                <MenuItem value="ditolak">Ditolak</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedPayment ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Payments; 