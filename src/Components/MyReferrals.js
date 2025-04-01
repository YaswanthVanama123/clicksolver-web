import React from 'react';

const MyReferrals = () => {
  // Handler functions (replace with actual implementations as needed)
  const handleShareWhatsApp = () => {
    console.log('Share via WhatsApp');
  };

  const handleCopyCode = () => {
    console.log('Code copied to clipboard');
  };

  const handleInviteFriends = () => {
    console.log('Invite friends triggered');
  };

  // Steps array for "How it works" section
  const steps = [
    'Share your referral link or code with a friend.',
    'Your friend joins Fi using your link or code.',
    'Both you and your friend enjoy benefits of Fi Federal Savings account.',
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Scrollable container with purple background */}
      <div className="bg-[#7C4DFF] pb-10">
        {/* Header Section */}
        <div className="flex flex-row items-center px-4 pt-4">
          {/* (Optionally add a back arrow button here) */}
          <span className="flex-1 text-center text-white text-lg font-semibold">
            Refer Friends
          </span>
        </div>

        {/* Top Section */}
        <div className="mt-4 px-4 flex flex-col items-center">
          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-[16px] mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-1">Invite your friends</h2>
          <p className="text-sm text-white text-center">
            ...to the cool new way of managing money!
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mt-6 pt-6 px-4 bg-white dark:bg-gray-800 rounded-t-[20px]">
          <div className="flex flex-row justify-between items-center mb-4">
            <span className="text-base font-semibold text-[#555555] dark:text-gray-300">
              How it works
            </span>
            <button className="text-sm font-medium text-[#7C4DFF] focus:outline-none">
              View TnCs
            </button>
          </div>
          <div className="flex flex-col">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-row items-center mb-4">
                <div className="w-8 h-8 bg-[#7C4DFF] rounded-full mr-3 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">{index + 1}</span>
                </div>
                <p className="flex-1 text-sm text-[#555555] dark:text-gray-300">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex flex-row mt-4">
          <button className="flex-1 py-3 border-b-2 border-[#7C4DFF] focus:outline-none">
            <span className="text-[#7C4DFF] font-semibold">Your Referrals</span>
          </button>
          <button className="flex-1 py-3 focus:outline-none">
            <span className="text-[#999999] font-medium dark:text-gray-400">
              Invite Contacts
            </span>
          </button>
        </div>

        {/* Referral Item */}
        <div className="flex flex-row items-center mt-3 px-4 py-2 bg-[#F8F8F8] dark:bg-gray-800 rounded-lg">
          <div className="w-9 h-9 rounded-full bg-[#7C4DFF] flex items-center justify-center mr-3">
            <span className="text-white font-semibold">AT</span>
          </div>
          <p className="text-base text-[#555555] dark:text-gray-300">
            Alikana Teja
          </p>
        </div>

        {/* Share Code Section */}
        <div className="flex flex-row items-center mt-6 px-4">
          <p className="text-base text-[#555555] dark:text-gray-300 flex-1">
            Share your code: <span className="font-bold text-[#555555] dark:text-gray-300">V87LCFQLT8</span>
          </p>
          <button
            onClick={handleCopyCode}
            className="w-6 h-6 bg-[#7C4DFF] rounded-md ml-2 focus:outline-none"
          >
            {/* Optionally add a "Copy" icon here */}
          </button>
        </div>

        {/* Share Buttons Row */}
        <div className="flex flex-row justify-evenly items-center mt-4 mb-10 px-4">
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 mr-2 py-3 bg-[#25D366] rounded-lg flex items-center justify-center focus:outline-none"
          >
            <span className="text-white font-semibold">WhatsApp</span>
          </button>
          <button
            onClick={handleInviteFriends}
            className="flex-1 mr-2 py-3 bg-[#7C4DFF] rounded-lg flex items-center justify-center focus:outline-none"
          >
            <span className="text-white font-semibold">Link</span>
          </button>
          <button
            onClick={handleInviteFriends}
            className="flex-1 py-3 bg-[#555555] dark:bg-gray-700 rounded-lg flex items-center justify-center focus:outline-none"
          >
            <span className="text-white font-semibold">Invite Friends</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyReferrals;
