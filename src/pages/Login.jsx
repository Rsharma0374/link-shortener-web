import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hashPassword } from '../services/EncryptionServices'
import { login, validate2FAOTP } from '../services/authServices';
import CryptoJS from 'crypto-js';
import { useAuth } from '../context/AuthContext';


const Login = () => {
  const navigate = useNavigate();
  const { updateToken } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState('');
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState(''); // For showing error messages
  const [successMessage, setSuccessMessage] = useState(''); // For showing success messages
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Timer state
  const [otpVerified, setOtpVerified] = useState(false); // Tracks OTP success
  const [otpExpired, setOtpExpired] = useState(false); // Tracks if OTP has expired
  const [username, setUsername] = useState(''); // For username



  useEffect(() => {
    if (otpVerified) {
      setTimeLeft(0); // Stop the timer
      setOtpExpired(false); // Ensure no "expired" message is shown
      return;
    }

    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timerId); // Cleanup interval
    } else {
      setOtpExpired(true); // Mark OTP as expired
    }
  }, [timeLeft, otpVerified]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      const bCryptPassword = await hashPassword(password)

      if (step === 1) {
        const res = await login(identifier, bCryptPassword);
        if (res && res.oBody && res.oBody.payLoad && res.oBody.payLoad.sStatus === "SUCCESS") {
          const otpId = res.oBody.payLoad.sOtpToken;
          setSuccessMessage(res.oBody.payLoad.sResponse)
          setTimeout(() => setSuccessMessage(''), 5000);
          setOtpId(otpId);
          setStep(2); //for otp
          setTimeLeft(120); // Start 2-minute timer
          setOtpExpired(false)
          setUsername(res.oBody.payLoad.sUsername)


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
      } else {
        const encryptedValue = CryptoJS.SHA1(otp + otpId).toString(CryptoJS.enc.Hex);
        // Add your signup logic here
        const res = await validate2FAOTP(otp, otpId, username);
        if (res && res.oBody && res.oBody.payLoad && res.oBody.payLoad.sStatus === "SUCCESS" && res.oBody.payLoad.sEncryptedValue === encryptedValue) {
          setSuccessMessage(res.oBody.payLoad.sResponse);
          setTimeout(() => setSuccessMessage(''), 5000);
          setOtpVerified(true)
          const token = res.oBody.payLoad.sToken;
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('identifier', identifier);
          sessionStorage.setItem('username', username);
          handleUpdateToken(token)
          // Call password manager dashboard api
          navigate('/dashboard')
        } else if (res && res.aError && res.aError.length > 0) {
          const error = res.aError[0];
          if (error) {
            setErrorMessage(error.sMessage);
            setTimeout(() => setErrorMessage(''), 5000);
            setLoading(false);
          } else {
            setErrorMessage("An unexpected error occurred. Please try again.");
            setTimeout(() => setErrorMessage(''), 5000);
            setLoading(false);
          }
        } else {
          setErrorMessage("An unexpected error occurred. Please contact system administrator.");
          setTimeout(() => setErrorMessage(''), 5000);
          setLoading(false);
        }
      }

    } catch (error) {
      console.error('Error occurred while sending otp:', error);
      setErrorMessage("Failed to send OTP. Please check your network connection and try again.");
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }

  };

  const handleUpdateToken = (token) => {
    updateToken(token);
  };

  const handleResendOtp = async () => {
    setLoading(true); // Show loading indicator
    try {
      if (step !== 2 || !identifier) {
        // Handle invalid state (not in step 2 or missing identifier)
        setErrorMessage('Invalid state for resend OTP');
        setTimeout(() => setErrorMessage(''), 5000);
        return;
      }
      const bCryptPassword = await hashPassword(password)

      // Call your login API to resend OTP
      const res = await login(identifier, bCryptPassword); // Assuming login API can resend OTP
      if (res && res.oBody && res.oBody.payLoad && res.oBody.payLoad.sStatus === "SUCCESS") {
        const otpId = res.oBody.payLoad.sOtpToken;
        setSuccessMessage(res.oBody.payLoad.sResponse);
        setTimeout(() => setSuccessMessage(''), 5000);
        setOtpId(otpId);
        setTimeLeft(120); // Reset timer for 2 minutes
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
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'Welcome back' : 'Enter OTP'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1
              ? 'Please sign in to continue'
              : otpVerified
                ? 'OTP successfully verified. Redirecting...'
                : otpExpired
                  ? 'Your OTP has expired. Please resend.'
                  : `We sent a code to your email. Time remaining: ${Math.floor(timeLeft / 60)}:${timeLeft % 60}`}
          </p>
        </div>
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {errorMessage}
          </div>
        )}
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 text-sm text-green-700 bg-green-100 rounder-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <>
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Email or Username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-500">
                    Remember me
                  </label>
                </div>
                <button
                  onClick={() => navigate('/forgot-password')}
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 text-center text-lg tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                maxLength={6}
                required
              />
              <p className="text-center text-sm text-gray-500">
                Didn't receive code?{' '}
                <button
                  onClick={handleResendOtp}
                  type="button"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Resend
                </button>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {loading ? (
              step === 1 ? "Sending OTP..." : "Verifying..." // Display "Verifying..." in step 2
            ) : step === 1 ? (
              "Continue"
            ) : (
              "Verify and Login"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Don't have an account?</span>{' '}
          <button onClick={() => navigate('/signup')} className="text-blue-600 hover:text-blue-500">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;