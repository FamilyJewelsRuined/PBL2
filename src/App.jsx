import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UKTCategories from './pages/UKTCategories';
import UKTCategoryHistory from './pages/UKTCategoryHistory';
import Students from './pages/Students';
import Bills from './pages/Bills';
import Payments from './pages/Payments';
import StudentStatus from './pages/StudentStatus';
import DataDisplay from './pages/DataDisplay';
import Login from './components/Login';
import Register from './components/Register';
import authService from './services/auth';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#367FA9',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#AAC9DA',
      paper: '#ffffff',
    },
  },
  components: {
    MuiDataGrid: {
      styleOverrides: {
        columnHeaders: {
          backgroundColor: '#004680',
          color: '#ffffff',
        },
      },
    },
  },
});

const queryClient = new QueryClient();

function RequireAuth({ children }) {
  const location = useLocation();
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/ukt-categories" element={<UKTCategories />} />
                      <Route path="/ukt-category-history" element={<UKTCategoryHistory />} />
                      <Route path="/students" element={<Students />} />
                      <Route path="/bills" element={<Bills />} />
                      <Route path="/payments" element={<Payments />} />
                      <Route path="/student-status" element={<StudentStatus />} />
                      <Route path="/data-display" element={<DataDisplay />} />
                    </Routes>
                  </Layout>
                </RequireAuth>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 