import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import userLogo from "../../src/img/user.png";
import applogo from "../../src/img/iloilosupermart.png";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../V2View/component/NotificationBell";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppSetting from "./AppSettingView";
import ProfileView from "./ProfileViewNew";
import ResetPassword from "./ResetPassword";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faBell,
  faUsersCog,
  faCog,
  faPlusCircle,
  faTicketAlt,
  faChartBar,
  faChevronDown,
  faChevronUp,
  faBuilding,
  faProjectDiagram,
  faUser,
  faKey,
  faSignOutAlt,
  faSun,
  faMoon,
  faTachometerAlt
} from "@fortawesome/free-solid-svg-icons";

const TopNavigation = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTicketEntryOpen, setIsTicketEntryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isManagementDropdownOpen, setIsManagementDropdownOpen] =
    useState(false);
  const [isReportingDropdownOpen, setIsReportingDropdownOpen] = useState(false);
  const [isProfileDropDownOpen, setIsProfileDropDownOpen] = useState(false);
  const [viewAppSetting, setViewAppSetting] = useState(false);
  const [viewProfile, setViewProfile] = useState(false);
  const [viewResetPassword, setViewResetPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleManagementDropdown = () => {
    setIsManagementDropdownOpen(!isManagementDropdownOpen);
  };
  const toggleReportingDropdown = () => {
    setIsReportingDropdownOpen(!isReportingDropdownOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };
  const OpenAppSetting = () => {
    setViewAppSetting(viewAppSetting ? false : true);
  };
  const OpenProfile = () => {
    setViewProfile(viewProfile ? false : true);
  };
  const OpenReset = () => {
    setViewResetPassword(viewResetPassword ? false : true);
  };
  const openTicketEntry = () => {
    setIsTicketEntryOpen(true);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };
  //       setIsReportingDropdownOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  TABANG
                </h1>
              </div>
              {/* Desktop Menu */}
              <div className="hidden md:flex ml-6 space-x-1">
                <Link
                  to="/dashboard"
                  className="text-white/90 hover:text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTachometerAlt} />
                  <span className="hidden lg:inline">Dashboard</span>
                </Link>

                <Link
                  to="/ticketentry"
                  className="text-white/90 hover:text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlusCircle} />
                  <span className="hidden lg:inline">Create Ticket</span>
                </Link>

                <Link
                  to="/"
                  className="text-white/90 hover:text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTicketAlt} />
                  <span className="hidden lg:inline">Tickets</span>
                </Link>
                {localStorage.getItem("role") !== "2" && (
                  <Link
                    to="/workstreams"
                    className="text-white/90 hover:text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faProjectDiagram} />
                    <span className="hidden lg:inline">Workstream</span>
                  </Link>
                )}


                {/* {localStorage.getItem("role") === "50" && (
                  <div className="relative">
                    <button
                      onClick={
                        localStorage.getItem("role") === "0" ||
                          localStorage.getItem("role") === "50"
                          ? toggleReportingDropdown
                          : undefined
                      }
                      className="text-white/90 hover:text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faChartBar} />
                      <span className="hidden lg:inline">Reporting</span>
                      <FontAwesomeIcon icon={isReportingDropdownOpen ? faChevronUp : faChevronDown} className="text-xs" />
                    </button>
                    {isReportingDropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className="absolute left-0 mt-2 space-y-1 flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-xl p-2 w-72 text-left z-50 border border-gray-200 dark:border-gray-700"
                      >
                        <Link
                          onClick={toggleReportingDropdown}
                          to="/ticketreport"
                          className="p-3 text-gray-700 dark:text-gray-200 font-semibold no-underline transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
                        >
                          Tickets
                        </Link>

                        <Link
                          onClick={toggleReportingDropdown}
                          to="/responsetimereport"
                          className="p-3 text-gray-700 dark:text-gray-200 font-semibold no-underline transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
                        >
                          Average Response Time
                        </Link>

                        <Link
                          onClick={toggleReportingDropdown}
                          to="/resolutiontimereport"
                          className="p-3 text-gray-700 dark:text-gray-200 font-semibold no-underline transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
                        >
                          Average Resolution Time
                        </Link>

                        <Link
                          onClick={toggleReportingDropdown}
                          to="/suppliesreport"
                          className="p-3 text-gray-700 dark:text-gray-200 font-semibold no-underline transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
                        >
                          Supplies History
                        </Link>
                      </div>
                    )}
                  </div>
                )} */}

                {localStorage.getItem("role") === "50" && (
                  <Link
                    to="/management"
                    className="text-white/90 hover:text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCog} />
                    <span className="hidden lg:inline">Management</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4 relative">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200 focus:outline-none"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <FontAwesomeIcon
                  icon={darkMode ? faSun : faMoon}
                  className="text-lg"
                />
              </button>

              <NotificationBell />

              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="hidden sm:flex items-center gap-3 text-white/90 hover:text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm focus:outline-none"
                >
                  <img
                    src={userLogo}
                    alt="User"
                    className="w-9 h-9 rounded-full cursor-pointer border-2 border-white/50 shadow-lg"
                  />
                  <span className="hidden lg:inline">{localStorage.getItem("fullname")}</span>
                  <FontAwesomeIcon icon={isDropdownOpen ? faChevronUp : faChevronDown} className="text-xs" />
                </button>

                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 space-y-1 flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-xl p-2 w-56 text-left z-50 border border-gray-200 dark:border-gray-700"
                  >
                    <button
                      onClick={OpenProfile}
                      className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 font-medium no-underline transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-left"
                    >
                      <FontAwesomeIcon icon={faUser} className="w-4" />
                      Profile
                    </button>

                    <button
                      onClick={OpenReset}
                      className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 font-medium no-underline transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-left"
                    >
                      <FontAwesomeIcon icon={faKey} className="w-4" />
                      Reset Password
                    </button>

                    {/* {localStorage.getItem("role") === "50" && (
                      <button
                        onClick={OpenAppSetting}
                        className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 font-medium no-underline transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-left"
                      >
                        <FontAwesomeIcon icon={faCog} className="w-4" />
                        App Settings
                      </button>
                    )} */}

                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                    <button
                      onClick={logout}
                      className="flex items-center gap-3 p-3 text-red-600 dark:text-red-400 font-medium no-underline transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2.5 rounded-lg text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
              onClick={() => setMobileMenuOpen(true)}
            >
              <FontAwesomeIcon icon={faBars} className="text-xl" />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 max-w-full bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle - Mobile */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <FontAwesomeIcon
                  icon={darkMode ? faSun : faMoon}
                  className="text-lg"
                />
              </button>
              <button
                className="p-2 rounded-lg text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Dashboard */}
            <Link
              to="/dashboard"
              className="flex items-center gap-3 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl text-base font-semibold hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faTachometerAlt} className="w-5" />
              Dashboard
            </Link>

            {/* Create Ticket */}
            <Link
              to="/ticketentry"
              className="flex items-center gap-3 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl text-base font-semibold hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faPlusCircle} className="w-5" />
              Create Ticket
            </Link>

            {/* Tickets */}
            <Link
              to="/"
              className="flex items-center gap-3 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl text-base font-semibold hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faTicketAlt} className="w-5" />
              Tickets
            </Link>

            {localStorage.getItem("role") !== "2" && (
              <Link
                to="/workstreams"
                className="flex items-center gap-3 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl text-base font-semibold hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faProjectDiagram} className="w-5" />
                Workstream
              </Link>
            )}

            {/* Reporting Dropdown */}
            {/* {localStorage.getItem("role") === "50" && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // stop parent clicks
                    setIsReportingDropdownOpen(!isReportingDropdownOpen);
                  }}
                  className="flex items-center justify-between w-full text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faChartBar} className="w-5" />
                    Reporting
                  </div>
                  <FontAwesomeIcon
                    icon={isReportingDropdownOpen ? faChevronUp : faChevronDown}
                    className="text-sm"
                  />
                </button>

                {isReportingDropdownOpen && (
                  <div className="ml-8 flex flex-col space-y-1 mt-2">
                    {[
                      "ticketreport",
                      "responsetimereport",
                      "resolutiontimereport",
                      "suppliesreport",
                    ].map((path) => (
                      <Link
                        key={path}
                        to={`/${path}`}
                        className="px-4 py-2.5 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                        onClick={() => {
                          setMobileMenuOpen(false); // close mobile menu
                          setIsReportingDropdownOpen(false); // close dropdown
                        }}
                      >
                        {path
                          .replace("ticketreport", "Tickets")
                          .replace(
                            "responsetimereport",
                            "Average Response Time"
                          )
                          .replace(
                            "resolutiontimereport",
                            "Average Resolution Time"
                          )
                          .replace("suppliesreport", "Supplies History")}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )} */}

            <div className="relative">
              {localStorage.getItem("role") === "50" && (
                <Link
                  to="/management"
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl text-base font-semibold hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faCog} className="w-5" />
                  Management
                </Link>
              )}
            </div>
          </div>

          {/* USER INFO WITH DROPDOWN */}
          <div className="relative sm:hidden border-t-2 border-gray-200 dark:border-gray-700">
            <div
              onClick={() => setIsProfileDropDownOpen(!isProfileDropDownOpen)}
              className="p-5 flex items-center w-full cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200"
            >
              <img
                className="h-12 w-12 rounded-full border-2 border-blue-500 shadow-lg"
                src={userLogo}
                alt="User"
              />

              {/* Name + Email */}
              <div className="ml-4 flex flex-col flex-1">
                <span className="text-base font-bold text-gray-800 dark:text-white">
                  {localStorage.getItem("fullname")}
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {localStorage.getItem("email")}
                </span>
              </div>

              {/* Chevron aligned to the right */}
              <FontAwesomeIcon
                icon={isProfileDropDownOpen ? faChevronUp : faChevronDown}
                className="ml-auto text-blue-600 dark:text-blue-400 text-sm"
              />
            </div>

            {isProfileDropDownOpen && (
              <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-xl p-2 z-50 space-y-1 mb-2">
                <button
                  onClick={() => {
                    OpenProfile();
                    setIsProfileDropDownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg font-semibold transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faUser} className="w-4" />
                  Profile
                </button>

                <button
                  onClick={() => {
                    OpenReset();
                    setIsProfileDropDownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg font-semibold transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faKey} className="w-4" />
                  Reset Password
                </button>

                {/* {localStorage.getItem("role") === "50" && (
                  <button
                    onClick={() => { OpenAppSetting(); setIsProfileDropDownOpen(false); }}
                    className="w-full flex items-center gap-3 text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg font-semibold transition-all duration-200"
                  >
                    <FontAwesomeIcon icon={faCog} className="w-4" />
                    App Settings
                  </button>
                )} */}

                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                <button
                  onClick={() => {
                    logout();
                    setIsProfileDropDownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AppSetting view={viewAppSetting} setView={setViewAppSetting} />
      <ProfileView view={viewProfile} setView={setViewProfile} />
      <ResetPassword view={viewResetPassword} setView={setViewResetPassword} />
    </>
  );
};

export default TopNavigation;
