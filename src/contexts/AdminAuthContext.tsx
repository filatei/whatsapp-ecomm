'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  sendOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// List of admin phone numbers (you should move this to your database)
const ADMIN_PHONE_NUMBERS = [
  '+2347067647124', // Your number
];

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already authenticated
    const adminPhone = localStorage.getItem('adminPhone');
    if (adminPhone && ADMIN_PHONE_NUMBERS.includes(adminPhone)) {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const sendOTP = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      toast.success('OTP sent successfully');
    } catch (error) {
      toast.error('Failed to send OTP');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (phoneNumber: string, otp: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP');
      }

      if (ADMIN_PHONE_NUMBERS.includes(phoneNumber)) {
        localStorage.setItem('adminPhone', phoneNumber);
        setIsAdmin(true);
        toast.success('Admin access granted');
      } else {
        throw new Error('Unauthorized phone number');
      }
    } catch (error) {
      toast.error('Authentication failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminPhone');
    setIsAdmin(false);
    toast.success('Logged out successfully');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        isLoading,
        sendOTP,
        verifyOTP,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
} 