import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { APIURLS } from "../APIURLS";
import { User } from "./objects/User";
import { DepartmentBase } from "./objects/enum";

interface ModalProps {
  view: boolean;
  setView: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfileViewNew: React.FC<ModalProps> = ({ view, setView }) => {
  const [user, setUser] = useState<User | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setView(false);
      }
    };

    if (view) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [view]);

  // Fetch profile
  useEffect(() => {
    if (view) {
      axiosInstance
        .get(APIURLS.user.getUserId() + localStorage.getItem("id"))
        .then((res) => setUser(res.data))
        .catch(console.error);
    }
  }, [view]);

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
            Profile
          </h2>
          <button
            onClick={() => setView(false)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-sm">
          {renderField("Full Name", user?.fullName)}
          {renderField("Username", user?.userName)}
          {renderField("Email", user?.email)}
          {renderField("Branch", user?.branchName ?? "All")}
          {renderField(
            "Department",
            user?.departmentBase === DepartmentBase.Default
              ? "All"
              : DepartmentBase[user?.departmentBase ?? 0]
          )}
          {renderField("Position", user?.roleText)}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t dark:border-gray-700">
          <button
            onClick={() => setView(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable field renderer
const renderField = (label: string, value?: string) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
      {label}
    </label>
    <input
      value={value ?? ""}
      disabled
      className="w-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
    />
  </div>
);

export default ProfileViewNew;
