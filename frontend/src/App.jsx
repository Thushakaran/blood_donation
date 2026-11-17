import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import RegisterDonor from './pages/RegisterDonor';
import NeedBlood from './pages/NeedBlood';
import SearchDonors from './pages/SearchDonors';
import PublicHospitals from './pages/PublicHospitals';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import ActiveDonors from './pages/ActiveDonors';
import InactiveDonors from './pages/InactiveDonors';
import BloodRequests from './pages/BloodRequests';
import BloodRequestDetail from './pages/BloodRequestDetail';
import BloodStock from './pages/BloodStock';
import UserProfile from './pages/UserProfile';
import AdminManagement from './pages/AdminManagement';
import HospitalManagement from './pages/HospitalManagement';

function SuperAdminOnly({ children }) {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<RegisterDonor />} />
            <Route path="/need-blood" element={<NeedBlood />} />
            <Route path="/search" element={<SearchDonors />} />
            <Route path="/hospitals" element={<PublicHospitals />} />
          </Route>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inbox" element={<SuperAdminOnly><Inbox /></SuperAdminOnly>} />
            <Route path="active-donors" element={<SuperAdminOnly><ActiveDonors /></SuperAdminOnly>} />
            <Route path="inactive-donors" element={<SuperAdminOnly><InactiveDonors /></SuperAdminOnly>} />
            <Route path="requests" element={<BloodRequests />} />
            <Route path="requests/:id" element={<BloodRequestDetail />} />
            <Route path="stock" element={<BloodStock />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="admins" element={<SuperAdminOnly><AdminManagement /></SuperAdminOnly>} />
            <Route path="hospitals" element={<HospitalManagement />} />
            <Route path="add-donor" element={<SuperAdminOnly><RegisterDonor adminMode /></SuperAdminOnly>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
