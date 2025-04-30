import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Engagements from './pages/Engagements';
import Findings from './pages/Findings';
import Login from "./pages/Login";
import Reports from './pages/Reports';
import ReportWriter from './pages/ReportWriter';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/findings" element={<PrivateRoute><Findings /></PrivateRoute>} />
        <Route path="/engagements" element={<PrivateRoute><Engagements /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
        <Route path="/report-writer/:engagementId" element={<PrivateRoute><ReportWriter /></PrivateRoute>} />

      </Routes>
    </Router>
  );
}

export default App;
