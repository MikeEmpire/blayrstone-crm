"use client";

// context/AuthContext.tsx - Authentication context and provider

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { ACCESS_TOKEN_KEY } from "@/lib/constants";

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_superuser?: boolean;
  is_staff?: boolean;
  groups: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isStaffViewer: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAdmin = () => {
    return user?.is_superuser || false;
  };

  const isStaffViewer = () => user?.groups?.includes("Staff Viewer") || false;

  const fetchUserProfile = async (token: string) => {
    const userProfile = await apiClient.fetchUserProfile(token);
    if (userProfile.error) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    setUser(userProfile);
  };

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      fetchUserProfile(token).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.login(username, password);

      if (response.error) {
        throw new Error("Login failed");
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, response.access);
      fetchUserProfile(response.access);

      router.push("/dashboard");
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isStaffViewer,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
