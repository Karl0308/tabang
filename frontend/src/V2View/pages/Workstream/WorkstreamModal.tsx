import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';

interface TicketModalProps {
    isOpen: boolean;
    ticketNumber: string;
    onClose: () => void;
}

const WorkstreamModal: React.FC<TicketModalProps> = ({
    isOpen,
    ticketNumber,
    onClose,
}) => {
    if (!isOpen) return null;

    const notifySuccess = (message: string) => toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
    });
    const handleCopy = () => {

        navigator.clipboard.writeText(window.location.origin + "/workstreamview/" + ticketNumber);
        notifySuccess("Link of " + ticketNumber + " copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl text-center dark:bg-gray-800 dark:text-white transform transition-all duration-300 animate-fadeIn">
                {/* Success Icon */}
                <div className="mx-auto w-16 h-16 mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 mb-3">
                    Workstream Created!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Your Workstream number is
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-6 bg-gray-100 dark:bg-gray-700 rounded-xl py-3 px-4">
                    {ticketNumber}
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button
                        onClick={handleCopy}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                                   text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy Link
                    </button>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600
                                   text-gray-700 dark:text-gray-200 font-semibold rounded-xl bg-white dark:bg-gray-700
                                   hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 active:scale-95"
                    >
                        Close
                    </button>
                </div>
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
    );
};

export default WorkstreamModal;