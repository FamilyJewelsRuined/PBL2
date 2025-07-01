import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'https://ti054c04.agussbn.my.id/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function Dashboard() {
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/masters`, {
        headers: getAuthHeaders(),
      });
      return response.data.data || [];
    },
  });

  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/tagihan`, {
        headers: getAuthHeaders(),
      });
      if (Array.isArray(response.data.data)) return response.data.data;
      if (Array.isArray(response.data.data?.data)) return response.data.data.data;
      return [];
    },
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/pembayaran`, {
        headers: getAuthHeaders(),
      });
      if (Array.isArray(response.data.data)) return response.data.data;
      if (Array.isArray(response.data.data?.data)) return response.data.data.data;
      return [];
    },
  });

  const isLoading = studentsLoading || billsLoading || paymentsLoading;

  const totalStudents = students?.length || 0;
  const activeStudents = students?.filter((s) => s.status_aktif === 'AKTIF').length || 0;
  const totalBills = bills?.length || 0;
  const unpaidBills = bills?.filter((b) => b.status_pembayaran === 'BELUM LUNAS').length || 0;
  const totalPayments = payments?.length || 0;
  const pendingPayments = payments?.filter((p) => p.status_verifikasi === 'MENUNGGU').length || 0;

  const metrics = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Active Students',
      value: activeStudents,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'Total Bills',
      value: totalBills,
      icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
    {
      title: 'Unpaid Bills',
      value: unpaidBills,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: '#f44336',
    },
    {
      title: 'Total Payments',
      value: totalPayments,
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'Pending Verifications',
      value: pendingPayments,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={4} key={metric.title}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {metric.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {isLoading ? '...' : metric.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: `${metric.color}20`,
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {metric.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          
        </Grid>
        <Grid item xs={12} md={6}>
          
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 