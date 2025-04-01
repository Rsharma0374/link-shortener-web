import {React, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import { MainLayout } from './layouts/MainLayout';
import { AuthProvider } from './context/AuthContext';

function App() {

  useEffect(() => {
    const handleUnload = () => {
      // initializeAESKey();
      sessionStorage.clear();
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (


    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <MainLayout>
              <Login />
            </MainLayout>
          } />
          <Route path="/signup" element={
            <MainLayout>
              <Signup />
            </MainLayout>
          } />
          <Route path="/forgot-password" element={
            <MainLayout>
              <ForgotPassword />
            </MainLayout>
          } />
          <Route path="/dashboard" element={
              <Dashboard />
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
