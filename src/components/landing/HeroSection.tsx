'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Users, Award, Zap, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';

type Particle = {
  left: string;
  top: string;
  x: number;
  duration: number;
  delay: number;
};

export default function HeroSection() {
  const [, setIsScrolled] = useState(false);

  // Generate particles once using useMemo to avoid regenerating on every render
  const particles = useMemo<Particle[]>(() => {
    return [...Array(12)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      x: Math.random() * 40 - 20,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-600/20 via-blue-700/20 to-emerald-600/20 animate-pulse"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500 opacity-10 blur-3xl animate-bounce" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-emerald-500 opacity-10 blur-3xl animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        </div>

        {/* Particle Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                left: p.left,
                top: p.top,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, p.x, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Content */}
            <motion.div
              className="lg:w-1/2 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-gray-200">AI-Powered Learning Platform</span>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                <span className="block text-white">Transform Learning</span>
                <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Into Achievement
                </span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.7 }}
              >
                AI-powered assessments, instant feedback, and gamified progress tracking. PrepMint makes exam preparation engaging, effective, and rewarding.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
              >
                <Link href="/signup">
                  <motion.button
                    className="w-full sm:w-auto px-8 py-4 rounded-full font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started Free
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>

                <Link href="#for-schools">
                  <motion.button
                    className="w-full sm:w-auto px-8 py-4 rounded-full font-bold border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/10 backdrop-blur-sm transition-colors flex items-center justify-center group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Users className="mr-2 w-5 h-5" />
                    For Institutions
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.7 }}
              >
                <div className="flex items-center text-gray-300 gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                    <Award className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium">10K+ Active Learners</span>
                </div>
                <div className="flex items-center text-gray-300 gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 border border-cyan-400/20">
                    <Zap className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium">95% Success Rate</span>
                </div>
                <div className="flex items-center text-gray-300 gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium">Avg 40% Score Boost</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual Panel */}
            <motion.div
              className="lg:w-1/2 flex justify-center w-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="relative w-full max-w-lg">
                {/* Glassmorphism Card */}
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8">
                  {/* Holographic Dashboard */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-white/10 rounded-2xl w-full aspect-square flex flex-col items-center justify-center p-6">
                    {/* Glowing XP Meter */}
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-cyan-400 flex items-center justify-center mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-spin" style={{ animationDuration: '15s' }}></div>
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-extrabold text-white">85%</div>
                        <div className="text-xs text-gray-300">Progress</div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="text-2xl font-bold text-cyan-400">1,250</div>
                        <div className="text-xs text-gray-400">XP Earned</div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="text-2xl font-bold text-emerald-400">Level 8</div>
                        <div className="text-xs text-gray-400">Achievement</div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Achievement Badge */}
                  <motion.div
                    className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-3 shadow-lg transform rotate-6"
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 6 }}
                    transition={{ delay: 1, type: 'spring', stiffness: 300 }}
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-white" />
                      <span className="text-white font-bold text-sm">Top Scorer!</span>
                    </div>
                  </motion.div>

                  {/* XP Reward Popup */}
                  <motion.div
                    className="absolute -bottom-4 -left-4 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl p-4 shadow-lg transform -rotate-3"
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: -3 }}
                    transition={{ delay: 1.2, type: 'spring', stiffness: 300 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white font-bold">+50 XP</span>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                </div>

                {/* Decorative Elements */}
                <motion.div
                  className="absolute -top-8 left-1/4 w-16 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full opacity-60"
                  animate={{
                    width: ['4rem', '8rem', '4rem'],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                />
                <motion.div
                  className="absolute -bottom-8 right-1/4 w-20 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full opacity-60"
                  animate={{
                    width: ['5rem', '10rem', '5rem'],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave animation at bottom */}
        <div className="relative w-full overflow-hidden mt-16">
          <svg
            className="block w-full h-12 md:h-20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path
              fill="#ffffff"
              fillOpacity="0.05"
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
            />
            <path
              fill="#ffffff"
              fillOpacity="0.03"
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
            />
            <path
              fill="#ffffff"
              fillOpacity="0.02"
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}