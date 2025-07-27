import React from "react";
import { MdEmail, MdPhone, MdQuestionAnswer } from "react-icons/md";
import { FaUserAlt, FaRegEnvelope, FaRegCommentDots } from "react-icons/fa";
import { AiOutlineForm } from "react-icons/ai";

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="https://i.postimg.cc/nLbK39h1/image.png" // Replace with your actual logo path
            alt="ClickSolver Logo"
            className="h-14"
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-orange-600">
          ClickSolver Support
        </h1>
        <p className="text-gray-600 text-center mt-2 mb-6">
          Need help? We're here for you. Reach us via form, email, or phone.
        </p>

        <div className="space-y-3 text-sm text-gray-700 mb-6">
          <div className="flex items-center space-x-2">
            <MdEmail className="text-orange-500 text-lg" />
            <span>
              Email:{" "}
              <a
                href="mailto:support@clicksolver.com"
                className="text-blue-600 underline"
              >
                customer.support@clicksolver.com
              </a>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MdPhone className="text-orange-500 text-lg" />
            <span>
              Phone:{" "}
              <a href="tel:+919876543210" className="text-blue-600 underline">
                +91 7981793632
              </a>
            </span>
          </div>
          {/* <div className="flex items-center space-x-2">
            <MdQuestionAnswer className="text-orange-500 text-lg" />
            <span>
              FAQ:{" "}
              <a href="/faq" className="text-blue-600 underline">
                Visit FAQ
              </a>
            </span>
          </div> */}
        </div>

        {/* Support Form */}
        <form className="space-y-4">
          <div className="relative">
            <FaUserAlt className="absolute left-3 top-3.5 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Your Name"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="relative">
            <FaRegEnvelope className="absolute left-3 top-3.5 text-gray-400 text-sm" />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="relative">
            <AiOutlineForm className="absolute left-3 top-3.5 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Subject / Issue"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="relative">
            <FaRegCommentDots className="absolute left-3 top-3.5 text-gray-400 text-sm" />
            <textarea
              placeholder="Describe your issue..."
              rows="4"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportPage;
