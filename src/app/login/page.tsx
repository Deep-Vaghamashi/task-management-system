"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Send the data using our custom engine
      const response = await api.post('/auth/login', formData);

      // 2. If we get here, it worked! (Axios throws an error if it fails)
      alert(response.data.message); // "Login successful!"
      
      // TODO: We will redirect the user here later
      router.push('/dashboard');

    } catch (error: any) {
      // 3. If something breaks, we catch it here
      // Axios puts the backend error message inside error.response.data
      if (error.response) {
        alert(error.response.data.error);
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Sign In</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Email or Username</label>
                <input
                    name="identifier"
                    type="text"
                    value={formData.identifier}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            {/* Password Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none"
            >
              Sign In
            </button>
        </form>
      </div>
    </div>
  );
}