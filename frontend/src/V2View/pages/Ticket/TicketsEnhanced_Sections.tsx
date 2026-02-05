/**
 * ENHANCED UI COMPONENTS FOR TICKETS.TSX
 * Copy these sections into your Tickets.tsx file to enhance the UI
 * Each section is marked with comments showing where to replace
 */

// =============================================================================
// SECTION 1: ENHANCED STATISTICS CARDS
// Replace the statistics cards grid section (around line 1380-1582)
// =============================================================================

export const EnhancedStatisticsCards = ({ data, filter, setFilter, StatusList }: any) => {
  return (
    <>
      {/* Desktop & Tablet View - Enhanced Cards with Gradients */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
        {/* Total Tickets - Gradient Blue */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white dark:bg-blue-700 rounded-xl shadow-sm">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Tickets</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{data.totalTicket}</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-700 rounded-full -mr-16 -mt-16 opacity-20"></div>
        </div>

        {/* Open Tickets - Gradient Yellow */}
        <div
          onClick={() => {
            const statusObj = StatusList.find((s: any) => s.value === 1);
            if (!statusObj) return;
            setFilter((prev: any) => {
              const exists = prev.status.some((s: any) => s.value === statusObj.value);
              return {
                ...prev,
                status: exists ? prev.status.filter((s: any) => s.value !== statusObj.value) : [...prev.status, statusObj],
                pageNumber: 1,
              };
            });
          }}
          className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
            filter.status.some((s: any) => s.value === 1)
              ? "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-600 dark:to-yellow-700 ring-2 ring-yellow-400"
              : "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800"
          }`}
        >
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white dark:bg-yellow-700 rounded-xl shadow-sm">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Open</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{data.totalOpen}</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 dark:bg-yellow-700 rounded-full -mr-16 -mt-16 opacity-20"></div>
        </div>

        {/* On Hold - Gradient Red */}
        <div
          onClick={() => {
            const statusObj = StatusList.find((s: any) => s.value === 2);
            if (!statusObj) return;
            setFilter((prev: any) => {
              const exists = prev.status.some((s: any) => s.value === statusObj.value);
              return {
                ...prev,
                status: exists ? prev.status.filter((s: any) => s.value !== statusObj.value) : [...prev.status, statusObj],
                pageNumber: 1,
              };
            });
          }}
          className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
            filter.status.some((s: any) => s.value === 2)
              ? "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-600 dark:to-red-700 ring-2 ring-red-400"
              : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800"
          }`}
        >
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white dark:bg-red-700 rounded-xl shadow-sm">
                <svg className="w-6 h-6 text-red-600 dark:text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">On Hold</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{data.totalOnHold}</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 dark:bg-red-700 rounded-full -mr-16 -mt-16 opacity-20"></div>
        </div>

        {/* In Progress - Gradient Purple/Blue */}
        <div
          onClick={() => {
            const statusObj = StatusList.find((s: any) => s.value === 3);
            if (!statusObj) return;
            setFilter((prev: any) => {
              const exists = prev.status.some((s: any) => s.value === statusObj.value);
              return {
                ...prev,
                status: exists ? prev.status.filter((s: any) => s.value !== statusObj.value) : [...prev.status, statusObj],
                pageNumber: 1,
              };
            });
          }}
          className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
            filter.status.some((s: any) => s.value === 3)
              ? "bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-600 dark:to-purple-700 ring-2 ring-blue-400"
              : "bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-900 dark:to-purple-800"
          }`}
        >
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white dark:bg-blue-700 rounded-xl shadow-sm">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-200 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">In Progress</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{data.totalInProgress}</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-700 rounded-full -mr-16 -mt-16 opacity-20"></div>
        </div>

        {/* Done - Gradient Green */}
        <div
          onClick={() => {
            const statusObj = StatusList.find((s: any) => s.value === 0);
            if (!statusObj) return;
            setFilter((prev: any) => {
              const exists = prev.status.some((s: any) => s.value === statusObj.value);
              return {
                ...prev,
                status: exists ? prev.status.filter((s: any) => s.value !== statusObj.value) : [...prev.status, statusObj],
                pageNumber: 1,
              };
            });
          }}
          className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
            filter.status.some((s: any) => s.value === 0)
              ? "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-600 dark:to-green-700 ring-2 ring-green-400"
              : "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800"
          }`}
        >
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white dark:bg-green-700 rounded-xl shadow-sm">
                <svg className="w-6 h-6 text-green-600 dark:text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Done</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{data.totalDone}</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 dark:bg-green-700 rounded-full -mr-16 -mt-16 opacity-20"></div>
        </div>
      </div>

      {/* Mobile View - Compact Enhanced Cards */}
      <div className="grid grid-cols-5 sm:hidden gap-2 mb-6">
        {/* Mobile cards with modern styling */}
        {[
          { icon: "ticket", count: data.totalTicket, color: "blue", label: "All" },
          { icon: "clock", count: data.totalOpen, color: "yellow", label: "Open" },
          { icon: "pause", count: data.totalOnHold, color: "red", label: "Hold" },
          { icon: "spinner", count: data.totalInProgress, color: "purple", label: "Progress" },
          { icon: "check", count: data.totalDone, color: "green", label: "Done" },
        ].map((item, idx) => (
          <div key={idx} className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 dark:from-${item.color}-900 dark:to-${item.color}-800 rounded-xl shadow-md p-3 flex flex-col items-center justify-center transform hover:scale-105 transition-all duration-200`}>
            <div className={`w-10 h-10 bg-white dark:bg-${item.color}-700 rounded-lg flex items-center justify-center mb-2 shadow-sm`}>
              <span className={`text-${item.color}-600 dark:text-${item.color}-200 text-lg font-bold`}>
                {item.icon === "ticket" && "🎫"}
                {item.icon === "clock" && "⏰"}
                {item.icon === "pause" && "⏸️"}
                {item.icon === "spinner" && "🔄"}
                {item.icon === "check" && "✅"}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{item.count}</p>
            <p className="text-[10px] font-medium text-gray-600 dark:text-gray-300 text-center">{item.label}</p>
          </div>
        ))}
      </div>
    </>
  );
};

// =============================================================================
// SECTION 2: ENHANCED LOADING STATE
// Replace loading condition with this skeleton loader
// =============================================================================

export const SkeletonLoader = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-40"></div>
        ))}
      </div>

      {/* Skeleton Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// SECTION 3: ENHANCED SEARCH INPUT
// Replace search input section
// =============================================================================

export const EnhancedSearchInput = ({ filter, setFilter }: any) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search tickets by number, title, or description..."
        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
        value={filter.search}
        onChange={(e) =>
          setFilter((prev: any) => ({
            ...prev,
            search: e.target.value,
            pageNumber: 1,
          }))
        }
      />
      {filter.search && (
        <button
          onClick={() => setFilter((prev: any) => ({ ...prev, search: "", pageNumber: 1 }))}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
