import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
// import RecordManagement from './pages/Records';
import LoginPage from './pages/Login';
import CreateAttendance from './pages/CreateAttendance';
import PrivateRoute from './components/PrivateRoute';
import Settings from './pages/Settings';
import AttendanceList from './pages/AttendanceList';
import RegisterUserPage from './pages/Register';
import PendingOutTime from './pages/PendingOutTime';
import CreateExtraAttendance from './pages/CreateExtraAttendance';
import ExtraPersonsAdmin from './pages/ExtraPersonsAdmin';
import CreateSiteLimit from './pages/CreateSiteLimit';
// import PaymentRecords from './pages/PaymentRecords';
// import Settings from './pages/Settings';
// import Entry from './pages/Entry';
// import GetEntry from './pages/GetEntry';


function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />
        {/* Protected Layout with Sidebar */}
        
        <Route path="/settings" element={<DashboardLayout>
            <Settings />
          </DashboardLayout>} />
        
        <Route element={<PrivateRoute allowedRoles={["Admin", "SuperAdmin"]} />}>
          <Route path="/" element={<DashboardLayout>
            <AttendanceList />
          </DashboardLayout>} />
          
          
        </Route>

        <Route element={<PrivateRoute allowedRoles={["SuperAdmin"]} />}>
          <Route path="/register" element={<DashboardLayout>
            <RegisterUserPage />
          </DashboardLayout>} />
          <Route path="/createSiteLimit" element={<DashboardLayout>
            <CreateSiteLimit />
          </DashboardLayout>} />
          
          
        </Route>

        <Route element={<PrivateRoute allowedRoles={["Admin"]} />}>
          <Route path="/" element={<DashboardLayout>
            <AttendanceList />
          </DashboardLayout>} />
          <Route path="/extraPerson" element={<DashboardLayout>
            <ExtraPersonsAdmin />
          </DashboardLayout>} />
          
          
        </Route>

        <Route element={<PrivateRoute allowedRoles={["User"]} />}>
          <Route path="/create" element={<DashboardLayout>
            <CreateAttendance />
          </DashboardLayout>} />
          <Route
            path="/pending-out"
            element={
              <DashboardLayout>
                <PendingOutTime />
              </DashboardLayout>
            }
          />

          <Route
            path="/createExtra"
            element={
              <DashboardLayout>
                <CreateExtraAttendance />
              </DashboardLayout>
            }
          />
        </Route>



      </Routes>
    </Router>
  );
}

export default App;

