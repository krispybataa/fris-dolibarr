import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import theme
import theme from './theme';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import RecordDetailPage from './pages/RecordDetailPage';
import RecordsPage from './pages/RecordsPage';
import TeachingActivitiesPage from './pages/TeachingActivitiesPage';
import AddTeachingActivityPage from './pages/AddTeachingActivityPage';
import EditTeachingActivityPage from './pages/EditTeachingActivityPage';
import ResearchActivitiesPage from './pages/ResearchActivitiesPage';
import AddResearchActivityPage from './pages/AddResearchActivityPage';
import ExtensionActivitiesPage from './pages/ExtensionActivitiesPage';
import AddExtensionActivityPage from './pages/AddExtensionActivityPage';
import UsersPage from './pages/UsersPage';
import PublicationApprovalPage from './pages/PublicationApprovalPage';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin/Dean route component
const AdminDeanRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!(user?.role === 'admin' || user?.isDean)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <AdminDeanRoute>
                  <DashboardPage />
                </AdminDeanRoute>
              } 
            />
            
            <Route 
              path="/records" 
              element={
                <ProtectedRoute>
                  <RecordsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/teaching" 
              element={
                <ProtectedRoute>
                  <TeachingActivitiesPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/teaching/add" 
              element={
                <ProtectedRoute>
                  <AddTeachingActivityPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/teaching/:type/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditTeachingActivityPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/research" 
              element={
                <ProtectedRoute>
                  <ResearchActivitiesPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/research/add" 
              element={
                <ProtectedRoute>
                  <AddResearchActivityPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/extension" 
              element={
                <ProtectedRoute>
                  <ExtensionActivitiesPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/extension/add" 
              element={
                <ProtectedRoute>
                  <AddExtensionActivityPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/publications/:id" 
              element={
                <ProtectedRoute>
                  <RecordDetailPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/users" 
              element={
                <AdminDeanRoute>
                  <UsersPage />
                </AdminDeanRoute>
              } 
            />
            
            <Route 
              path="/publication-approval" 
              element={
                <AdminDeanRoute>
                  <PublicationApprovalPage />
                </AdminDeanRoute>
              } 
            />
            
            {/* Redirect to home if no route matches */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
