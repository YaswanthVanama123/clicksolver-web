import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaArrowLeft, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

// Memoized InputField component using Tailwind CSS
const InputField = React.memo(({ placeholder, value, onChange, icon, keyboardType = 'text', editable = true }) => {
  // Map keyboard types to input types
  const inputType =
    keyboardType === 'email-address' ? 'email' : keyboardType === 'phone-pad' ? 'tel' : 'text';

  return (
    <div className="w-full max-w-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg h-12 flex items-center px-2.5 mb-5">
      {icon && <span>{icon}</span>}
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!editable}
        className={`flex-1 ${icon ? 'ml-2.5' : ''} text-base text-gray-800 dark:text-white bg-transparent outline-none`}
      />
    </div>
  );
});

const SignUpScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  // Extract optional serviceName from location state
  const { serviceName } = location.state || {};

  // If the previous route passed a phone number in state, load it
  useEffect(() => {
    if (location.state && location.state.phone_number) {
      setPhoneNumber(location.state.phone_number);
    }
  }, [location.state]);

  // Memoized email icon to avoid re-renders
  const emailIcon = useMemo(
    () => <FaEnvelope size={20} color={isDarkMode ? '#ffffff' : '#000080'} />,
    [isDarkMode]
  );

  const handleSignUp = async () => {
    if (!isPrivacyAccepted) {
      alert('Please accept the Privacy Policy to complete signup.');
      return;
    }
    try {
      const response = await axios.post('https://backend.clicksolver.com/api/user/signup', {
        fullName,
        email,
        phoneNumber,
        referralCode,
      });

      const { token } = response.data;
      console.log(response.data);
      if (token) {
        // Using localStorage in place of EncryptedStorage
        localStorage.setItem('sign_up', 'true');
        localStorage.setItem('cs_token', token); 
        // Check if serviceName exists; if yes, navigate to serviceBooking route
        if (serviceName) {
          navigate('/serviceBooking', { state: { serviceName } });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage =
        error.response?.data?.message || 'An error occurred during sign up. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#121212]' : 'bg-white'} flex flex-col`}>
      <div className="relative flex-grow flex flex-col items-center justify-center p-5">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-2.5 bg-transparent border-none cursor-pointer"
        >
          <FaArrowLeft size={24} color={isDarkMode ? '#ffffff' : '#000080'} />
        </button>

        {/* Title */}
        <h2 className="text-center mb-8 text-blue-900 text-2xl font-bold">Sign Up</h2>

        {/* Full Name Input */}
        <InputField 
          placeholder="Full Name"
          value={fullName}
          onChange={setFullName}
        />

        {/* Email Input with Icon */}
        <InputField
          placeholder="Email Address"
          value={email}
          onChange={setEmail}
          icon={emailIcon}
          keyboardType="email-address"
        />

        {/* Phone Number Input (Non-editable) */}
        <InputField
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={setPhoneNumber}
          keyboardType="phone-pad"
          editable={false}
        />

        {/* Referral Code Input */}
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Enter referral code (optional)"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg h-12 px-2.5 text-base text-gray-800 dark:text-white outline-none mb-5"
          />
        </div>

        {/* Privacy Policy Checkbox */}
        <div className="flex items-center mb-5 w-full max-w-md">
          <button
            onClick={() => setIsPrivacyAccepted(!isPrivacyAccepted)}
            className="mr-2.5 bg-transparent border-none cursor-pointer"
          >
            {isPrivacyAccepted ? (
              <FaCheckSquare size={20} color="#FF4500" />
            ) : (
              <FaRegSquare size={20} color="#FF4500" />
            )}
          </button>
          <span className="text-sm md:text-base text-gray-800 dark:text-gray-300">
            I agree to the{' '}
            <a
              href="https://clicksolver.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF4500] underline"
            >
              Privacy Policy
            </a>
          </span>
        </div>

        {/* Sign Up Button */}
        <button
          onClick={handleSignUp}
          className="w-full max-w-md bg-[#FF4500] rounded-lg h-12 flex items-center justify-center mt-5"
        >
          <span className="text-white text-lg font-bold">Sign Up</span>
        </button>
      </div>
    </div>
  );
};

export default SignUpScreen;
