"use client"; // This component runs in the browser

import React from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    >
      Logout
    </button>
  );
}