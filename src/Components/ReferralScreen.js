import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  IoArrowBack,
  IoCopyOutline,
  IoDocumentTextOutline,
  IoPersonAddOutline,
  IoGiftOutline,
  IoLogoWhatsapp,
  IoLinkOutline,
  IoShareSocialOutline,
  IoCall,
} from 'react-icons/io5';

const ReferralScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [referralCode, setReferralCode] = useState(null);
  const [referralLink, setReferralLink] = useState(null);
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Fetch referral data
  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const token = localStorage.getItem('cs_token');
        if (!token) {
          console.error('No token found in storage.');
          return;
        }
        const response = await axios.get(
          'https://backend.clicksolver.com/api/user/referrals',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.length > 0) {
          const data = response.data[0];
          const code = data.referralcode;
          setReferralCode(code);
          // Construct referral link (sample)
          setReferralLink(
            'https://play.google.com/store/apps/details?id=com.userapp1'
          );
          // Transform referral data
          const transformedData = response.data
            .filter(item => item.name)
            .map((item, index) => ({
              id: index,
              name: item.name,
              status: item.status_completed
                ? t('completed') || 'Completed'
                : t('pending') || 'Pending',
            }));
          setReferrals(transformedData);
        } else {
          setReferrals([]);
        }
      } catch (error) {
        console.log('Error fetching referrals:', error);
      }
    };

    fetchReferrals();
  }, [t]);

  // --------------- COPY & SHARE HELPERS ---------------
  const copyCodeToClipboard = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      alert('Referral code copied!');
    }
  };

  const copyLinkToClipboard = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      alert('Referral link copied!');
    }
  };

  const shareReferralCode = async () => {
    try {
      const message =
        t('share_message', { referralCode, referralLink }) ||
        `Join me on this amazing app! Use my referral code: ${referralCode}. Download the app now: ${referralLink}`;
      if (navigator.share) {
        await navigator.share({ message });
      } else {
        alert(message);
      }
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };

  const shareViaWhatsApp = () => {
    const message =
      t('share_message', { referralCode, referralLink }) ||
      `Join me on this amazing app! Use my referral code: ${referralCode}. Download the app now: ${referralLink}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank') ||
      console.log(
        t('whatsapp_not_installed') ||
          'WhatsApp is not installed or not supported on this device.'
      );
  };

  const inviteViaSMS = (phoneNumber) => {
    if (!phoneNumber) return;
    const smsMessage =
      t('share_message', { referralCode, referralLink }) ||
      `Join me on this amazing app! Use my referral code: ${referralCode}. Download the app now: ${referralLink}`;
    const url = `sms:${phoneNumber}?body=${encodeURIComponent(smsMessage)}`;
    window.open(url, '_self');
  };

  // ---------------- CONTACTS (Web limitation) ----------------
  const fetchContacts = async () => {
    alert('Contact fetching is not supported on the web.');
    // Optionally, you might simulate contacts here.
    // setContacts(simulatedContacts);
    // setShowContacts(true);
  };

  // --------------- RENDER HELPERS ---------------
  const renderReferralItem = (item) => (
    <div
      key={item.id}
      className={`flex items-center mb-3 p-2 rounded shadow bg-${
        isDarkMode ? 'gray-800' : 'gray-100'
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center mr-3">
        <span className="text-white font-bold text-lg">
          {item.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1">
        <p className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {item.name}
        </p>
        <p
          className={`text-sm mt-1 ${
            item.status === (t('pending') || 'Pending')
              ? 'text-yellow-500'
              : 'text-green-600'
          }`}
        >
          {item.status}
        </p>
      </div>
    </div>
  );

  const renderContactItem = (item) => {
    const phoneNumber =
      item.phoneNumbers && item.phoneNumbers.length > 0
        ? item.phoneNumbers[0].number.replace(/\s+/g, '')
        : null;
    return (
      <div
        key={item.recordID}
        className={`flex items-center mb-3 p-2 rounded shadow bg-${
          isDarkMode ? 'gray-800' : 'gray-100'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mr-3">
          <span className="text-white font-bold text-xl">
            {item.displayName ? item.displayName.charAt(0).toUpperCase() : '?'}
          </span>
        </div>
        <div className="flex-1">
          <p className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {item.displayName}
          </p>
          {phoneNumber && <p className="text-sm text-gray-500 mt-1">{phoneNumber}</p>}
        </div>
        <button
          className="bg-orange-500 text-white py-1 px-3 rounded"
          onClick={() => inviteViaSMS(phoneNumber)}
        >
          {t('invite') || 'Invite'}
        </button>
      </div>
    );
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen`}>
      <div className="p-4">
        {/* Header Section */}
        <div className="relative text-center">
          <button className="absolute left-4 top-4 focus:outline-none" onClick={() => navigate(-1)}>
            <IoArrowBack size={24} />
          </button>
          <h1 className="mt-10 text-2xl font-bold">{t('refer_friends') || 'Refer Friends'}</h1>
          <p className="mt-2 text-lg">{t('invite_your_friends') || 'Invite your friends'}</p>
          <p className="mt-1 text-sm text-center text-gray-400">
            {t('sub_description') || '...to the cool new way of managing money!'}
          </p>
        </div>

        {/* Orange Card - "How It Works" */}
        <div className="bg-orange-500 rounded-lg p-4 my-4 mx-4">
          <div className="flex items-center mb-3">
            <IoDocumentTextOutline size={20} color="#fff" />
            <p className="ml-2 text-white text-sm">
              {t('share_referral_link') ||
                'Share your referral link or code with a friend.'}
            </p>
          </div>
          <div className="flex items-center mb-3">
            <IoPersonAddOutline size={20} color="#fff" />
            <p className="ml-2 text-white text-sm">
              {t('friend_joins') ||
                'Your friend joins using your link or code.'}
            </p>
          </div>
          <div className="flex items-center">
            <IoGiftOutline size={20} color="#fff" />
            <p className="ml-2 text-white text-sm">
              {t('enjoy_benefits') ||
                'Both you and your friend enjoy amazing benefits.'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-300 mx-4 mt-4">
          <button
            className={`flex-1 py-2 text-center text-base ${
              !showContacts
                ? 'border-b-4 border-orange-500 text-orange-500'
                : 'text-gray-600'
            }`}
            onClick={() => setShowContacts(false)}
          >
            {t('your_referrals') || 'Your Referrals'}
          </button>
          <button
            className={`flex-1 py-2 text-center text-base ${
              showContacts
                ? 'border-b-4 border-orange-500 text-orange-500'
                : 'text-gray-600'
            }`}
            onClick={fetchContacts}
          >
            {t('invite_contacts') || 'Invite Contacts'}
          </button>
        </div>

        {/* List Section */}
        <div className="mx-4 mt-4">
          {!showContacts ? (
            referrals.length > 0 ? (
              referrals.map((item) => renderReferralItem(item))
            ) : (
              <p className="text-center mt-6 text-base text-gray-500">
                {t('no_referrals') || 'No referrals yet.'}
              </p>
            )
          ) : (
            contacts.length > 0 ? (
              contacts.map((item) => renderContactItem(item))
            ) : (
              <p className="text-center mt-6 text-base text-gray-500">
                {t('no_contacts') || 'No contacts available.'}
              </p>
            )
          )}
        </div>

        {/* Referral Code + Copy Section */}
        <div className="flex items-center justify-between mx-4 my-4">
          <p className="text-base font-medium">
            {t('your_code') || 'Your Code:'}
          </p>
          <button
            className="flex items-center bg-orange-500 rounded px-3 py-2 focus:outline-none"
            onClick={copyCodeToClipboard}
          >
            <span className="text-white font-bold text-sm">
              {referralCode || 'N/A'}
            </span>
            <IoCopyOutline size={18} className="ml-2 text-white" />
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex justify-between mx-4 mb-4">
          <button
            className="flex-1 bg-orange-500 p-3 rounded-full mx-1 focus:outline-none"
            onClick={shareViaWhatsApp}
          >
            <IoLogoWhatsapp size={22} color="#fff" />
          </button>
          <button
            className="flex-1 bg-orange-500 p-3 rounded-full mx-1 focus:outline-none"
            onClick={copyLinkToClipboard}
          >
            <IoLinkOutline size={22} color="#fff" />
          </button>
          <button
            className="flex-1 bg-orange-500 p-3 rounded-full mx-1 focus:outline-none"
            onClick={shareReferralCode}
          >
            <IoShareSocialOutline size={22} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralScreen;
