// src/components/layout/InstitutionDashboardHeader.tsx
"use client";

import {
  Bell,
  User,
  LogOut,
  Settings as SettingsIcon,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from '@/lib/logger';

// Types
type Notification = {
  id: number;
  message: string;
  time: string;
  read: boolean;
};

type Institution = {
  id: string;
  name: string;
  logo?: string;
};

export default function InstitutionDashboardHeader() {
  // State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInstitutionOpen, setIsInstitutionOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: "New student enrolled", time: "2 min ago", read: false },
    { id: 2, message: "Quarterly report is ready", time: "1 hour ago", read: true },
    { id: 3, message: "Assignment submitted by Class B", time: "3 hours ago", read: true },
  ]);
  
  // Mock institutions data
  const [institutions] = useState<Institution[]>([
    { id: "inst1", name: "Central University", logo: "/logo1.png" },
    { id: "inst2", name: "Metropolitan College", logo: "/logo2.png" },
    { id: "inst3", name: "Tech Institute", logo: "/logo3.png" },
  ]);
  
  const [currentInstitution, setCurrentInstitution] = useState<Institution>(
    institutions[0]
  );

  // Keyboard navigation state
  const [notificationFocusIndex, setNotificationFocusIndex] = useState<number | null>(null);
  const [profileFocusIndex, setProfileFocusIndex] = useState<number | null>(null);
  const [institutionFocusIndex, setInstitutionFocusIndex] = useState<number | null>(null);

  // Unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Refs for detecting outside clicks and keyboard navigation
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const institutionRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const institutionButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdowns on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
        setIsInstitutionOpen(false);
        setIsMobileMenuOpen(false);
        setNotificationFocusIndex(null);
        setProfileFocusIndex(null);
        setInstitutionFocusIndex(null);
      }
      
      // Handle arrow keys for notification dropdown
      if (isNotificationOpen && notifications.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setNotificationFocusIndex(prev => 
            prev === null ? 0 : Math.min(prev + 1, notifications.length - 1)
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setNotificationFocusIndex(prev => 
            prev === null ? notifications.length - 1 : Math.max(prev - 1, 0)
          );
        } else if (e.key === "Enter" && notificationFocusIndex !== null) {
          toggleRead(notifications[notificationFocusIndex].id);
        }
      }
      
      // Handle arrow keys for profile dropdown
      if (isProfileOpen) {
        const profileItems = 3; // Profile, Settings, Logout
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setProfileFocusIndex(prev => 
            prev === null ? 0 : Math.min(prev + 1, profileItems - 1)
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setProfileFocusIndex(prev => 
            prev === null ? profileItems - 1 : Math.max(prev - 1, 0)
          );
        } else if (e.key === "Enter" && profileFocusIndex !== null) {
          if (profileFocusIndex === 2) {
            handleLogout();
          } else {
            setIsProfileOpen(false);
          }
        }
      }
      
      // Handle arrow keys for institution dropdown
      if (isInstitutionOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setInstitutionFocusIndex(prev => 
            prev === null ? 0 : Math.min(prev + 1, institutions.length - 1)
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setInstitutionFocusIndex(prev => 
            prev === null ? institutions.length - 1 : Math.max(prev - 1, 0)
          );
        } else if (e.key === "Enter" && institutionFocusIndex !== null) {
          setCurrentInstitution(institutions[institutionFocusIndex]);
          setIsInstitutionOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isNotificationOpen, isProfileOpen, isInstitutionOpen, notificationFocusIndex, profileFocusIndex, institutionFocusIndex, notifications, institutions]);

  // Focus management for dropdowns
  useEffect(() => {
    if (isNotificationOpen && notificationRef.current) {
      const firstItem = notificationRef.current.querySelector('li');
      if (firstItem && notificationFocusIndex === null) {
        (firstItem as HTMLElement).focus();
      }
    }
  }, [isNotificationOpen, notificationFocusIndex]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(e.target as Node)
      ) {
        setIsNotificationOpen(false);
        setNotificationFocusIndex(null);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
        setProfileFocusIndex(null);
      }
      if (
        institutionRef.current &&
        !institutionRef.current.contains(e.target as Node) &&
        institutionButtonRef.current &&
        !institutionButtonRef.current.contains(e.target as Node)
      ) {
        setIsInstitutionOpen(false);
        setInstitutionFocusIndex(null);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle single notification read status
  const toggleRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Logout handler
  const handleLogout = () => {
    logger.log("User logged out");
    setIsProfileOpen(false);
  };

  // Switch institution
  const switchInstitution = (institution: Institution) => {
    setCurrentInstitution(institution);
    setIsInstitutionOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm relative">
      {/* Mobile menu button */}
      <button
        ref={mobileMenuButtonRef}
        className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        onClick={toggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop: Institution info and title */}
      <div className="hidden md:block">
        <h2 className="text-xl font-bold text-gray-800">Institution Dashboard</h2>
        <p className="text-sm text-gray-600">Welcome back, Admin</p>
      </div>

      {/* Mobile: Institution selector and title */}
      <div className="md:hidden absolute left-1/2 transform -translate-x-1/2 text-center">
        <h2 className="text-lg font-bold text-gray-800">Dashboard</h2>
        <p className="text-xs text-gray-600">{currentInstitution.name}</p>
      </div>

      <div className="flex items-center gap-2 md:gap-4 relative">
        {/* Institution Dropdown - Desktop */}
        <div className="hidden md:block relative" ref={institutionRef}>
          <button
            ref={institutionButtonRef}
            className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsInstitutionOpen(!isInstitutionOpen)}
            aria-expanded={isInstitutionOpen}
            aria-haspopup="true"
            id="institution-button"
            aria-controls="institution-dropdown"
          >
            {currentInstitution.logo ? (
              <img 
                src={currentInstitution.logo} 
                alt={currentInstitution.name} 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                {currentInstitution.name.charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium text-gray-800 hidden md:block">
              {currentInstitution.name}
            </span>
            <ChevronDown size={16} className={`transition-transform ${isInstitutionOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isInstitutionOpen && (
              <motion.div
                id="institution-dropdown"
                className="absolute left-0 mt-2 w-64 rounded-lg bg-white shadow-lg border z-50 overflow-hidden"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                role="menu"
                aria-labelledby="institution-button"
              >
                <div className="p-3 border-b bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">Select Institution</p>
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  {institutions.map((inst, index) => (
                    <motion.li
                      key={inst.id}
                      className={`p-3 cursor-pointer transition flex items-center gap-3 hover:bg-gray-50 ${
                        inst.id === currentInstitution.id ? 'bg-blue-50 font-medium' : ''
                      }`}
                      onClick={() => switchInstitution(inst)}
                      tabIndex={0}
                      role="menuitem"
                      aria-selected={inst.id === currentInstitution.id}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          switchInstitution(inst);
                        }
                      }}
                      onFocus={() => setInstitutionFocusIndex(index)}
                      onBlur={() => setInstitutionFocusIndex(null)}
                      style={{ 
                        backgroundColor: institutionFocusIndex === index ? '#f3f4f6' : 'transparent' 
                      }}
                    >
                      {inst.logo ? (
                        <img 
                          src={inst.logo} 
                          alt={inst.name} 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                          {inst.name.charAt(0)}
                        </div>
                      )}
                      <span>{inst.name}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            ref={notificationButtonRef}
            className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            aria-expanded={isNotificationOpen}
            aria-haspopup="true"
            id="notification-button"
            aria-controls="notification-dropdown"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-red-500 text-xs font-medium text-white flex items-center justify-center px-1"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationOpen && (
              <motion.div
                id="notification-dropdown"
                className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg border z-50 overflow-hidden"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                role="menu"
                aria-labelledby="notification-button"
              >
                <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700">Notifications</p>
                  {notifications.some(n => !n.read) && (
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={markAllAsRead}
                      aria-label="Mark all notifications as read"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <li className="p-4 text-center text-gray-500 text-sm">No new notifications</li>
                  ) : (
                    notifications.map((notif, index) => (
                      <motion.li
                        key={notif.id}
                        className={`p-3 border-b text-sm cursor-pointer transition ${
                          notif.read
                            ? "bg-white text-gray-600 hover:bg-gray-50"
                            : "bg-blue-50 text-gray-800 font-medium hover:bg-blue-100"
                        }`}
                        onClick={() => toggleRead(notif.id)}
                        tabIndex={0}
                        role="menuitem"
                        aria-label={`${notif.message}, ${notif.time}${notif.read ? ', read' : ', unread'}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleRead(notif.id);
                          }
                        }}
                        onFocus={() => setNotificationFocusIndex(index)}
                        onBlur={() => setNotificationFocusIndex(null)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1 }}
                      >
                        <p>{notif.message}</p>
                        <p className="text-xs opacity-75 mt-1">{notif.time}</p>
                      </motion.li>
                    ))
                  )}
                </ul>
                {notifications.length > 0 && (
                  <div className="p-2 bg-gray-50 text-right border-t">
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={markAllAsRead}
                      aria-label="Mark all notifications as read"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            ref={profileButtonRef}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            id="profile-button"
            aria-controls="profile-dropdown"
          >
            <div className="rounded-full bg-gray-200 p-2 text-gray-600">
              <User size={20} />
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">{currentInstitution.name}</p>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                id="profile-dropdown"
                className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg border z-50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                role="menu"
                aria-labelledby="profile-button"
              >
                <div className="p-3 border-b">
                  <p className="text-sm font-medium text-gray-800">Signed in as</p>
                  <p className="text-xs text-gray-600">admin@institution.edu</p>
                </div>
                <ul>
                  <motion.li 
                    whileHover={{ backgroundColor: "#f3f4f6" }} 
                    className="overflow-hidden"
                  >
                    <a
                      href="/dashboard/institution/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700"
                      role="menuitem"
                      tabIndex={0}
                      onFocus={() => setProfileFocusIndex(0)}
                      onBlur={() => setProfileFocusIndex(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setIsProfileOpen(false);
                        }
                      }}
                    >
                      <User size={16} />
                      My Profile
                    </a>
                  </motion.li>
                  <motion.li 
                    whileHover={{ backgroundColor: "#f3f4f6" }} 
                    className="overflow-hidden"
                  >
                    <a
                      href="/dashboard/institution/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700"
                      role="menuitem"
                      tabIndex={0}
                      onFocus={() => setProfileFocusIndex(1)}
                      onBlur={() => setProfileFocusIndex(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setIsProfileOpen(false);
                        }
                      }}
                    >
                      <SettingsIcon size={16} />
                      Settings
                    </a>
                  </motion.li>
                  <motion.li 
                    whileHover={{ backgroundColor: "#fdf7f7" }} 
                    className="overflow-hidden"
                  >
                    <button
                      type="button"
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600"
                      role="menuitem"
                      tabIndex={0}
                      onFocus={() => setProfileFocusIndex(2)}
                      onBlur={() => setProfileFocusIndex(null)}
                      onClick={handleLogout}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleLogout();
                        }
                      }}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 bg-white z-50 md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 id="mobile-menu-title" className="text-xl font-bold text-gray-800">Menu</h2>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {/* Institution Selector in Mobile Menu */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Institution</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {currentInstitution.logo ? (
                      <img 
                        src={currentInstitution.logo} 
                        alt={currentInstitution.name} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {currentInstitution.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium">{currentInstitution.name}</span>
                  </div>
                  
                  <button
                    className="w-full mt-3 p-3 text-left bg-white border rounded-lg hover:bg-gray-50 transition"
                    onClick={() => {
                      setIsInstitutionOpen(!isInstitutionOpen);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Switch Institution
                  </button>
                </div>
                
                {/* Quick Actions */}
                <div className="space-y-3">
                  <button
                    className="w-full p-3 text-left bg-white border rounded-lg hover:bg-gray-50 transition flex items-center gap-3"
                    onClick={() => {
                      setIsNotificationOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Bell size={20} />
                    <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                  </button>
                  
                  <a
                    href="/dashboard/institution/profile"
                    className="w-full p-3 text-left bg-white border rounded-lg hover:bg-gray-50 transition flex items-center gap-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={20} />
                    <span>My Profile</span>
                  </a>
                  
                  <a
                    href="/dashboard/institution/settings"
                    className="w-full p-3 text-left bg-white border rounded-lg hover:bg-gray-50 transition flex items-center gap-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <SettingsIcon size={20} />
                    <span>Settings</span>
                  </a>
                  
                  <button
                    className="w-full p-3 text-left bg-white border rounded-lg hover:bg-red-50 transition flex items-center gap-3 text-red-600"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close on click outside */}
      {(isNotificationOpen || isProfileOpen || isInstitutionOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsNotificationOpen(false);
            setIsProfileOpen(false);
            setIsInstitutionOpen(false);
            setNotificationFocusIndex(null);
            setProfileFocusIndex(null);
            setInstitutionFocusIndex(null);
          }}
          aria-hidden="true"
        />
      )}
    </header>
  );
}