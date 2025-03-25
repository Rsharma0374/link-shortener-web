import React, { useState } from 'react';
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
import { authService } from '../services/api';
import CryptoJS from 'crypto-js';

const EMAIL_OTP_SMS = 'EMAIL_OTP_SMS';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const otpValidationSchema = yup.object({
  otp: yup.string().required('OTP is required').length(6, 'OTP must be 6 digits'),
});

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState(1); // 1: Signup form, 2: OTP verification
  const [otpId, setOtpId] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
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

  async function handleSubmit(formData: any) {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await authService.sendEmailVerificationOTP(formData.email, EMAIL_OTP_SMS);
      if (res && res.oBody && res.oBody.payLoad && res.oBody.payLoad.bSuccess === true) {
        const otpId = res.oBody.payLoad.sOtp;
        setOtpId(otpId);
        setStep(2);
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
      const res = await authService.validateOTP(values.otp, otpId);
      
      if (res && res.oBody && res.oBody.payLoad && 
          res.oBody.payLoad.sStatus === "SUCCESS" && 
          res.oBody.payLoad.sEncryptedValue === encryptedValue) {
        setSuccessMessage(res.oBody.payLoad.sResponse);
        setTimeout(() => setSuccessMessage(''), 2000);
        await callSignupApi(formik.values);
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
      console.error('Error verifying OTP:', error);
      setErrorMessage("Failed to verify OTP. Please try again.");
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  }

  async function callSignupApi(formData: any) {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await authService.signup(formData);
      if (res && res.oBody && res.oBody.payLoad && res.oBody.payLoad.sStatus === "SUCCESS") {
        setSuccessMessage(res.oBody.payLoad.sResponseMessage);
        setTimeout(() => {
          setLoading(false);
          navigate('/');
        }, 2000);
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
      console.error('Error while signup api calling:', error);
      setErrorMessage("An error occurred during signup. Please try again.");
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  }

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
            {step === 1 ? 'Sign Up' : 'Verify OTP'}
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
                id="name"
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                margin="normal"
              />
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
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                {loading ? <CircularProgress size={24} /> : 'Sign Up'}
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
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
              </Button>
            </form>
          )}

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Button
                color="primary"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                Login
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}; 