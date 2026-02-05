import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import apiService from "../../Services/ApiService";
import { APIURLS } from "../../APIURLS";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  roleText: string;
  departmentBase: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userId?: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    const storedToken = localStorage.getItem("token");
    const storedId = localStorage.getItem("id");
    const storedFullName = localStorage.getItem("fullname");
    const storedEmail = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const storedRoleText = localStorage.getItem("roletext");
    const storedDepartmentBase = localStorage.getItem("departmentbase");

    if (storedToken && storedId) {
      setToken(storedToken);

      // If we have all user data in localStorage, use it immediately
      if (storedFullName && storedEmail && storedRole) {
        setUser({
          id: storedId,
          fullName: storedFullName,
          email: storedEmail,
          role: storedRole,
          roleText: storedRoleText || "",
          departmentBase: storedDepartmentBase || "",
        });
      }

      // Refresh user data from API to ensure it's up-to-date
      refreshUserData().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, userId?: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    if (userId) {
      localStorage.setItem("id", userId);
      await refreshUserData();
    }
  };

  const refreshUserData = async () => {
    const userId = localStorage.getItem("id");

    if (!userId || Number(userId) <= 0) {
      return;
    }

    try {
      const response = await apiService.get(APIURLS.user.getUserId() + userId);
      const userData = response.data;

      const newUser: User = {
        id: userData.id.toString(),
        fullName: userData.fullName || "",
        email: userData.email || "",
        role: userData.role?.toString() || "",
        roleText: userData.roleText || "",
        departmentBase: userData.departmentBase || "",
      };

      // Update state
      setUser(newUser);

      // Update localStorage for persistence
      localStorage.setItem("fullname", newUser.fullName);
      localStorage.setItem("email", newUser.email);
      localStorage.setItem("role", newUser.role);
      localStorage.setItem("roletext", newUser.roleText);
      localStorage.setItem("departmentbase", newUser.departmentBase);
      localStorage.setItem("id", newUser.id);
    } catch (error) {
      // If refresh fails, clear auth state
      logout();
      throw error;
    }
  };

  const logout = () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("fullname");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("roletext");
    localStorage.removeItem("departmentbase");
    localStorage.removeItem("company");

    // Clear state
    setToken(null);
    setUser(null);

    // Redirect to login
    window.location.href = "/login";
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    // Update localStorage
    if (updates.fullName) localStorage.setItem("fullname", updates.fullName);
    if (updates.email) localStorage.setItem("email", updates.email);
    if (updates.role) localStorage.setItem("role", updates.role);
    if (updates.roleText) localStorage.setItem("roletext", updates.roleText);
    if (updates.departmentBase) localStorage.setItem("departmentbase", updates.departmentBase);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUserData,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
