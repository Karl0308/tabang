import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { APIURLS } from "../APIURLS";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ModalProps {
  view: boolean;
  setView: React.Dispatch<React.SetStateAction<boolean>>;
}

const ResetPasswordModal: React.FC<ModalProps> = ({ view, setView }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setView(false);
      }
    };
    if (view) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [view, setView]);

  const notifyError = (message: string) =>
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });

  const saveData = () => {
    if (!oldPassword.trim() || !newPassword.trim()) {
      notifyError("Please complete all fields!");
      return;
    }

    const request = axiosInstance.post(APIURLS.user.resetPassword(), {
      id: localStorage.getItem("id"),
      oldPassword,
      newPassword,
    });

    toast.promise(request, {
      pending: "Resetting Password...",
      success: "Password Updated",
      error: "Old Password is incorrect!",
    });

    request.then(() => setView(false));
  };

  if (!view) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Reset Password
          </h2>
          <button
            onClick={() => setView(false)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {renderField("Old Password", oldPassword, setOldPassword)}
          {renderField("New Password", newPassword, setNewPassword)}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t dark:border-gray-700">
          <button
            onClick={saveData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  );
};

// Reusable input field renderer
const renderField = (
  label: string,
  value: string,
  setter: React.Dispatch<React.SetStateAction<string>>
) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
      {label}
    </label>
    <input
      type="password"
      value={value}
      onChange={(e) => setter(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 text-black dark:text-white text-sm"
    />
  </div>
);

export default ResetPasswordModal;
