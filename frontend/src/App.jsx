import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Engagements from './pages/Engagements';
import Findings from './pages/Findings';
import Login from "./pages/Login";
import ReportDetails from "./pages/ReportDetails";
import Reports from './pages/Reports';
import ReportWriter from './pages/ReportWriter';
import SystemAdmin from './pages/SystemAdmin';
import FindingDetails from './pages/FindingDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout><Dashboard /></DashboardLayout></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/reports/:reportid" element={<ReportDetails />} />
        <Route path="/findings" element={<PrivateRoute><Findings /></PrivateRoute>} />
        <Route path="/findings/:findingId" element={<PrivateRoute><FindingDetails /></PrivateRoute>} />
        <Route path="/engagements" element={<PrivateRoute><Engagements /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
        <Route path="/report-writer/:reportId" element={<PrivateRoute><ReportWriter /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><SystemAdmin/></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
