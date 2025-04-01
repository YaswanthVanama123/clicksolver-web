// OrderScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi';
import { MdLocalOffer } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const OrderScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  // serviceName is passed as an array of service objects via navigation state
  const { serviceName } = location.state || {};

  // States
  const [services, setServices] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [offers, setOffers] = useState([]);
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [savings, setSavings] = useState(0);
  const [selectedTip, setSelectedTip] = useState(0);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState({ title: '', message: '' });

  // Refs
  const processingRef = useRef({});

  // Show error modal with title + message
  const showErrorModal = (title, message) => {
    setErrorModalContent({ title, message });
    setErrorModalVisible(true);
  };

  // 1) Load services from navigation state
  useEffect(() => {
    if (serviceName && Array.isArray(serviceName)) {
      const updatedServices = serviceName.map((service) => {
        const baseCost =
          service.quantity > 0 ? service.cost / service.quantity : service.cost;
        const totalCost = baseCost * service.quantity;
        return {
          ...service,
          baseCost,
          totalCost,
          imageUrl: service.url || 'https://via.placeholder.com/100',
        };
      });
      setServices(updatedServices);
    }
  }, [serviceName]);

  // 2) Recalculate totals when services change
  useEffect(() => {
    let tempTotal = 0;
    services.forEach((s) => {
      tempTotal += s.totalCost;
    });
    setTotalPrice(tempTotal);

    if (appliedOffer) {
      validateAndApplyOffer(appliedOffer, tempTotal);
    } else {
      setDiscountedPrice(tempTotal);
      setSavings(0);
    }
  }, [services, appliedOffer, t]);

  // 3) Fetch offers from backend on component mount
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const token = localStorage.getItem('cs_token');
        if (!token) return;

        const response = await axios.get(
          'https://backend.clicksolver.com/api/user/offers',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { offers: fetchedOffers } = response.data;
        setOffers(fetchedOffers);
      } catch (error) {
        console.log('Error fetching offers:', error);
      }
    };
    fetchOffers();
  }, []);

  // 4) Adjust quantity logic
  const incrementQuantity = (index) => {
    setServices((prev) => {
      const updated = [...prev];
      updated[index].quantity += 1;
      updated[index].totalCost = updated[index].baseCost * updated[index].quantity;
      return updated;
    });
  };
  
  const decrementQuantity = (index) => {
    setServices((prev) => {
      const updated = [...prev];
      if (updated[index].quantity > 1) {
        updated[index].quantity -= 1;
      }
      updated[index].totalCost = updated[index].baseCost * updated[index].quantity;
      return updated;
    });
  };

  // 5) Validate & Apply Offer
  const validateAndApplyOffer = async (offerCode, currentTotal) => {
    try {
      const token = localStorage.getItem('cs_token');
      if (!token) {
        showErrorModal(
          t('authentication_error') || 'Authentication Error',
          t('user_not_logged_in') || 'User not logged in.'
        );
        return;
      }

      const response = await axios.post(
        'https://backend.clicksolver.com/api/user/validate-offer',
        { offer_code: offerCode, totalAmount: currentTotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { valid, discountAmount, newTotal, error } = response.data;

      if (!valid) {
        showErrorModal(
          t('offer_not_valid') || 'Offer Not Valid',
          error || t('offer_not_applicable') || 'This offer is not applicable.'
        );
        setAppliedOffer(null);
        setDiscountedPrice(currentTotal);
        setSavings(0);
        return;
      }

      setDiscountedPrice(newTotal);
      setSavings(discountAmount);
      setAppliedOffer(offerCode);
    } catch (error) {
      console.error('Error validating offer:', error);
      showErrorModal(
        t('error') || 'Error',
        t('offer_validation_error') || 'Unable to validate offer at this time.'
      );
    }
  };

  // 6) Handle Offer Button Click
  const handleApplyOffer = async (offerCode) => {
    if (appliedOffer === offerCode) {
      setAppliedOffer(null);
      setDiscountedPrice(totalPrice);
      setSavings(0);
      return;
    }
    await validateAndApplyOffer(offerCode, totalPrice);
  };

  // Calculate final prices
  const finalPrice = appliedOffer ? discountedPrice : totalPrice;
  const finalPriceWithTip = finalPrice + selectedTip;

  // 7) Address Handling
  const addAddress = async () => {
    try {
      const token = localStorage.getItem('cs_token');
      if (token) {
        const params = {
          serviceName: services,
          tipAmount: selectedTip,
          savings,
          ...(appliedOffer && {
            offer: {
              offer_code: appliedOffer,
              discountAmount: savings,
            },
          }),
        };
        navigate('/user-location', { state: params });
      } else {
        console.error('No token found, user must login');
      }
    } catch (error) {
      console.error('Error accessing storage:', error);
    }
  };

  // Navigation: Back button
  const handleBackPress = () => {
    navigate(-1);
  };

  // Render a Service Item
  const renderServiceItem = (item, index) => (
    <div key={index} className="flex justify-between items-center py-1">
      <p className="text-sm text-gray-800 dark:text-gray-100 w-24">
        {t(`singleService_${item.main_service_id}`) || item.serviceName}
      </p>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <button onClick={handleBackPress} className="mr-4">
          <FaArrowLeft size={24} color={isDarkMode ? '#fff' : '#333'} />
        </button>
        <h2 className="text-xl font-semibold">
          {t('my_cart') || 'My Cart'}
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20">
        {/* Cart Items */}
        {services.map((service, index) => (
          <div key={service.main_service_id || index} className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <img
              src={service.imageUrl}
              alt="Item"
              className="w-16 h-16 rounded-md object-cover"
            />
            <div className="flex-1 ml-4">
              <p className="text-base font-medium">
                {t(`singleService_${service.main_service_id}`) || service.serviceName}
              </p>
              <p className="text-sm font-semibold">
                ₹{service.totalCost}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <button
                  onClick={() => decrementQuantity(index)}
                  className="bg-gray-200 dark:bg-gray-700 rounded-md px-2 py-1 text-lg font-bold"
                >
                  -
                </button>
                <span className="mx-2 font-semibold">{service.quantity}</span>
                <button
                  onClick={() => incrementQuantity(index)}
                  className="bg-gray-200 dark:bg-gray-700 rounded-md px-2 py-1 text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add More Items */}
        <div className="px-4 py-3">
          <button onClick={handleBackPress}>
            <p className="text-orange-600 font-semibold">+ {t('add_more_items') || 'Add more items'}</p>
          </button>
        </div>

        {/* Section Divider */}
        <div className="h-2 bg-gray-100 dark:bg-gray-800 w-full"></div>

        {/* Coupon/Offer Section */}
        <div className="px-4 py-3 flex justify-between items-center bg-white dark:bg-gray-900">
          <div className="flex items-center">
            <div className="bg-orange-600 p-1 rounded-sm mr-2">
              <MdLocalOffer size={20} color="#fff" />
            </div>
            <p className="font-bold text-base">{t('apply_coupon') || 'Apply Coupon'}</p>
          </div>
          <button onClick={() => setShowCoupons(!showCoupons)}>
            {showCoupons ? (
              <FiChevronUp size={20} color={isDarkMode ? '#fff' : '#333'} />
            ) : (
              <FiChevronDown size={20} color={isDarkMode ? '#fff' : '#333'} />
            )}
          </button>
        </div>
        {showCoupons && (
          <div className="px-4 py-3 bg-white dark:bg-gray-900">
            {offers.length > 0 ? (
              offers.map((offer) => (
                <div key={offer.offer_code} className="flex items-center mt-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{offer.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{offer.description}</p>
                  </div>
                  {appliedOffer === offer.offer_code ? (
                    <button
                      onClick={() => handleApplyOffer(offer.offer_code)}
                      className="flex items-center border border-orange-500 rounded-sm px-2 py-1"
                    >
                      <FiCheck size={16} color="#ff4500" />
                      <span className="ml-1 text-xs font-semibold text-orange-500">{t('applied') || 'Applied'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApplyOffer(offer.offer_code)}
                      className="bg-orange-600 rounded-sm px-3 py-1"
                    >
                      <span className="text-xs font-semibold text-white">{t('apply') || 'Apply'}</span>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('no_offers') || 'No offers available at the moment.'}</p>
            )}
          </div>
        )}

        {/* Section Divider */}
        <div className="h-2 bg-gray-100 dark:bg-gray-800 w-full"></div>

        {/* Tip Section */}
        <div className="px-4 py-3 bg-white dark:bg-gray-900">
          <p className="text-base font-bold text-gray-800 dark:text-white mb-2">{t('add_tip') || 'Add a tip to thank the professional'}</p>
          <div className="flex flex-wrap">
            {[50, 75, 100, 150, 200].map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  if (selectedTip === amount) {
                    setSelectedTip(0);
                  } else {
                    setSelectedTip(amount);
                  }
                }}
                className={`bg-gray-200 dark:bg-gray-700 rounded-md px-3 py-1 mr-2 mb-2 text-sm font-semibold ${
                  selectedTip === amount ? 'bg-orange-600 text-white' : 'text-gray-800'
                }`}
              >
                ₹{amount}
              </button>
            ))}
          </div>
        </div>

        {/* Section Divider */}
        <div className="h-2 bg-gray-100 dark:bg-gray-800 w-full"></div>

        {/* Payment Summary */}
        <div className="px-4 py-3 bg-white dark:bg-gray-900">
          <p className="text-base font-bold text-gray-800 dark:text-white mb-2">{t('payment_summary') || 'Payment summary'}</p>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">{t('item_total') || 'Item total'}</span>
            {appliedOffer && savings > 0 ? (
              <span className="text-xs font-semibold text-gray-800 dark:text-white">
                <span className="line-through text-gray-500">₹{totalPrice}</span> ₹{finalPrice}
              </span>
            ) : (
              <span className="text-xs font-semibold text-gray-800 dark:text-white">₹{totalPrice}</span>
            )}
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">{t('taxes_and_fee') || 'Taxes and Fee'}</span>
            <span className="text-xs font-semibold text-gray-800 dark:text-white">₹0</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">{t('tip') || 'Tip'}</span>
            <span className="text-xs font-semibold text-gray-800 dark:text-white">₹{selectedTip}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">{t('total_amount') || 'Total amount'}</span>
            <span className="text-xs font-semibold text-gray-800 dark:text-white">₹{finalPriceWithTip}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">{t('amount_to_pay') || 'Amount to pay'}</span>
            <span className="text-xs font-semibold text-gray-800 dark:text-white">₹{finalPriceWithTip}</span>
          </div>
          {appliedOffer && savings > 0 && (
            <p className="mt-2 text-xs text-green-600 font-semibold">
              {t('you_saved') || 'You saved'} ₹{savings} {t('on_this_order') || 'on this order!'}
            </p>
          )}
        </div>

        {/* Section Divider */}
        <div className="h-2 bg-gray-100 dark:bg-gray-800 w-full"></div>

        {/* Address Section */}
        <div className="px-4 py-3 bg-white dark:bg-gray-900">
          <p className="text-base font-semibold text-gray-800 dark:text-white">
            {t('address_question') || 'Where would you like us to send your skilled worker?'}
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <span className="text-lg font-bold text-gray-800 dark:text-white">₹{finalPriceWithTip}</span>
        <button onClick={addAddress} className="bg-orange-600 px-5 py-2 rounded-md">
          <span className="text-white text-sm font-semibold">{t('add_address') || 'Add Address'}</span>
        </button>
      </div>

      {/* Error Modal */}
      {errorModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-md w-4/5 max-w-sm text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{errorModalContent.title}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{errorModalContent.message}</p>
            <button onClick={() => setErrorModalVisible(false)} className="bg-orange-600 px-4 py-2 rounded-md">
              <span className="text-white text-sm font-semibold">{t('ok') || 'OK'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderScreen;
