import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, CommonActions } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaIndianRupeeSign, FaArrowLeft } from "react-icons/fa6";
import { IoMdAlert } from "react-icons/io";
import { MdChevronRight, MdLocalOffer } from 'react-icons/md';
import Lottie from 'lottie-react';
// import serviceLoadingAnimation from '../assets/serviceLoading.json'; // Uncomment if needed
import { useTheme } from '../context/ThemeContext';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  // Assume encodedId is passed via location.state
  const { encodedId } = location.state || {};

  // State variables
  const [paymentMethod, setPaymentMethod] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [cgstAmount, setCgstAmount] = useState(0);
  const [cashback, setCashback] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [serviceArray, setServiceArray] = useState([]);
  const [vocherModal, setVocherModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [decodedId, setDecodedId] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [value, setValue] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});

  // Decode encodedId and fetch payment details
  const fetchPaymentDetails = useCallback(async (decodedId) => {
    try {
      console.log('[Payment] Fetching payment details for:', decodedId);
      const response = await axios.post(
        'https://backend.clicksolver.com/api/payment/details',
        { notification_id: decodedId }
      );
      const {
        service_booked,
        name,
        area,
        city,
        pincode,
        discount,
        total_cost,
        profile,
      } = response.data;

      setDiscount(discount || 0);
      setTotalCost(total_cost || 0);
      setPaymentDetails({ city, area, pincode, name, profile });
      setServiceArray(service_booked || []);
      console.log('[Payment] Payment details updated successfully.');
    } catch (error) {
      console.error('[Payment] Error fetching payment details:', error);
    }
  }, []);

  useEffect(() => {
    if (encodedId) {
      try {
        const decoded = atob(encodedId);
        console.log('[Payment] Decoded encodedId:', decoded);
        setDecodedId(decoded);
        fetchPaymentDetails(decoded);
      } catch (error) {
        console.error('[Payment] Error decoding Base64:', error);
      }
    }
  }, [encodedId, fetchPaymentDetails]);

  const toggleVocher = () => {
    setVocherModal((prev) => !prev);
    console.log('[Payment] Toggled voucher modal');
  };

  const togglePayment = () => {
    setPaymentModal((prev) => !prev);
    console.log('[Payment] Toggled payment modal');
  };

  const applyCoupon = () => {
    console.log('[Payment] Apply coupon code:', value);
    // Implement your coupon logic here
  };

  const onBackPress = () => {
    navigate('/home', { replace: true });
  };

  const openPhonePeScanner = () => {
    const url = 'phonepe://scan';
    window.open(url, '_blank') ||
      window.open('https://play.google.com/store/apps/details?id=com.phonepe.app', '_blank');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'} flex flex-col`}>
      {/* Header */}
      <header className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button onClick={onBackPress} className="text-gray-500">
          <FaArrowLeft size={20} />
        </button>
        <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {t('payment_screen') || 'Payment Screen'}
        </h1>
        <div>{/* Empty placeholder for alignment */}</div>
      </header>

      {/* Main content scrollable area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Service Summary Section */}
        <section className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-4 rounded-lg shadow mb-4`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
            {t('service_summary') || 'Service Summary'}
          </h2>
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={paymentDetails.profile || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <p className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {paymentDetails.name}
              </p>
            </div>
          </div>
          <div className={`bg-${isDarkMode ? 'gray-700' : 'gray-100'} p-3 rounded mb-4`}>
            <div className="flex justify-between mb-2">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('commander_name') || 'Commander Name'}
                </p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {paymentDetails.name}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('services') || 'Services'}
                </p>
                {serviceArray.map((service, index) => (
                  <p key={index} className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {t(`singleService_${service.main_service_id}`) || service.serviceName}
                  </p>
                ))}
              </div>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('location') || 'Location'}
            </p>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {paymentDetails.area}
            </p>
          </div>
        </section>

        {/* Payment Summary Section */}
        <section className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-4 rounded-lg shadow mb-4`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {t('payment_summary') || 'Payment Summary'}
            </h2>
            <button onClick={togglePayment} className="text-gray-400">
              <MdChevronRight size={20} />
            </button>
          </div>
          {paymentModal ? (
            <>
              <div className="flex flex-col space-y-2">
                {serviceArray.map((service, index) => (
                  <div key={index} className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {t(`singleService_${service.main_service_id}`) || service.serviceName}
                    </span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      ₹ {service.cost ? service.cost.toFixed(2) : '0.00'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('gst')}</span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>₹ 0.00</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('cgst')}</span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>₹ 0.00</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between mt-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('cashback') || 'Cashback'}
                  </span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>- ₹ {discount}</span>
                </div>
              )}
              <div className="border-t border-gray-300 dark:border-gray-600 my-2"></div>
              <div className="flex justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('paid_via_scan') || 'Paid Via Scan'}
                </span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t('grand_total') || 'Grand Total'} ₹ {totalCost}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-orange-600 w-8 h-8 rounded-full flex items-center justify-center">
                  <FaIndianRupeeSign size={15} color="#FFFFFF" />
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t('to_pay') || 'To Pay'} ₹ <span className="font-bold">{totalCost}</span>
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Voucher Section */}
        <section className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-4 rounded-lg shadow mb-4`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MdLocalOffer size={24} className="text-gray-500" />
              <p className="text-sm text-gray-600">
                {t('add_coupon') || 'Add Coupon to get cashback'}
              </p>
            </div>
            <button onClick={toggleVocher} className="text-gray-400">
              <MdChevronRight size={20} />
            </button>
          </div>
          {vocherModal && (
            <div className="mt-4">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={t('enter_voucher') || 'Enter voucher code'}
                  className="flex-1 p-2 text-sm text-gray-800 dark:text-white bg-transparent outline-none"
                />
                <button
                  onClick={applyCoupon}
                  disabled={!value}
                  className={`p-2 text-sm rounded ${value ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                >
                  {t('apply') || 'Apply'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Notice Section */}
        <div className="flex items-center space-x-2 my-4">
          <IoMdAlert size={16} className="text-gray-500" />
          <p className="text-sm text-gray-600">
            {t('spare_parts_excluded') || 'Spare parts are not included in this payment'}
          </p>
        </div>
      </div>

      {/* Bottom Bar for Payment */}
      <footer className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('service_cost') || 'Service cost'}</p>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>₹ {totalCost}</p>
        </div>
        <button
          onClick={openPhonePeScanner}
          className="bg-orange-600 text-white py-2 px-4 rounded-full"
        >
          {t('pay_now') || 'Pay Now'}
        </button>
      </footer>
    </div>
  );
};

export default Payment;
