// import './App.css';
// import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import "react-confirm-alert/src/react-confirm-alert.css";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import ReactDOM from "react-dom";
import TicketList from "./TicketList";
import UserList from "./UserList";
import TicketEntry from "./components/TicketEntry";
import TicketEntryV2 from "./V2View/pages/Ticket/TicketEntry";
import LoadingSpinner from "./LoadingSpinner";
import NoPage from "./NoPage";
import Layout from "./Layout";
import TicketView from "./TicketView";
import Login from "./Login";

import axios from "axios";
// import './Login.css'; // Import your CSS file
import Loading from "./components/Loading";
import { APIURLS } from "./APIURLS";

import {
  MsalProvider,
  AuthenticatedTemplate,
  useMsal,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { Container, Button } from "react-bootstrap";
import { PageLayout } from "./components/PageLayout";
import { IdTokenData } from "./components/DataDisplay";
import { loginRequest } from "./authConfig";
import { NavigationBar } from "./components/NavigationBar";
import BranchList from "./BranchList";
import ViewTicketLink from "./ticketcomponents/ViewTicketLink";
import SubDepartmentList from "../src/SubDepartmentList";
import OvertimeList from "./OvertimeList";
import AppSettings from "./AppSettings";
import AssetList from "./assetComponents/AssetList";
import AssetForm from "./assetComponents/AssetForm";
import { ToastContainer } from "react-toastify";
import UserListNotEmail from "./UserListNotEmail";
import logo from "./img/logo.svg";
import TicketEntryIS from "./components/TicketEntryIS";
import Main from "./V2View/Main.tsx";
import Tickets from "./V2View/pages/Ticket/Tickets";
import TicketsEng from "./V2View/pages/Ticket/TicketsEng";
import Assets from "./V2View/pages/Asset/Assets";
import Users from "./V2View/pages/User/Users";
import Branches from "./V2View/pages/Branch/Branches";
import NotFoundPage from "./V2View/component/NotFoundPage";
import NotRegisteredPage from "./V2View/component/NotRegisteredPage ";
import TicketReport from "./V2View/pages/Report/TicketReport";
import AverageResponseTimeReport from "./V2View/pages/Report/AverageResponseTimeReport";
import AverageResolutionTimeReport from "./V2View/pages/Report/AverageResolutionTimeReport";
import ChatModule from "./V2View/component/ChatModule";
import Categories from "./V2View/pages/Category/Categories";
import ItemStocks from "./V2View/pages/ItemStock/ItemStocks";
import SuppliesReport from "./V2View/pages/Report/SuppliesReport";
import TicketEntry2 from "./V2View/pages/Ticket/TicketEntry2";
import Tickets2 from "./V2View/pages/Ticket/Tickets2";
import { ToastProvider } from "./V2View/component/ToastContext";
import { AuthProvider } from "./V2View/component/AuthContext";
import MainManagement from "./V2View/pages/Management/MainManagement";
import TicketDashboard from "./V2View/pages/Dashboard/TicketDashboard";
import WorkstreamEntry from "./V2View/pages/Workstream/WorkstreamEntry";
import Workstreams from "./V2View/pages/Workstream/WorkstreamList";

const MainContent = () => {
  /**
   * useMsal is hook that returns the PublicClientApplication instance,
   * that tells you what msal is currently doing. For more, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
   */

  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  const handleRedirect = () => {
    instance
      .loginRedirect({
        ...loginRequest,
        prompt: "create",
      })
      .catch(() => {});
  };
  const handleLogoutRedirect = () => {
    instance.logoutRedirect().catch(() => {});
  };

  const [company, setCompany] = useState("");
  const [username, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [iserror, setisError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const baseName = "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setisError(false);
    axios
      .post(APIURLS.user.login(), {
        username,
        password,
      })
      .then((res) => {
        setIsLoading(false);
        setIsSubmitted(true);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("fullname", res.data.fullName);
        localStorage.setItem("email", res.data.email);
        localStorage.setItem("roletext", res.data.roleText);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("id", res.data.id);
        localStorage.setItem("departmentbase", res.data.departmentBase);

        // if (rememberMe) {
        //   localStorage.setItem("rememberme", "true");
        // } else {
        //   localStorage.removeItem("rememberme");
        // }

        // sessionStorage.setItem("rememberme", rememberMe);

        // Redirect to home page after successful login
        window.location.href = "/";
      })
      .catch(function (error) {
        setisError(true);
        setIsLoading(false);
      });
  };

  // On component mount, set default value in localStorage
  useEffect(() => {
    const storedCompany = localStorage.getItem("company");
    if (storedCompany) {
      setCompany(storedCompany);
    } else {
      localStorage.setItem("company", "ticketapp1");
    }
  }, []);

  // Whenever company changes, update localStorage
  useEffect(() => {
    if (company) {
      localStorage.setItem("company", company);
    }
  }, [company]);

  const renderForm = (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex justify-center">
              {/* <img width={300} className="mt-6 mb-4" src={logo} alt="Logo" /> */}
              <h1 className="block text-2xl text-gray-700 text-left font-bold p-2">
                TICKET MANAGEMENT SYSTEM
              </h1>
            </div>
            <div className="space-y-4">
              {/* <div>
                <label className="block text-gray-700 text-left font-bold p-2">
                  Company
                </label>

                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="ticketapp1">ticketapp1</option>
                  <option value="ticketapp2">ticketapp2</option>
                  <option value="ticketapp3">ticketapp3</option>
                </select>
              </div> */}

              <div>
                <label className="block text-gray-700 text-left font-bold p-2">
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUser(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-left font-bold p-2">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {iserror && (
                <div className="text-red-500 text-sm">
                  Invalid username or password.
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                id="rememberMeCheckbox"
                className="w-4 h-4"
              />
              <label htmlFor="rememberMeCheckbox" className="text-gray-700">
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold"
            >
              Login
            </button>
          </form>

          {isLoading && <Loading />}

          {/* Divider */}
          <div className="relative my-6">
            <hr className="border-gray-300" />
            <span className="absolute inset-x-0 -top-3 bg-white text-gray-600 px-2 mx-auto text-sm w-max">
              OR
            </span>
          </div>

          {/* Microsoft Login Form */}
          <div className="space-y-4">
            <button
              onClick={handleRedirect}
              className="w-full flex items-center justify-center bg-white border border-gray-400 text-gray-800 py-2 rounded-md font-semibold hover:bg-gray-100"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png"
                alt="Microsoft Logo"
                className="w-5 h-5 mr-3"
              />
              Sign in with Microsoft
            </button>

            {localStorage.getItem("error") && (
              <div className="text-red-500 text-sm text-center">
                {localStorage.getItem("error")}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="App">
      <AuthProvider>
        <ToastProvider>
          {activeAccount ? (
            <AuthenticatedTemplate>
              <>
                <ToastContainer />
                <BrowserRouter basename="/">
                  <Routes>
                  <Route path="/notregister" element={<NotRegisteredPage />} />

                  <Route path="/" element={<Main />}>
                    {/* this is V2 */}
                    <Route path="/dashboard" element={<TicketDashboard />} />
                    <Route index element={<Tickets />} />

                    <Route
                      path="/ticketview/:ticketNum"
                      element={<Tickets />}
                    />
                    <Route
                      path="/v2/ticketview/:ticketNum"
                      element={<Tickets />}
                    />
                    <Route path="/management" element={<MainManagement />} />
                    <Route path="/assets" element={<Assets />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/branches" element={<Branches />} />
                    {/* <Route path="/ticketentry" element={<TicketEntryV2 />} /> */}
                    <Route path="/ticketentry" element={<TicketEntry2 />} />
                    <Route path="*" element={<NotFoundPage />} />
                    <Route path="/ticketreport" element={<TicketReport />} />
                    <Route
                      path="/responsetimereport"
                      element={<AverageResponseTimeReport />}
                    />
                    <Route
                      path="/resolutiontimereport"
                      element={<AverageResolutionTimeReport />}
                    />
                    <Route path="/engineering" element={<TicketsEng />} />
                    <Route path="/chatbot" element={<ChatModule />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/itemstocks" element={<ItemStocks />} />
                    <Route
                      path="/suppliesreport"
                      element={<SuppliesReport />}
                    />

                    <Route
                      path="/workstreamentry"
                      element={<WorkstreamEntry />}
                    />
                    <Route path="/workstreams" element={<Workstreams />} />
                    <Route
                      path="/workstreamview/:workstreamNum"
                      element={<Workstreams />}
                    />
                  </Route>
                </Routes>
              </BrowserRouter>
            </>
          </AuthenticatedTemplate>
        ) : localStorage.getItem("id") ? (
          <>
            <ToastContainer />
            <BrowserRouter basename="/">
              <Routes>
                <Route path="/submitticket" element={<TicketEntryIS />}></Route>

                <Route path="/" element={<Main />}>
                  {/* this is V2 */}
                  <Route path="/dashboard" element={<TicketDashboard />} />
                  <Route index element={<Tickets />} />
                  <Route path="/ticketview/:ticketNum" element={<Tickets />} />
                  <Route
                    path="/v2/ticketview/:ticketNum"
                    element={<Tickets />}
                  />
                  <Route path="/management" element={<MainManagement />} />
                  <Route path="/assets" element={<Assets />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/branches" element={<Branches />} />
                  {/* <Route path="/ticketentry" element={<TicketEntryV2 />} /> */}
                  <Route path="/ticketentry" element={<TicketEntry2 />} />
                  <Route path="*" element={<NotFoundPage />} />
                  <Route path="/ticketreport" element={<TicketReport />} />
                  <Route
                    path="/responsetimereport"
                    element={<AverageResponseTimeReport />}
                  />
                  <Route
                    path="/resolutiontimereport"
                    element={<AverageResolutionTimeReport />}
                  />
                  <Route path="/engineering" element={<TicketsEng />} />
                  <Route path="/chatbot" element={<ChatModule />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/itemstocks" element={<ItemStocks />} />
                  <Route path="/suppliesreport" element={<SuppliesReport />} />
                  <Route
                    path="/workstreamentry"
                    element={<WorkstreamEntry />}
                  />
                  <Route path="/workstreams" element={<Workstreams />} />
                  <Route
                    path="/workstreamview/:workstreamNum"
                    element={<Workstreams />}
                  />
                </Route>
              </Routes>
            </BrowserRouter>
          </>
          ) : (
            <UnauthenticatedTemplate>{renderForm}</UnauthenticatedTemplate>
          )}
        </ToastProvider>
      </AuthProvider>
      {/* <UnauthenticatedTemplate>
        <>
          {renderForm}
        </>
      </UnauthenticatedTemplate> */}
    </div>
  );
};

const App = ({ instance }) => {
  return (
    <MsalProvider instance={instance}>
      {/* <PageLayout> */}
      <MainContent />
      {/* </PageLayout> */}
    </MsalProvider>
  );
};

export default App;
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<App />);
