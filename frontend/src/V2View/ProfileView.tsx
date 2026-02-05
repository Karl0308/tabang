
import React, { useState, useRef, useEffect } from 'react';
import { AppSetting } from './objects/AppSetting';
import axios from 'axios';
import { APIURLS } from '../APIURLS';
import { ToastContainer, toast } from 'react-toastify';
import { User } from './objects/User';
import { DepartmentBase } from './objects/enum';
interface ModalProps {
    view: boolean;
    setView: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfileView: React.FC<ModalProps> = ({ view, setView }) => {
    // const [data, setData] = useState(selected ? selected.name : '');
    const [user, setUser] = useState<User | null>(null);
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

    useEffect(() => {
        if (view === true) {
            axiosInstance.get(APIURLS.user.getUserId() + localStorage.getItem("id"))
                .then(res => {
                    setUser(res.data);
                })
                .catch((error) => {
                });
        }
    }, [view]);




    return (
        <div
            ref={dropdownRef}
            className={`fixed top-0 left-0 h-screen w-full md:w-1/3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-lg z-50 transform transition-transform duration-1000 overflow-y-auto pb-4 text-black dark:text-white ${view ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-4 pb-6 bg-slate-200 dark:bg-gray-800 p-4">
                    <h2 className="text-2xl font-bold underline text-black dark:text-white">PROFILE</h2>
                    <button onClick={() => setView(false)} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Full Name:</p>
                <input type="text" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3" value={user?.fullName} disabled />

                <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Username:</p>
                <input type="text" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3" value={user?.userName} disabled />

                <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Email:</p>
                <input type="text" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3" value={user?.email} disabled />

                <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Branch:</p>
                <input type="text" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3" value={user?.branchName === null ? "All" : user?.branchName} disabled />

                <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Department:</p>
                <input
                    type="text"
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3"
                    value={user?.departmentBase === DepartmentBase.Default ? "All" : DepartmentBase[user?.departmentBase ?? 0]}
                    disabled
                />

                <p className="text-gray-700 dark:text-gray-300 font-semibold text-left">Position:</p>
                <input type="text" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3" value={user?.roleText} disabled />
            </div>
        </div>

    );
};

export default ProfileView;