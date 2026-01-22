"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from "next/image";
export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('mobile');
    setIsLoggedIn(false);
    
    // Redirect to auth form
    router.push('/Authform');
  };

  const handleLoginClick = () => {
    router.push('/Authform');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left - Logo */}
        
<div className="flex items-center space-x-4">
  <div
    className="flex items-center cursor-pointer"
    onClick={() => router.push('/')}
  >
    <Image
      src="/24carlogo.png"   // put your image in /public
      alt="Car Rental Logo"
      width={80}
      height={40}
      className="object-contain"
    />
   
  </div>
</div>
          
          {/* Right - Buttons */}
          <div className="flex items-center space-x-4">
            {isLoggedIn && (
              <button 
                onClick={() => router.push('/my-bookings')}
                className="hidden md:flex items-center space-x-2 px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors"
              >
                <span className="text-sm font-medium">📅</span>
                <span className="text-sm font-medium">My Bookings</span>
              </button>
            )}
            <button className="hidden md:flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <span className="text-sm font-medium">📱</span>
              <span className="text-sm font-medium">Get the App</span>
            </button>
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Logout
              </button>
            ) : (
              <button 
                onClick={handleLoginClick}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Login/Signup
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
