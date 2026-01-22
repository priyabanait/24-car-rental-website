"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import Image from "next/image";
export default function Footer() {
    const router = useRouter();
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
             <div
                 className="flex items-center cursor-pointer"
                 onClick={() => router.push('/')}
               >
                 <Image
                   src="/24carlogo.png"   // put your image in /public
                   alt="Car Rental Logo"
                   width={140}
                   height={80}
                   className="object-contain"
                 />
                
               </div>
             
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted partner for premium car rentals across India. Drive with confidence and comfort.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-green-500 transition-colors">Home</a></li>
              <li><a href="/cars" className="text-gray-400 hover:text-green-500 transition-colors">Our Fleet</a></li>
              <li><a href="/#features" className="text-gray-400 hover:text-green-500 transition-colors">Features</a></li>
              <li><a href="/#contact" className="text-gray-400 hover:text-green-500 transition-colors">Contact</a></li>
               <li><a href="/privacy-policy" className="text-gray-400 hover:text-green-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-green-500 transition-colors">Daily Rentals</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-500 transition-colors">Subscriptions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-500 transition-colors">Corporate</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-500 transition-colors">Airport Transfer</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Connect With Us</h3>
            <div className="flex gap-3 mb-4">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">📘</a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">📷</a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">🐦</a>
            </div>
            <div className="text-sm text-gray-400">
              <p className="mb-2">📧 support@carrental.com</p>
              <p>📞 +91 1800-XXX-XXXX</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2025 <span className="text-green-500 font-semibold">24-Car Rental</span>. All rights reserved. Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
}
