import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/findings" element={<Findings />} />
        <Route path="/engagements" element={<Engagements />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/report-writer/:engagementId" element={<ReportWriter />} />

      </Routes>
    </Router>
  );
}

export default App;
