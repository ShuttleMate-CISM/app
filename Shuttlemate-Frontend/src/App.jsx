import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Splashscreen from './pages/Splashscreen';
import VideoPage from './pages/VideoPage';
import Coachers from './pages/Coachers';
import Court from './pages/court';
import Shop from './pages/shop';
import Payment from './pages/payment';
import Users from './pages/Users';
import MatchTimeLine from './pages/MatchTImeLine';
import Timeline from './pages/timeline';
import Unauthorized from './pages/Unauthorized';
import News from './pages/News';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/Splashscreen" />} />
          <Route path="/Splashscreen" element={<Splashscreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* General protected routes (any authenticated user) */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/Videopage" 
            element={
              <ProtectedRoute>
                <VideoPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/timeline" 
            element={
              <ProtectedRoute>
                <Timeline />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/News" 
            element={
              <ProtectedRoute>
                <News />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/Matchtimeline" 
            element={
              <ProtectedRoute>
                <MatchTimeLine />
              </ProtectedRoute>
            } 
          />

      <Route 
                  path="/Users" 
                  element={
                    <ProtectedRoute>
                      <Users />
                    </ProtectedRoute>
                  } 
                />
          {/* Role-specific protected routes */}
          <Route 
            path="/Coachers" 
            element={
              <ProtectedRoute allowedRoles={['coach', 'admin']}>
                <Coachers />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/Court" 
            element={
              <ProtectedRoute allowedRoles={['courtowner', 'admin']}>
                <Court />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/shop" 
            element={
              <ProtectedRoute allowedRoles={['shopowner', 'admin']}>
                <Shop />
              </ProtectedRoute>
            } 
          />

            <Route 
            path="/payment" 
            element={
              <ProtectedRoute allowedRoles={['shopowner', 'admin']}>
                <Payment />
              </ProtectedRoute>
            } 
          />

          

          
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;