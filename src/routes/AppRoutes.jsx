import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../layouts/AppLayout';

// Pages lazy loads (standard imports for reliability)
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import GrupDaftar from '../pages/GrupDaftar';
import GrupForm from '../pages/GrupForm';
import GrupDetail from '../pages/GrupDetail';
import JamaahForm from '../pages/JamaahForm';
import Pengeluaran from '../pages/Pengeluaran';
import KasBesar from '../pages/KasBesar';
import Laporan from '../pages/Laporan';
import LaporanHarian from '../pages/LaporanHarian';
import AuditLog from '../pages/AuditLog';
import Pengaturan from '../pages/Pengaturan';

// Route Guard for logged-in users
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Route Guard for specific roles (RBAC)
const RoleRoute = ({ children, allowedPath }) => {
  const { canAccessPath, user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  
  const hasAccess = canAccessPath(allowedPath);
  if (!hasAccess) {
    // If user lacks permission, redirect back to their default landing page
    if (user.role === 'Marketing') {
      return <Navigate to="/grup" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Layout Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/dashboard">
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/grup"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/grup">
              <AppLayout>
                <GrupDaftar />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/grup/tambah"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/grup">
              <AppLayout>
                <GrupForm />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/grup/edit/:id"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/grup">
              <AppLayout>
                <GrupForm />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/grup/detail/:id"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/grup">
              <AppLayout>
                <GrupDetail />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/jamaah/tambah/:groupId"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/jamaah">
              <AppLayout>
                <JamaahForm />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/jamaah/edit/:id"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/jamaah">
              <AppLayout>
                <JamaahForm />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/pengeluaran"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/pengeluaran">
              <AppLayout>
                <Pengeluaran />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/kas-besar"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/kas-besar">
              <AppLayout>
                <KasBesar />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/laporan"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/laporan">
              <AppLayout>
                <Laporan />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/laporan-harian"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/laporan-harian">
              <AppLayout>
                <LaporanHarian />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/audit-log"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/audit-log">
              <AppLayout>
                <AuditLog />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/pengaturan"
        element={
          <PrivateRoute>
            <RoleRoute allowedPath="/pengaturan">
              <AppLayout>
                <Pengaturan />
              </AppLayout>
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* Wildcard Fallbacks */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
