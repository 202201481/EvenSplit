import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import Friends from './pages/Friends';
import Groups from './pages/Groups';
import Settlements from './pages/Settlements';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Private Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/bills" element={
              <PrivateRoute>
                <Bills />
              </PrivateRoute>
            } />
            <Route path="/friends" element={
              <PrivateRoute>
                <Friends />
              </PrivateRoute>
            } />
            <Route path="/groups" element={
              <PrivateRoute>
                <Groups />
              </PrivateRoute>
            } />
            <Route path="/settlements" element={
              <PrivateRoute>
                <Settlements />
              </PrivateRoute>
            } />
            <Route path="/analytics" element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
