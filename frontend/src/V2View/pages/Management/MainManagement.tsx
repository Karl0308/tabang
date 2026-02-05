import { useState } from "react";
import AssetManagement from "./ManagementComponent/AssetManagement";
import UserManagement from "./ManagementComponent/UserManagement";
import BranchManagement from "./ManagementComponent/BranchManagement";
import CategoryManagement from "./ManagementComponent/CategoryManagement";
import DepartmentManagement from "./ManagementComponent/DepartmentManagement";


const MainManagement = () => {
    const [activeTab, setActiveTab] = useState<
        "assets" | "users" | "branches" | "categories" | "departments"
    >("assets");

    const tabIcons = {
        assets: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
        ),
        users: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        branches: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        categories: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
        ),
        departments: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
    };

    return (
        <div className="flex flex-col h-full mx-auto w-full">
            <div className="container mx-auto flex-grow overflow-auto">
                <div className="p-4 sm:p-6 lg:p-8 space-y-6">

                    {/* Enhanced Header */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Management</h2>
                                <p className="text-white/90 dark:text-white/80 text-sm sm:text-base mt-1">Manage system assets, users, branches, categories and departments</p>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Management Navigation Tabs */}
                    <div className="mb-8">
                        <div className="border-b-2 border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar">
                                {[
                                    { key: "assets", label: "Assets" },
                                    { key: "users", label: "Users" },
                                    { key: "branches", label: "Branches" },
                                    { key: "categories", label: "Categories" },
                                    { key: "departments", label: "Departments" },
                                ].map((tab) => {
                                    const isActive = activeTab === tab.key;

                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key as any)}
                                            className={`
                                                flex items-center gap-2 py-3 px-4 sm:px-6 text-sm font-semibold whitespace-nowrap
                                                border-b-4 transition-all duration-200 rounded-t-xl
                                                ${isActive
                                                    ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-gradient-to-t from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent shadow-md"
                                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                                                }
                                            `}
                                        >
                                            {tabIcons[tab.key as keyof typeof tabIcons]}
                                            <span className="hidden sm:inline">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>


                    {/* Asset tab */}
                    {activeTab === "assets" && <AssetManagement />}
                    {/* Users tab */}
                    {activeTab === "users" && <UserManagement />}
                    {/* Branches tab */}
                    {activeTab === "branches" && <BranchManagement />}
                    {/* Categories tab */}
                    {activeTab === "categories" && <CategoryManagement />}
                    {/* Departments tab */}
                    {activeTab === "departments" && <DepartmentManagement />}


                </div>

            </div>
        </div>
    );
};

export default MainManagement;
