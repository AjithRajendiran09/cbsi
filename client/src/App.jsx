import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AssessmentProvider } from './context/AssessmentContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Participant Pages
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import Report from './pages/Report';

// Admin & Faculty Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import QuestionManagement from './pages/admin/QuestionManagement';
import DimensionManagement from './pages/admin/DimensionManagement';
import AssessmentView from './pages/admin/AssessmentView';
import Analytics from './pages/admin/Analytics';
import AuditLog from './pages/admin/AuditLog';
import ExportData from './pages/admin/ExportData';

function App() {
  return (
    <AuthProvider>
      <AssessmentProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Participant Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assessment"
                  element={
                    <ProtectedRoute>
                      <Assessment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/results/:id"
                  element={
                    <ProtectedRoute>
                      <Results />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report/:id"
                  element={
                    <ProtectedRoute>
                      <Report />
                    </ProtectedRoute>
                  }
                />

                {/* Admin & Faculty Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/questions"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <QuestionManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dimensions"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DimensionManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/assessments/:id"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                      <AssessmentView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AuditLog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/export"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ExportData />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AssessmentProvider>
    </AuthProvider>
  );
}

export default App;
