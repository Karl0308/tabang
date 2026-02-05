import React from 'react';

const Tickets2 = () => {
    return (
        <>
            <div>

                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                                <p className="text-sm text-gray-500 mt-1">Manage and track all support requests</p>
                            </div>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                                <i className="fas fa-plus mr-2"></i>
                                <span className="hidden sm:inline">New Ticket</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Filters</h3>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Clear All</button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <div className="relative">
                                    <input type="text" placeholder="Search tickets..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    <i className="fas fa-search absolute left-3 top-3.5 text-gray-400"></i>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                                    <option>All Status</option>
                                    <option>Open</option>
                                    <option>In Progress</option>
                                    <option>Resolved</option>
                                    <option>Closed</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                                    <option>All Priorities</option>
                                    <option>High</option>
                                    <option>Medium</option>
                                    <option>Low</option>
                                </select>
                            </div>

                            {/* Branch */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                                    <option>All Branches</option>
                                    <option>Atrium</option>
                                    <option>Jibao-an</option>
                                    <option>Villa</option>
                                </select>
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                                    <option>All Departments</option>
                                    <option>CCTV</option>
                                    <option>Engineering</option>
                                    <option>IS</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Tickets</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">23</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-ticket-alt text-blue-600 dark:text-blue-400 text-xl"></i>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Open</p>
                                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">15</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-clock text-yellow-600 dark:text-yellow-400 text-xl"></i>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">In Progress</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">5</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-spinner text-purple-600 dark:text-purple-400 text-xl"></i>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Overdue</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">3</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-xl"></i>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Resolved</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">3</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-check-circle text-green-600 dark:text-green-400 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tickets List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticket</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Branch</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reporter</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assignee</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="ticket-row cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors" onclick="openTicketDetail('H89-CXP')">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">H89-CXP</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">Add one camera</span>
                                                <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">OVERDUE</span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">12/05/2025</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                                                <span className="text-sm text-gray-700">7h 25m ago</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">CCTV</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">Atrium</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">Rex Bayon-on</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="Assignee" />
                                                <span className="ml-2 text-sm text-gray-700">Erafio Landero</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold priority-high">
                                                High
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold status-badge-open">
                                                Open
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="ticket-row cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors" onclick="openTicketDetail('O1R-7SJ')">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">O1R-7SJ</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">CCTV VIEWING</span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">12/03/2025</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
                                                <span className="text-sm text-gray-700">2d 6h 5m ago</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">Engineering</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">Jibao-an</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">CS Jibao-an</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" alt="Assignee" />
                                                <span className="ml-2 text-sm text-gray-700">Rex Bayon-on</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold priority-high">
                                                High
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold status-badge-open">
                                                Open
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="ticket-row cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">T24-KYC</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">Request for 1 onedrive account w/ 10 TB...</span>
                                                <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">OVERDUE</span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">11/24/2025</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
                                                <span className="text-sm text-gray-700">11d 5h 15m ago</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">IS</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">Atrium</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">Michael Mamerio</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" alt="Assignee" />
                                                <span className="ml-2 text-sm text-gray-700">Andrew Que</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold priority-high">
                                                High
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold status-badge-open">
                                                Open
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
                            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer" onclick="openTicketDetail('H89-CXP')">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">H89-CXP</span>
                                            <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">OVERDUE</span>
                                        </div>
                                        <div className="text-base font-medium text-gray-900 dark:text-white">Add one camera</div>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold status-badge-open">
                                        Open
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <i className="fas fa-clock w-4 mr-2 text-gray-400"></i>
                                        <span>7h 25m ago</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <i className="fas fa-building w-4 mr-2 text-gray-400"></i>
                                        <span>CCTV • Atrium</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <i className="fas fa-user w-4 mr-2 text-gray-400"></i>
                                            <span>Erafio Landero</span>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold priority-high">
                                            High
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer" onclick="openTicketDetail('O1R-7SJ')">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">O1R-7SJ</div>
                                        <div className="text-base font-medium text-gray-900 dark:text-white">CCTV VIEWING</div>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold status-badge-open">
                                        Open
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <i className="fas fa-clock w-4 mr-2 text-gray-400"></i>
                                        <span>2d 6h 5m ago</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <i className="fas fa-building w-4 mr-2 text-gray-400"></i>
                                        <span>Engineering • Jibao-an</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <i className="fas fa-user w-4 mr-2 text-gray-400"></i>
                                            <span>Rex Bayon-on</span>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold priority-high">
                                            High
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">T24-KYC</span>
                                            <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">OVERDUE</span>
                                        </div>
                                        <div className="text-base font-medium text-gray-900 dark:text-white">Request for 1 onedrive account...</div>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold status-badge-open">
                                        Open
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <i className="fas fa-clock w-4 mr-2 text-gray-400"></i>
                                        <span>11d 5h 15m ago</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <i className="fas fa-building w-4 mr-2 text-gray-400"></i>
                                        <span>IS • Atrium</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <i className="fas fa-user w-4 mr-2 text-gray-400"></i>
                                            <span>Andrew Que</span>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold priority-high">
                                            High
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                                    Previous
                                </button>
                                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">23</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                                        <button className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                            <i className="fas fa-chevron-left"></i>
                                        </button>
                                        <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                                            1
                                        </button>
                                        <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            2
                                        </button>
                                        <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            3
                                        </button>
                                        <button className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                            <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ticket Detail Modal */}
                <div id="ticket-modal-overlay" className="fixed inset-0 bg-black bg-opacity-50 z-40 hidden modal-overlay opacity-0"></div>

                <div id="ticket-modal" className="fixed top-0 right-0 bottom-0 w-full lg:w-2/3 xl:w-1/2 bg-white z-50 shadow-2xl modal-panel modal-hidden overflow-y-auto">
                    <div className="flex flex-col h-full">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="text-white">
                                    <div className="text-sm font-medium opacity-90">Ticket No.</div>
                                    <div className="text-2xl font-bold flex items-center">
                                        H89-CXP
                                        <button className="ml-3 text-white hover:text-blue-100">
                                            <i className="fas fa-copy text-lg"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button onclick="closeTicketDetail()" className="text-white hover:text-blue-100 p-2">
                                <i className="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6 space-y-6">
                                {/* Title Section */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                                    <input type="text" value="Add one camera" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium text-gray-900" />
                                </div>

                                {/* Description Section */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 space-y-2 text-sm">
                                        <div><span className="font-semibold text-gray-700">Reporter:</span> <span className="text-gray-900">rex</span></div>
                                        <div><span className="font-semibold text-gray-700">IP Address:</span> <span className="text-gray-900">-</span></div>
                                        <div><span className="font-semibold text-gray-700">Location:</span> <span className="text-gray-900">-</span></div>
                                        <div><span className="font-semibold text-gray-700">Asset tag:</span> <span className="text-gray-900">-</span></div>
                                        <div><span className="font-semibold text-gray-700">Problem Concern Details:</span> <span className="text-gray-900">Add one camera @ the counter lobby</span></div>
                                    </div>
                                </div>

                                {/* Attachments */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Attachments</label>
                                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
                                        No attachments found.
                                    </div>
                                </div>

                                {/* Ticket Details Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date Filed</label>
                                        <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900">
                                            12/05/2025, 08:15 AM
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                                        <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900">
                                            7h 24m ago
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-500">
                                            <option>Please select due date...</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900">
                                            <option>High</option>
                                            <option>Medium</option>
                                            <option>Low</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
                                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900">
                                            <option>Atrium</option>
                                            <option>Jibao-an</option>
                                            <option>Villa</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900">
                                            <option>CCTV</option>
                                            <option>Engineering</option>
                                            <option>IS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Assignee</label>
                                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900">
                                            <option>Erafio Landero</option>
                                            <option>Rex Bayon-on</option>
                                            <option>Andrew Que</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Reporter</label>
                                        <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900">
                                            Rex Bayon-on
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs Section */}
                                <div>
                                    <div className="border-b border-gray-200">
                                        <nav className="-mb-px flex space-x-8">
                                            <button className="ticket-tab border-b-2 border-blue-500 text-blue-600 py-3 px-1 text-sm font-semibold" data-tab="comments">
                                                Comments
                                            </button>
                                            <button className="ticket-tab border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-3 px-1 text-sm font-semibold" data-tab="history">
                                                History
                                            </button>
                                            <button className="ticket-tab border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-3 px-1 text-sm font-semibold" data-tab="related">
                                                Related Issues
                                            </button>
                                            <button className="ticket-tab border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-3 px-1 text-sm font-semibold" data-tab="assets">
                                                Assets
                                            </button>
                                        </nav>
                                    </div>

                                    {/* Comments Tab */}
                                    <div id="comments-tab" className="ticket-tab-content py-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-3">
                                                <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="User" />
                                                <div className="flex-1">
                                                    <textarea rows="3" placeholder="Add a comment..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                                                    <div className="flex items-center justify-end space-x-2 mt-2">
                                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                                                            <i className="fas fa-paperclip mr-2"></i>Upload
                                                        </button>
                                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                                            Submit
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-center py-8 text-gray-500 text-sm">
                                                No comments available.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Other Tabs (Hidden by default) */}
                                    <div id="history-tab" className="ticket-tab-content hidden py-6">
                                        <div className="text-center py-8 text-gray-500 text-sm">
                                            No history available.
                                        </div>
                                    </div>
                                    <div id="related-tab" className="ticket-tab-content hidden py-6">
                                        <div className="text-center py-8 text-gray-500 text-sm">
                                            No related issues found.
                                        </div>
                                    </div>
                                    <div id="assets-tab" className="ticket-tab-content hidden py-6">
                                        <div className="text-center py-8 text-gray-500 text-sm">
                                            No assets linked.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                            <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                                Catch Up
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Tickets2;