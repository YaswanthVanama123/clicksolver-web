import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow-md" id="container">
      {/* Custom styles for CSS counters */}
      <style>{`
        #container {
          counter-reset: section;
        }
        .section-title::before {
          counter-increment: section;
          content: counter(section) ". ";
          position: absolute;
          left: 0;
          top: 0;
          font-weight: bold;
        }
      `}</style>

      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-1">Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Last Updated: 12-03-2025</p>
      </header>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          Introduction
        </h2>
        <p className="mt-4">
          Welcome to the ClickSolver Partner Platform. Your privacy and data security are our top priorities. This Privacy Policy outlines how we collect, use, disclose, and protect your information in compliance with the latest Indian data protection laws, including the Digital Personal Data Protection Act, 2023 (as amended in 2025) and the relevant provisions of the Indian IT Act and cybersecurity regulations.
        </p>
        <p className="mt-4">
          Our app connects skilled workers with users for service bookings. Workers pay a commission fee using Razorpay, a third-party payment gateway. Additionally, we collect bank account details to create a fund account in Razorpay for processing cashback payouts to workers. Please note that we do not store or manage funds internally, and we do not offer financial services such as loans, banking, or investments. All financial transactions are processed externally through Razorpay.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          Information We Collect
        </h2>
        <p className="mt-4">We collect the following information, upon your explicit consent:</p>
        <ul className="list-disc ml-5 mt-4 space-y-2">
          <li>
            <strong>Personal Information:</strong> Name, email address, phone number, and government-issued identification details.
          </li>
          <li>
            <strong>Business & Financial Data:</strong> Service details, bank account information (including bank name, account number, IFSC code, and account holder’s name) for processing commission payments and cashback payouts via Razorpay, and transaction records.
          </li>
          <li>
            <strong>Location Data:</strong> GPS coordinates (collected only with your explicit consent).
          </li>
          <li>
            <strong>Usage Data:</strong> IP address, browser type, device information, and cookies.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          How We Use Your Information
        </h2>
        <ul className="list-disc ml-5 mt-4 space-y-2">
          <li>To create and manage your account on the platform.</li>
          <li>To match you with relevant service requests and partners.</li>
          <li>
            To process payments securely and efficiently, including commission payments and cashback payouts through Razorpay.
          </li>
          <li>To enhance platform security, monitor for fraud, and ensure compliance with legal obligations.</li>
          <li>To send notifications, updates, and marketing communications (subject to your consent).</li>
        </ul>
        <p className="mt-4">
          Your information is processed strictly in accordance with the legal basis provided by your consent and applicable laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          Data Sharing &amp; Security
        </h2>
        <p className="mt-4">We do not sell your data. However, your information may be shared under the following circumstances:</p>
        <ul className="list-disc ml-5 mt-4 space-y-2">
          <li>With other users to display profiles and ratings.</li>
          <li>
            With payment service providers, such as Razorpay, to ensure secure transaction processing for commission payments and cashback payouts.
          </li>
          <li>With law enforcement or regulatory authorities as required by law.</li>
          <li>
            With trusted third-party service providers assisting in our operations, under strict data protection agreements.
          </li>
        </ul>
        <p className="mt-4">
          <strong>Security Measures:</strong> We employ encryption, access controls, and advanced fraud detection systems. In the event of a data breach, we will notify affected users within the legally mandated timeframe as per the 2025 amendments.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          Payment Processing
        </h2>
        <p className="mt-4">
          For the purpose of processing commission payments and cashback payouts, we integrate with Razorpay, a third-party payment gateway. The bank account details you provide are used solely to create a fund account in Razorpay to facilitate these transactions. We do not store your funds or provide any financial services beyond processing these payments.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          Partner Responsibilities &amp; Legal Liabilities
        </h2>
        <p className="mt-4">
          As a ClickSolver Partner, you are responsible for handling user items with due care. If you accept an item at your shop or home, you are liable for its safe return. Any loss, damage, or theft may result in legal action and penalties under applicable Indian law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          Your Rights &amp; Choices
        </h2>
        <ul className="list-disc ml-5 mt-4 space-y-2">
          <li>You have the right to access, update, or delete your personal data.</li>
          <li>You may withdraw your consent for data processing at any time.</li>
          <li>You can request data portability where applicable.</li>
          <li>You have the right to object to certain data processing activities and opt out of marketing communications.</li>
        </ul>
        <p className="mt-4">
          All rights are exercised in accordance with the provisions of the Digital Personal Data Protection Act and relevant Indian laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          Compliance with Indian Laws
        </h2>
        <p className="mt-4">
          ClickSolver Partner is committed to full compliance with the latest Indian data protection and cybersecurity regulations, including the Digital Personal Data Protection Act, 2023 (as amended in 2025) and other relevant legal requirements.
        </p>
        <p className="mt-4">
          We have designated a <strong>Grievance Officer</strong> to address any concerns regarding your data:
        </p>
        <ul className="list-disc ml-5 mt-4 space-y-2">
          <li>
            <strong>Grievance Officer:</strong> Yaswanth
          </li>
          <li>
            <strong>Email:</strong> <a className="text-blue-600 hover:underline" href="mailto:customer.support@clicksolver.com">customer.support@clicksolver.com</a>
          </li>
          <li>
            <strong>Phone:</strong> +91 9392365494
          </li>
          <li>
            <strong>Address:</strong> Reddy Bazar, Gampalagudem
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          Data Retention
        </h2>
        <p className="mt-4">
          We retain your personal data only as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law. Once your data is no longer required, it will be securely deleted or anonymized.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          Data Breach Notification
        </h2>
        <p className="mt-4">
          In line with the 2025 amendments, should a data breach occur that compromises your personal data, we will notify you and the relevant authorities within the mandated timeframe. Our notification procedures are designed to mitigate any potential harm and ensure transparency.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          Data Localization
        </h2>
        <p className="mt-4">
          Where required by law, sensitive personal data is stored and processed within India, in compliance with data localization provisions introduced in the recent amendments.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          Changes to This Privacy Policy
        </h2>
        <p className="mt-4">
          We reserve the right to update this Privacy Policy to reflect changes in our practices or legal requirements. Any updates will be posted on this page along with a revised effective date. Continued use of our services indicates your acceptance of any changes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="section-title relative text-2xl font-semibold border-b border-gray-300 pb-1 pl-8">
          Contact Us
        </h2>
        <p className="mt-4">
          If you have any questions about this Privacy Policy or our privacy practices, please contact us:
        </p>
        <p className="mt-4">
          Email: <a className="text-blue-600 hover:underline" href="mailto:customer.support@clicksolver.com">customer.support@clicksolver.com</a>
        </p>
        <p className="mt-4">Phone: +91 9392365494</p>
        <p className="mt-4">Address: Reddy Bazar, Gampalagudem</p>
      </section>

      <footer className="text-center">
        <p>&copy; 2025 ClickSolver Partner. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
