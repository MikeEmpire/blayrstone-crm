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
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      setUser({ id: 1, username: "admin", email: "" });
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.login(username, password);

      setUser({
        id: response.user?.id || 1,
        username: response.user?.username || username,
        email: response.user?.email || "",
      });

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
