import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { VotingDistrictProvider } from './contexts/VotingDistrictContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VotingStationDetail from './pages/VotingStationDetail';
import UnknownDistricts from './pages/UnknownDistricts';
import InviteAdmin from './pages/InviteAdmin';

function App() {
  return (
    <VotingDistrictProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="station/:id" element={<VotingStationDetail />} />
          <Route path="unknown" element={<UnknownDistricts />} />
          <Route path="invite-admin" element={<InviteAdmin />} />
        </Route>

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </VotingDistrictProvider>
  );
}

export default App;
