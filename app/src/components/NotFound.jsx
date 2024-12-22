import React from "react";
import { Link } from "react-router-dom";
import { Heart, WineOff } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="text-center max-w-md w-full">
        <img
          src="/xl.png"
          alt="404 Logo"
          className="mx-auto mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 rounded-full"
        />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-4 sm:mb-6 flex items-center justify-center">
          <WineOff className="text-indigo-500 mr-2 w-5 h-5 sm:w-6 sm:h-6" />
          Whoops! This page is not available.
        </p>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-6 sm:mb-8">
          But there's still more to explore.
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-500 to-indigo-500 text-white font-semibold rounded-lg shadow-md hover:from-indigo-600 hover:to-indigo-600 transition-colors duration-300 text-sm sm:text-base"
        >
          Back to Hot
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
