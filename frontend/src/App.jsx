import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import RegisterDonor from './pages/RegisterDonor';
import NeedBlood from './pages/NeedBlood';
import SearchDonors from './pages/SearchDonors';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import ActiveDonors from './pages/ActiveDonors';
import InactiveDonors from './pages/InactiveDonors';
import BloodRequests from './pages/BloodRequests';
import BloodStock from './pages/BloodStock';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/register" element={<RegisterDonor />} />
            <Route path="/need-blood" element={<NeedBlood />} />
            <Route path="/search" element={<SearchDonors />} />
          </Route>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="active-donors" element={<ActiveDonors />} />
            <Route path="inactive-donors" element={<InactiveDonors />} />
            <Route path="requests" element={<BloodRequests />} />
            <Route path="stock" element={<BloodStock />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
