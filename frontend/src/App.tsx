import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import BabyDetail from './pages/BabyDetail';
import GrowthPage from './pages/GrowthPage';
import NutritionPage from './pages/NutritionPage';
import DevelopmentPage from './pages/DevelopmentPage';
import HealthRecordsPage from './pages/HealthRecordsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './App.css';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="auth-page">
        <p className="subtext">Loading BabyCare360…</p>
      </main>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterForm />}
      />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/baby/:babyId"
          element={
            <ProtectedRoute>
              <BabyDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/growth/:babyId"
          element={
            <ProtectedRoute>
              <GrowthPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nutrition/:babyId"
          element={
            <ProtectedRoute>
              <NutritionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/development/:babyId"
          element={
            <ProtectedRoute>
              <DevelopmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health-records/:babyId"
          element={
            <ProtectedRoute>
              <HealthRecordsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/:babyId"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home or login */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
        />
      </Routes>
    );
  }

export default App;
