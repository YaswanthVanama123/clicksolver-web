// VerificationScreen.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiFacebook, FiInstagram } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

// Example background image URL
const BG_IMAGE_URL = 'https://i.postimg.cc/zB1C8frj/Picsart-24-10-01-15-26-57-512-1.jpg';

const VerificationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Extract phoneNumber and verificationId passed via navigation state
  const { phoneNumber, verificationId } = location.state || {};
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  // Timer state (2 minutes countdown)
  const [timer, setTimer] = useState(120);
  // OTP code state: an array of 4 digits
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  // Create refs for OTP inputs
  const inputs = useRef([]);

  // Countdown timer effect
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // Format timer as mm:ss
  const formattedTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  // Handle OTP input change
  const handleChangeText = (value, index) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < newCode.length - 1 && inputs.current[index + 1]) {
      inputs.current[index + 1].focus();
    }
  };

  // Handle key press for backspace navigation
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0 && inputs.current[index - 1]) {
      inputs.current[index - 1].focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  // Submit OTP validation
  const submitOtp = async () => {
    const otpCode = code.join('');
    if (otpCode.length < 4) {
      alert('Please enter the complete 4-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const validateResponse = await axios.get('https://backend.clicksolver.com/api/validate', {
        params: { mobileNumber: phoneNumber, verificationId, otpCode },
      });
      if (validateResponse.data.message === 'OTP Verified') {
        const loginResponse = await axios.post('https://backend.clicksolver.com/api/user/login', {
          phone_number: phoneNumber,
        });
        if (loginResponse.status === 200) {
          const { token } = loginResponse.data;
          localStorage.setItem('cs_token', token);
          // Reset navigation to the home screen (adjust as needed)
          navigate('/', { replace: true });
        } else if (loginResponse.status === 205) {
          navigate('/signup-details', { state: { phone_number: phoneNumber } });
        }
      } else {
        alert('Invalid OTP, please try again.');
      }
    } catch (error) {
      console.error('Error during OTP validation or login:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Background Image */}
      <img
        src={BG_IMAGE_URL}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-white dark:bg-gray-800 bg-opacity-90 rounded-lg shadow-lg p-6 w-full max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            Verification Code
          </h1>
          <p className="text-base md:text-lg text-center text-gray-600 dark:text-gray-300">
            Please enter the 4-digit code sent on
          </p>
          <p className="text-base md:text-lg font-bold text-center text-gray-900 dark:text-gray-300 my-4">
            {phoneNumber}
          </p>

          {/* OTP Inputs */}
          <div className="flex justify-center space-x-2 mb-4">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                autoFocus={index === 0}
                ref={(ref) => (inputs.current[index] = ref)}
                onChange={(e) => handleChangeText(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 md:w-14 md:h-14 border border-gray-300 dark:border-gray-500 rounded-lg text-center text-xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
            ))}
          </div>

          {/* Timer */}
          <p className="text-xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {formattedTime()}
          </p>

          {/* Submit Button */}
          <button
            onClick={submitOtp}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold shadow-md mb-6"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Loading...
              </div>
            ) : (
              'Submit'
            )}
          </button>

          {/* Contact Section */}
          <div className="text-center">
            <p className="text-base md:text-lg text-gray-900 dark:text-white mb-2">Contact us:</p>
            <div className="flex justify-center space-x-2 mb-2">
              <FiMail size={20} color={isDarkMode ? '#fff' : '#9e9e9e'} />
              <FiFacebook size={20} color={isDarkMode ? '#fff' : '#9e9e9e'} />
              <FiInstagram size={20} color={isDarkMode ? '#fff' : '#9e9e9e'} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Clicksolver@yahoo.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationScreen;
