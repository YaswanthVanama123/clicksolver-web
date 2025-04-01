// LoginScreen.js
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import { useTheme } from '../context/ThemeContext';

const BG_IMAGE_URL = 'https://i.postimg.cc/rFFQLGRh/Picsart-24-10-01-15-38-43-205.jpg';
const LOGO_URL = 'https://i.postimg.cc/hjjpy2SW/Button-1.png';
const FLAG_ICON_URL = 'https://i.postimg.cc/C1hkm5sR/india-flag-icon-29.png';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Although we can use isDarkMode from context, Tailwind's dark mode variants will work 
  // if the "dark" class is set on the root element.
  // const { isDarkMode } = useTheme();

  // Request OTP function
  const requestOtp = useCallback(async () => {
    if (!phoneNumber) {
      alert('Please enter a valid phone number.');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        'https://backend.clicksolver.com/api/otp/send',
        { mobileNumber: phoneNumber }
      );
      if (response.status === 200) {
        const { verificationId } = response.data;
        // Navigate to Verification Screen and pass state
        navigate('/verification', { state: { phoneNumber, verificationId } });
      } else {
        console.error('Error sending OTP:', response.data);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, navigate]);

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Background Image */}
      <img
        src={BG_IMAGE_URL}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-6">
              <img
                src={LOGO_URL}
                alt="Logo"
                className="w-16 h-16 md:w-20 md:h-20 mb-2"
              />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Click <span className="font-bold">Solver</span>
              </h1>
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
                ALL HOME Service Expert
              </p>
              <p className="text-sm md:text-md text-gray-600 dark:text-gray-400 mt-1">
                Instant Affordable Trusted
              </p>
            </div>

            {/* Input Container */}
            <div className="flex flex-row items-center bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md overflow-hidden mb-6 h-14">
              {/* Country Code Box */}
              <div className="flex flex-row items-center border-r border-gray-300 dark:border-gray-600 px-3">
                <img
                  src={FLAG_ICON_URL}
                  alt="Flag"
                  className="w-6 h-6 md:w-7 md:h-7"
                />
                <span className="ml-2 text-base md:text-lg text-gray-800 dark:text-gray-100 font-semibold">
                  +91
                </span>
              </div>
              {/* Phone Input */}
              <input
                type="tel"
                placeholder="Enter Mobile Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
                className="flex-1 px-3 text-gray-800 dark:text-gray-100 outline-none bg-transparent"
              />
            </div>

            {/* Button */}
            <button
              onClick={requestOtp}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold shadow-md"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  <span className="ml-2">Loading...</span>
                </div>
              ) : (
                <span>Get Verification Code</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay (Optional) */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
