import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100 text-gray-900">
      <h1 className="text-6xl font-extrabold text-orange-600 drop-shadow-lg animate-pulse">
        🚫 Access Denied
      </h1>
      <h2 className="mt-4 text-2xl font-semibold text-orange-500">
        Unauthorized Access
      </h2>
      <p className="mt-2 text-gray-700 text-center max-w-md">
        You do not have permission to access this page. Please contact your
        administrator if you believe this is an error.
      </p>
      {user && (
        <p className="mt-2 text-sm text-gray-600">
          Current role: <span className="font-semibold">{user.roleText}</span>
        </p>
      )}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleGoBack}
          className="rounded-lg bg-gray-500 px-6 py-2 text-white font-medium transition-all duration-300 hover:bg-gray-600 hover:shadow-md"
        >
          Go Back
        </button>
        <button
          onClick={handleGoHome}
          className="rounded-lg bg-orange-500 px-6 py-2 text-white font-medium transition-all duration-300 hover:bg-orange-600 hover:shadow-md"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
