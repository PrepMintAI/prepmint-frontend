// src/components/layout/LandingHeader.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingHeader() {
  return (
    <motion.header 
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
            PrepMint
          </span>
        </motion.div>

        <nav className="hidden md:flex space-x-8">
          {['Features', 'How It Works', 'For Schools', 'Pricing'].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-gray-600 hover:text-blue-500 font-medium"
              whileHover={{ y: -2 }}
            >
              {item}
            </motion.a>
          ))}
        </nav>

        <div className="flex space-x-4">
          <Link href="/login">
            <motion.button
              className="px-4 py-2 rounded-full font-medium text-gray-600 hover:text-blue-500 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Log in
            </motion.button>
          </Link>
          <Link href="/signup">
            <motion.button
              className="px-4 py-2 rounded-full font-medium bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign up
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}