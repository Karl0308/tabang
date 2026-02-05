import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import TopNavigation from "./TopNavigation";
import LoadPage from "./component/LoadPage";
import apiService from "../Services/ApiService";
import { APIURLS } from "../APIURLS";
import { useMsal } from "@azure/msal-react";
import { useAuth } from "./component/AuthContext";

const Main = () => {
  const { accounts } = useMsal();
  const { refreshUserData, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("id")) {
      getuserData();
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("theme")) {
      localStorage.setItem("theme", "light");
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("id");

    if (userId && Number(userId) > 0) {
      refreshUserData().catch(() => {
        // Error already handled by auth context
      });
    }
  }, [refreshUserData]);

  const getUsername = () => {
    return accounts.length > 0
      ? accounts[0].username.trim()
      : "No username found";
  };

  async function getuserData() {
    try {
      const res = await apiService.post(
        APIURLS.user.loginEmail() + "?email=" + getUsername()
      );

      await login(res.data.token, res.data.id);

      localStorage.setItem("enhancement", "enhancement");

      // Refresh the page state instead of full reload
      navigate(0);
    } catch (error) {
      navigate("/notregister");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black dark:bg-gray-900 dark:text-white">
      <TopNavigation />
      <main className="flex-grow overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto pb-4">
          <Outlet />
        </div>
      </main>
      <Footer />
      <LoadPage />
    </div>
  );
};

export default Main;
