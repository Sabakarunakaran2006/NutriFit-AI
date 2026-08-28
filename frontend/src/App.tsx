import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// User Pages
import { DashboardPage } from './pages/user/DashboardPage';
import { OnboardingPage } from './pages/user/OnboardingPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { DietPlanPage } from './pages/user/DietPlanPage';
import { WorkoutPlanPage } from './pages/user/WorkoutPlanPage';
import { MealTrackerPage } from './pages/user/MealTrackerPage';
import { WorkoutTrackerPage } from './pages/user/WorkoutTrackerPage';
import { ProgressPage } from './pages/user/ProgressPage';
import { FoodScannerPage } from './pages/user/FoodScannerPage';
import { AdaptiveFeedbackPage } from './pages/user/AdaptiveFeedbackPage';
import { GroceryListPage } from './pages/user/GroceryListPage';
import { SettingsPage } from './pages/user/SettingsPage';

// Expert Pages
import { ExpertDashboardPage } from './pages/expert/ExpertDashboardPage';
import { AssignedUsersPage } from './pages/expert/AssignedUsersPage';
import { UserReviewPage } from './pages/expert/UserReviewPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { MLManagementPage } from './pages/admin/MLManagementPage';
import { DatasetManagementPage } from './pages/admin/DatasetManagementPage';

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'EXPERT') return <Navigate to="/expert" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            {/* Root Navigation */}
            <Route path="/" element={<RootRedirect />} />

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* User Onboarding (Standalone) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Main Application Shell (Protected) */}
            <Route element={<MainLayout />}>
              {/* User Client Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/diet-plan"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <DietPlanPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout-plan"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <WorkoutPlanPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meal-tracker"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <MealTrackerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout-tracker"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <WorkoutTrackerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <ProgressPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/food-scanner"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <FoodScannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feedback"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <AdaptiveFeedbackPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grocery-list"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <GroceryListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['USER', 'EXPERT', 'ADMIN']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fitness Expert / Nutritionist Routes */}
              <Route
                path="/expert"
                element={
                  <ProtectedRoute allowedRoles={['EXPERT', 'ADMIN']}>
                    <ExpertDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expert/users"
                element={
                  <ProtectedRoute allowedRoles={['EXPERT', 'ADMIN']}>
                    <AssignedUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expert/user/:userId"
                element={
                  <ProtectedRoute allowedRoles={['EXPERT', 'ADMIN']}>
                    <UserReviewPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Governance Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/models"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <MLManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/datasets"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <DatasetManagementPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
};
