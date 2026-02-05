
import React, { useState, useRef, useEffect } from 'react';
import { AppSetting } from './objects/AppSetting';
import axios from 'axios';
import { APIURLS } from '../APIURLS';
import { ToastContainer, toast } from 'react-toastify';
interface ModalProps {
    view: boolean;
    setView: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppSettingView: React.FC<ModalProps> = ({ view, setView }) => {
    // const [data, setData] = useState(selected ? selected.name : '');
    const [appSetting, setAppSetting] = useState<AppSetting | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });

    const saveData = async () => {

        const AddPromise = axiosInstance.post(APIURLS.appsetting.saveAppSetting(), appSetting);

        toast.promise(
            AddPromise,
            {
                pending: "Saving App Settings...",
                success: "Successfully Save...",
                error: "Error Saving App Settings!"
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

    const handleClose = () => {
        // setSelected(null);
    };

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
            GetAppSettings();
        }
    }, [view]);
    const GetAppSettings = () => {
        axiosInstance.get(APIURLS.appsetting.getAppSettings())
            .then(res => {
                setAppSetting(res.data);
            })
            .catch((error) => {
            });
    };

    useEffect(() => {
        if (!appSetting) return;

        setAppSetting(prev => {
            if (!prev) return prev;

            let updatedSetting = { ...prev };

            // Convert string to number safely
            const num = (val: string) => parseInt(val, 10) || 0;

            // Ensure `newFrom` is not greater than `newTo`
            if (num(updatedSetting.newFrom) > num(updatedSetting.newTo)) {
                updatedSetting.newFrom = updatedSetting.newTo;
            }

            // Ensure `newTo` is synced with `warningFrom`
            updatedSetting.warningFrom = updatedSetting.newTo;

            // Ensure `warningFrom` is not greater than `warningTo`
            if (num(updatedSetting.warningFrom) > num(updatedSetting.warningTo)) {
                updatedSetting.warningTo = updatedSetting.warningFrom;
            }

            // Ensure `warningTo` is synced with `severeFrom`
            updatedSetting.severeFrom = updatedSetting.warningTo;

            // Ensure `severeFrom` is not greater than `severeTo`
            if (num(updatedSetting.severeFrom) > num(updatedSetting.severeTo)) {
                updatedSetting.severeTo = updatedSetting.severeFrom;
            }

            return updatedSetting;
        });

    }, [
        appSetting?.newFrom,
        appSetting?.newTo,
        appSetting?.warningFrom,
        appSetting?.warningTo,
        appSetting?.severeFrom,
        appSetting?.severeTo
    ]);



    return (
        <div ref={dropdownRef} className={`fixed top-0 left-0 h-screen w-full md:w-1/3
            bg-white dark:bg-gray-900
            border border-gray-300 dark:border-gray-700
            shadow-lg z-50 transform transition-transform duration-1000
            overflow-y-auto pb-4
            text-black dark:text-white
            ${view ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className="p-6 ">
                <div className="flex items-center justify-between mb-4 pb-6 bg-slate-200 dark:bg-slate-800 p-4">
                    <h2 className="text-2xl font-bold underline text-black dark:text-white">RESET PASSWORD</h2>
                    <button
                        onClick={() => setView(false)}
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div className="mb-4 border border-gray-300 dark:border-gray-600 p-2 text-black dark:text-white">
                    <h3 className="w-full bg-yellow-200 dark:bg-yellow-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3 text-black dark:text-white">NEW TICKET</h3>

                    <p className="text-gray-700 dark:text-gray-200 font-semibold text-left">Type :</p>
                    <select
                        className="w-full bg-gray-100 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md py-1 px-3 mb-2"
                        value={"Minutes"}
                        disabled
                    >
                        <option value="Minutes">Minutes</option>
                    </select>

                    <div className="flex items-center space-x-2">
                        <select
                            className="w-full bg-gray-100 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md py-1 px-3 mb-2"
                            value={appSetting?.newFrom ?? ""}
                            onChange={(e) => {
                                setAppSetting(prev => ({ ...prev!, newFrom: e.target.value }));
                            }}
                            disabled
                        >
                            <option value="">Select a number</option>
                            {Array.from({ length: 180 }, (_, i) => {
                                const num = i < 10 ? `0${i}` : `${i}`;
                                return (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                );
                            })}
                        </select>

                        <span className="text-xl text-gray-700 dark:text-gray-200 font-bold">→</span>

                        <input
                            list="numberOptions"
                            className="w-full bg-gray-100 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md py-1 px-3 mb-2"
                            value={appSetting?.newTo ?? ""}
                            onChange={(e) => {
                                setAppSetting(prev => ({ ...prev!, newTo: e.target.value }));
                            }}
                            placeholder="Select or type a number"
                        />
                    </div>

                    {appSetting?.newFrom !== undefined &&
                        appSetting?.newFrom !== "" &&
                        appSetting?.newTo !== undefined &&
                        appSetting?.newTo !== "" &&
                        !isNaN(Number(appSetting?.newFrom)) &&
                        !isNaN(Number(appSetting?.newTo)) && (
                            <p className="text-gray-700 dark:text-gray-200  font-semibold text-left mt-2">
                                New ticket is between{" "}
                                {(() => {
                                    const from = parseInt(appSetting?.newFrom ?? "0");
                                    const to = parseInt(appSetting?.newTo ?? "0");
                                    const diff = to - from;

                                    if (diff <= 0) return "0 minutes";

                                    const days = Math.floor(diff / (60 * 24)); // Calculate full days
                                    const hours = Math.floor((diff % (60 * 24)) / 60); // Remaining hours after full days
                                    const minutes = diff % 60; // Remaining minutes after full hours

                                    let result = "";
                                    if (days > 0) result += `${days} day${days > 1 ? "s" : ""}`;
                                    if (hours > 0 || minutes > 0) {
                                        if (days > 0) result += " and ";
                                        if (hours > 0) result += `${hours} hour${hours > 1 ? "s" : ""}`;
                                        if (minutes > 0) result += `${hours > 0 || days > 0 ? " and " : ""}${minutes} minute${minutes > 1 ? "s" : ""}`;
                                    } else if (days === 0 && hours === 0 && minutes === 0) {
                                        result = "0 minutes";
                                    }

                                    return result;
                                })()}
                            </p>
                        )}


                </div>


                <div className="mb-4 border border-gray-300 dark:border-gray-600 p-2 text-black dark:text-white">
                    <h3 className="w-full bg-orange-200 dark:bg-orange-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3 text-black dark:text-white">WARNING TICKET</h3>
                    <p className="text-gray-700 dark:text-gray-200  font-semibold text-left">Type :</p>
                    <select
                        className="w-full bg-gray-100 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md py-1 px-3 mb-2"
                        value={"Minutes"}
                    >
                        <option value="Minutes">Minutes</option>
                    </select>

                    <div className="flex items-center space-x-2">

                        <input
                            list="numberOptions"
                            className="w-full bg-gray-100 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md py-1 px-3 mb-2"
                            value={appSetting?.warningFrom ?? ""}
                            onChange={(e) => {
                                setAppSetting(prev => ({ ...prev!, warningFrom: e.target.value }));
                            }}
                            disabled
                            placeholder="Select or type a number"
                        />

                        <span className="text-xl text-gray-700 dark:text-gray-200 font-bold">→</span>


                        <input
                            list="numberOptions"
                            className="w-full bg-gray-100 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md py-1 px-3 mb-2"
                            value={appSetting?.warningTo ?? ""}
                            onChange={(e) => {
                                setAppSetting(prev => ({ ...prev!, warningTo: e.target.value }));
                            }}
                            placeholder="Select or type a number"
                        />
                    </div>

                    {appSetting?.warningFrom !== undefined &&
                        appSetting?.warningFrom !== "" &&
                        appSetting?.warningTo !== undefined &&
                        appSetting?.warningTo !== "" &&
                        !isNaN(Number(appSetting?.warningFrom)) &&
                        !isNaN(Number(appSetting?.warningTo)) && (
                            <p className="text-gray-700 dark:text-gray-200  font-semibold text-left mt-2">
                                Warning ticket is{" "}
                                {(() => {
                                    const from = parseInt(appSetting?.warningFrom ?? "0");
                                    const to = parseInt(appSetting?.warningTo ?? "0");

                                    const formatTime = (minutes: number) => {
                                        // Calculate full days, hours, and remaining minutes
                                        const days = Math.floor(minutes / (60 * 24));
                                        const hours = Math.floor((minutes % (60 * 24)) / 60);
                                        const remainingMinutes = minutes % 60;

                                        let result = "";

                                        if (days > 0) result += `${days} day${days > 1 ? "s" : ""}`;
                                        if (hours > 0) result += `${days > 0 ? " and " : ""}${hours} hour${hours > 1 ? "s" : ""}`;
                                        if (remainingMinutes > 0) result += `${hours > 0 || days > 0 ? " and " : ""}${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;

                                        return result || "0 minutes";
                                    };

                                    // If the difference between from and to is greater than 0, show the range in minutes
                                    if (from > 0 && to > 0) {
                                        return `between ${formatTime(from)} to ${formatTime(to)}`;
                                    }

                                    // Otherwise, return formatted time duration (days, hours, minutes)
                                    return formatTime(to);
                                })()}
                            </p>
                        )}
                </div>


                <div className="mb-4 border border-gray-300 dark:border-gray-600 p-2 text-black dark:text-white">
                    <h3 className="w-full bg-red-200 dark:bg-red-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3 text-black dark:text-white">SEVERE TICKET</h3>
                    {/* <p className="text-gray-700 font-semibold text-left">More than:</p> */}
                    <input
                        list="numberOptions"
                        className="w-full bg-gray-100 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md py-1 px-3 mb-2"
                        value={appSetting?.severeFrom ?? ""}
                        onChange={(e) => {
                            setAppSetting(prev => ({ ...prev!, severeFrom: e.target.value }));
                        }}
                        placeholder="Select or type a number"
                    />

                    {appSetting?.warningTo !== undefined &&
                        appSetting?.warningTo !== "" &&
                        !isNaN(Number(appSetting?.warningTo)) && (
                            <p className="text-gray-700 dark:text-gray-200  font-semibold text-left mt-2">
                                Severe ticket is more than{" "}
                                {(() => {
                                    const severeFrom = parseInt(appSetting?.warningTo ?? "0"); // Use warningTo as severeFrom

                                    // Format time as days, hours, minutes
                                    const formatTime = (minutes: number) => {
                                        const days = Math.floor(minutes / (60 * 24));
                                        const hours = Math.floor((minutes % (60 * 24)) / 60);
                                        const remainingMinutes = minutes % 60;

                                        let result = "";

                                        if (days > 0) result += `${days} day${days > 1 ? "s" : ""}`;
                                        if (hours > 0) result += `${days > 0 ? " and " : ""}${hours} hour${hours > 1 ? "s" : ""}`;
                                        if (remainingMinutes > 0) result += `${hours > 0 || days > 0 ? " and " : ""}${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;

                                        return result || "0 minutes";
                                    };

                                    // Display formatted time
                                    return formatTime(severeFrom); // Severe ticket is more than this time
                                })()}
                            </p>
                        )}

                </div>

                <div className="flex justify-between">
                    {/* <button onClick={() => setSelected(null)} className="flex-grow px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 m-2">Close</button> */}
                    <button
                        onClick={saveData}
                        className="flex-grow px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 m-2">Save</button>
                </div>
            </div>

        </div>

    );
};

export default AppSettingView;