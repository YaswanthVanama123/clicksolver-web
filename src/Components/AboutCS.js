import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

const LOGO_URL = 'https://i.postimg.cc/hjjpy2SW/Button-1.png';

const AboutCS = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col p-5 bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center mb-5">
        <button onClick={() => navigate(-1)} className="p-1 focus:outline-none">
          <MdArrowBack size={24} className="text-gray-900 dark:text-white" />
        </button>
        <h1 className="text-3xl font-bold ml-2">
          {t('about_us') || 'About Us'}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4">
        <p className="text-base leading-6 text-justify text-gray-400 dark:text-gray-400">
          {t('about_description_1') ||
            'Welcome to Clicksolver! We are dedicated to delivering innovative solutions that streamline your digital experience. Our platform is designed to empower you to solve complex challenges with simple clicks, enhancing productivity and driving success.'}
        </p>
        <p className="text-base leading-6 text-justify text-gray-400 dark:text-gray-400">
          {t('about_description_2') ||
            'At Clicksolver, our mission is to simplify tasks and transform the way you work. With a focus on intuitive design and cutting-edge technology, we strive to provide tools that are both powerful and user-friendly.'}
        </p>
        <p className="text-base leading-6 text-justify text-gray-400 dark:text-gray-400">
          {t('about_description_3') ||
            'Thank you for choosing Clicksolver as your trusted partner in navigating the digital world. We are committed to continuous improvement and excellence, ensuring that your journey with us is as smooth and rewarding as possible.'}
        </p>
      </div>

      {/* Logo at the Bottom */}
      <div className="flex justify-center mt-5">
        <img src={LOGO_URL} alt="Logo" className="w-12 h-12 object-contain" />
      </div>
    </div>
  );
};

export default AboutCS;
