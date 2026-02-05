
import React, { useState, useRef, useEffect } from 'react';
import { AppSetting } from '../../objects/AppSetting';
import axios from 'axios';
import { APIURLS } from '../../../APIURLS';
import { ToastContainer, toast } from 'react-toastify';
import { User } from '../../objects/User';
import { DepartmentBase } from '../../objects/enum';
interface ModalProps {
    id: number;
    view: boolean;
    setView: React.Dispatch<React.SetStateAction<boolean>>;
}

const ResetPassword: React.FC<ModalProps> = ({ id, view, setView,  }) => {
    const [oldPassword, setOldPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {

                setView(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const notifyError = (message: string) => toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
    });


    const saveData = () => {
        if (!oldPassword.trim() || !newPassword.trim()) {
            notifyError("Please complete all fields!");
            return;
        }
        const AddPromise = axiosInstance.post(APIURLS.user.resetUserPassword(), { 
            id: id, // Assuming you store user ID in localStorage
            oldPassword, 
            newPassword 
        })   
        .then(res => {
            setView(false)
        });
        toast.promise(
            AddPromise,
            {
                pending: "Reseting Password...",
                success:  "Password Updated",
                error: "Password doesn't match!",
            },
            {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light"
            }
        );
    };


    return (
        <div ref={dropdownRef} className={`fixed top-0 left-0 h-screen w-full md:w-1/3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-lg z-50 transform transition-transform duration-1000 overflow-y-auto pb-4 text-black dark:text-white ${view ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 ">
                <div className="flex items-center justify-between mb-4 pb-6 bg-slate-200 dark:bg-gray-800 p-4">
                    <h2 className="text-2xl font-bold underline text-black dark:text-white">RESET PASSWORD</h2>
                    <button onClick={() => setView(false)} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Password:</p>
                <input
                    type="password"
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />


                <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Confirm Password:</p>
                <input
                    type="password"
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />


                <div className="flex justify-between">
                    <button
                        onClick={saveData}
                        className="flex-grow px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 m-2">
                        Save
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

export default ResetPassword;