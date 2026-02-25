/**
 * App.jsx – Root with authentication guard and hash routing
 */
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DBProvider } from './context/DBContext';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Roles from './pages/Roles';
import Payroll from './pages/Payroll';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Projects from './pages/Projects';
import SchemaViewer from './pages/SchemaViewer';
import SQLEditor from './pages/SQLEditor';

function RequireAuth({ children }) {
  const user = JSON.parse(localStorage.getItem('empnexus_user') || 'null');
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <DBProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <RequireAuth>
              <AppShell>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/departments" element={<Departments />} />
                  <Route path="/roles" element={<Roles />} />
                  <Route path="/payroll" element={<Payroll />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/leaves" element={<Leaves />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/schema" element={<SchemaViewer />} />
                  <Route path="/sql" element={<SQLEditor />} />
                </Routes>
              </AppShell>
            </RequireAuth>
          } />
        </Routes>
      </HashRouter>
    </DBProvider>
  );
}
