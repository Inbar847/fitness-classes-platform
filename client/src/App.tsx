import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import AnimatedBackground from './components/AnimatedBackground';
import LoginContainer from './pages/Login/container/LoginContainer';
import RegisterContainer from './pages/Register/container/RegisterContainer';
import ClassesListContainer from './pages/ClassesList/container/ClassesListContainer';
import ClassDetailsContainer from './pages/ClassDetails/container/ClassDetailsContainer';
import MyBookingsContainer from './pages/MyBookings/container/MyBookingsContainer';
import TrainerDashboardContainer from './pages/TrainerDashboard/container/TrainerDashboardContainer';
import AdminDashboardContainer from './pages/AdminDashboard/container/AdminDashboardContainer';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="relative isolate min-h-screen overflow-x-hidden bg-transparent">
            <AnimatedBackground />

            <div className="relative z-10">
              <Navbar />

              <Routes>
                <Route path="/login" element={<LoginContainer />} />
                <Route path="/register" element={<RegisterContainer />} />

                <Route
                  path="/classes"
                  element={
                    <ProtectedRoute>
                      <ClassesListContainer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute allowedRoles={['trainee']}>
                      <MyBookingsContainer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer"
                  element={
                    <ProtectedRoute allowedRoles={['trainer']}>
                      <TrainerDashboardContainer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboardContainer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/classes/:class_id"
                  element={
                    <ProtectedRoute>
                      <ClassDetailsContainer />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/classes" replace />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;