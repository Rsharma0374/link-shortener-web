import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import CryptoJS from 'crypto-js';
import { authService } from '../services/api';
import { LoginResponse, OTPResponse } from '../types';
import { hashPassword } from '../services/EncryptionService'


const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
});

const otpValidationSchema = yup.object({
  otp: yup.string().required('OTP is required').length(6, 'OTP must be 6 digits'),
});

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, updateToken } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [otpId, setOtpId] = useState('');
  const [username, setUsername] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (timeLeft > 0 && !otpExpired) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setOtpExpired(true);
    }
    return () => clearInterval(timer);
  }, [timeLeft, otpExpired]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });

  const otpFormik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: otpValidationSchema,
    onSubmit: handleOTPSubmit,
  });

  async function handleSubmit(values: any) {
    setLoading(true);
    setErrorMessage('');
    try {
      const bCryptPassword = await hashPassword(values.password);
      if (!bCryptPassword) {
        throw new Error("Failed to hash password");
      }
      const res = await login(values.email, bCryptPassword) as LoginResponse;
      if (res?.oBody?.payLoad?.sStatus === "SUCCESS") {
        const otpId = res.oBody.payLoad.sOtpToken;
        setSuccessMessage(res.oBody.payLoad.sResponse);
        setTimeout(() => setSuccessMessage(''), 5000);
        setOtpId(otpId);
        setStep(2);
        setTimeLeft(120);
        setOtpExpired(false);
        setUsername(res.oBody.payLoad.sUsername);
      } else if (res?.aError && res.aError.length > 0) {
        const error = res.aError[0];
        if (error) {
          setErrorMessage(error.sMessage);
          setTimeout(() => setErrorMessage(''), 5000);
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
          setTimeout(() => setErrorMessage(''), 5000);
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please contact system administrator.");
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error occurred while sending otp:', error);
      setErrorMessage("Failed to send OTP. Please check your network connection and try again.");
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  }

  async function handleOTPSubmit(values: any) {
    setLoading(true);
    try {
      const encryptedValue = CryptoJS.SHA1(values.otp + otpId).toString(CryptoJS.enc.Hex);
      const res = await authService.validate2FAOTP(values.otp, otpId, formik.values.email) as OTPResponse;
      
      if (res?.oBody?.payLoad?.sStatus === "SUCCESS" && 
          res.oBody.payLoad.sEncryptedValue === encryptedValue) {
        setSuccessMessage(res.oBody.payLoad.sResponse);
        setTimeout(() => setSuccessMessage(''), 5000);
        const token = res.oBody.payLoad.sToken;
        handleUpdateToken(token);
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('identifier', formik.values.email);
        sessionStorage.setItem('username', username);
        navigate('/dashboard');
      } else if (res?.aError && res.aError.length > 0) {
        const error = res.aError[0];
        if (error) {
          setErrorMessage(error.sMessage);
          setTimeout(() => setErrorMessage(''), 5000);
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
          setTimeout(() => setErrorMessage(''), 5000);
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please contact system administrator.");
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrorMessage("Failed to verify OTP. Please try again.");
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateToken = (token: string) => {
    updateToken(token);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      if (step !== 2 || !formik.values.email) {
        setErrorMessage('Invalid state for resend OTP');
        setTimeout(() => setErrorMessage(''), 5000);
        return;
      }

      const res = await login(formik.values.email, formik.values.password);
      if (res && res.oBody && res.oBody.payLoad && res.oBody.payLoad.sStatus === "SUCCESS") {
        const otpId = res.oBody.payLoad.sOtpToken;
        setSuccessMessage(res.oBody.payLoad.sResponse);
        setTimeout(() => setSuccessMessage(''), 5000);
        setOtpId(otpId);
        setTimeLeft(120);
        setOtpExpired(false);
      } else if (res && res.aError && res.aError.length > 0) {
        const error = res.aError[0];
        if (error) {
          setErrorMessage(error.sMessage);
          setTimeout(() => setErrorMessage(''), 5000);
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
          setTimeout(() => setErrorMessage(''), 5000);
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please contact system administrator.");
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error occurred while resending OTP:', error);
      setErrorMessage("Failed to resend OTP. Please check your network connection and try again.");
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 200px)',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            {step === 1 ? 'Login' : 'Verify OTP'}
          </Typography>
          
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {step === 1 ? (
            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                margin="normal"
              />
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                margin="normal"
              />
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpFormik.handleSubmit}>
              <TextField
                fullWidth
                id="otp"
                name="otp"
                label="Enter OTP"
                value={otpFormik.values.otp}
                onChange={otpFormik.handleChange}
                error={otpFormik.touched.otp && Boolean(otpFormik.errors.otp)}
                helperText={otpFormik.touched.otp && otpFormik.errors.otp}
                margin="normal"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Typography>
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                disabled={loading || otpExpired}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
              </Button>
              {otpExpired && (
                <Button
                  color="secondary"
                  variant="text"
                  fullWidth
                  onClick={handleResendOtp}
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  Resend OTP
                </Button>
              )}
            </form>
          )}

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Button
                color="primary"
                onClick={() => navigate('/signup')}
                sx={{ textTransform: 'none' }}
              >
                Sign up
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}; 