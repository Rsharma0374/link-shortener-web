import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { forgotPasswordService } from '../services/authServices';
import CryptoJS from 'crypto-js';


const ForgotPassword = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 for email, 2 for OTP
  const [loading, setLoading] = useState(false);
  const [otpId, setOtpId] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // For showing error messages
  const [successMessage, setSuccessMessage] = useState(''); // For showing success messages
  const [inputType, setInputType] = useState("text");
  const [identifier, setIdentifier] = useState('');



  const handleOtpChange = (e) => {
    setOtp(e.target.value);

    // Set the input type to "text" when typing starts
    setInputType("text");

    // Convert to "password" after 2 seconds
    setTimeout(() => {
      setInputType("password");
    }, 2000);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call your API to send OTP
      // await sendOTP(email);
      const res = await forgotPasswordService.sendOTP(identifier);
      if (res && res.oBody && res.oBody.payLoad && res.oBody.payLoad.bSuccess === true) {
        const otpId = res.oBody.payLoad.sOtp;
        setSuccessMessage(res.oBody.payLoad.sMessage)
        setTimeout(() => setSuccessMessage(''), 5000);
        setOtpId(otpId);
        setStep(2); //for otp
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
      console.error('Error sending OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const encryptedValue = CryptoJS.SHA1(otp + otpId).toString(CryptoJS.enc.Hex);
        // Add your signup logic here
        const res = await forgotPasswordService.validateOtpRestPassword(otp, otpId);
        if (res && res.oBody && res.oBody.payLoad && res.oBody.payLoad.sStatus === "SUCCESS" && res.oBody.payLoad.sServerSideValidation === encryptedValue) {
          setSuccessMessage(res.oBody.payLoad.sMessage);
          // Keep loading true until navigation
        setTimeout(() => {
          setLoading(false);
          navigate('/');
        }, 5000);
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
  
        // navigate('/'); // Navigate to login after successful verification
      } catch (error) {
        console.error('Error verifying OTP:', error);
      } finally {
        // setLoading(false);
      }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <button
            onClick={() => step === 1 ? navigate('/') : setStep(1)}
            className="absolute left-4 top-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'Forgot Password' : 'Enter OTP'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1
              ? 'Enter your email to receive the OTP'
              : 'Enter the OTP sent to your email'}
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

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={inputType}
                placeholder="Enter OTP"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                className="w-full px-4 py-2 text-center text-lg tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Didn't receive OTP? Try again
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Remember your password?</span>{' '}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-500"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;