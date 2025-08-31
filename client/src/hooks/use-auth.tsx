import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/login", { username, password });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        toast({ title: "Success", description: "Logged in successfully!" });
        return true;
      } else {
        toast({ title: "Error", description: data.error || "Login failed", variant: "destructive" });
        return false;
      }
    } catch (error) {
      toast({ title: "Error", description: "Login failed. Please try again.", variant: "destructive" });
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/register", { username, password });
      const data = await response.json();
      
      if (data.success) {
        toast({ title: "Success", description: "Account created successfully! Please log in." });
        return true;
      } else {
        toast({ title: "Error", description: data.error || "Registration failed", variant: "destructive" });
        return false;
      }
    } catch (error) {
      toast({ title: "Error", description: "Registration failed. Please try again.", variant: "destructive" });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast({ title: "Success", description: "Logged out successfully!" });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
