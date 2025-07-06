// src/context/UserContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  gender?: 'nam' | 'nu';
  birthday?: string; // định dạng yyyy-mm-dd
  address?: string;
};


type UserContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // ✅ Load user từ localStorage khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Không parse được user_info:', e);
      }
    }
  }, []);

  const login = (user: User) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_info');
    localStorage.removeItem('access_token'); // nếu có
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem('user_info', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser }}>

      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
