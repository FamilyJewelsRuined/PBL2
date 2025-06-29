import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'https://ti054c04.agussbn.my.id/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function DataDisplay() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch students data
  const { data: students, isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/masters`, {
        headers: getAuthHeaders(),
      });
      return response.data.data || [];
    },
  });

  // Fetch UKT categories data
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/kategori-ukt`, {
        headers: getAuthHeaders(),
      });
      if (Array.isArray(response.data.data)) return response.data.data;
      if (Array.isArray(response.data.data?.data)) return response.data.data.data;
      return [];
    },
  });

  // Fetch bills data
  const { data: bills, isLoading: billsLoading, error: billsError } = useQuery({
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

  const isLoading = studentsLoading || categoriesLoading || billsLoading;
  const error = studentsError || categoriesError || billsError;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading data: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Data from Laravel API
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Students" />
          <Tab label="UKT Categories" />
          <Tab label="Bills" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>NIM</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>UKT Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students?.map((student) => (
                  <TableRow key={student.nim}>
                    <TableCell>{student.nim}</TableCell>
                    <TableCell>{student.nama}</TableCell>
                    <TableCell>{student.status_aktif}</TableCell>
                    <TableCell>{student.id_kategori_ukt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Category Name</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow key={category.id_kategori_ukt}>
                    <TableCell>{category.id_kategori_ukt}</TableCell>
                    <TableCell>{category.nama_kategori}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      }).format(category.nominal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Student NIM</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bills?.map((bill) => (
                  <TableRow key={bill.id_tagihan}>
                    <TableCell>{bill.id_tagihan}</TableCell>
                    <TableCell>{bill.nim}</TableCell>
                    <TableCell>{bill.semester}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      }).format(bill.nominal)}
                    </TableCell>
                    <TableCell>
                      {new Date(bill.tanggal_jatuh_tempo).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{bill.status_pembayaran}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default DataDisplay; 