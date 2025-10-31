// src/components/layout/LandingHeader.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'For Schools', href: '#for-schools' },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-200/50'
          : 'bg-white/70 backdrop-blur-sm border-b border-gray-100/50'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg md:text-xl">P</span>
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                PrepMint
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="px-3 lg:px-4 py-2 text-gray-700 hover:text-cyan-600 font-medium rounded-lg transition-colors relative group"
                whileHover={{ y: -1 }}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </motion.a>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/login">
              <motion.button
                className="px-5 py-2.5 rounded-full font-semibold text-gray-700 hover:text-cyan-600 hover:bg-gray-100 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Log in
              </motion.button>
            </Link>
            <Link href="/signup">
              <motion.button
                className="px-6 py-2.5 rounded-full font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-emerald-600 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign up free
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-gray-200"
            >
              <nav className="py-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    className="block px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </motion.a>
                ))}
                <div className="pt-4 pb-2 px-4 space-y-3 border-t border-gray-200">
                  <Link href="/login">
                    <motion.button
                      className="w-full px-4 py-3 rounded-full font-semibold text-gray-700 hover:text-cyan-600 hover:bg-gray-100 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </motion.button>
                  </Link>
                  <Link href="/signup">
                    <motion.button
                      className="w-full px-4 py-3 rounded-full font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign up free
                    </motion.button>
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}