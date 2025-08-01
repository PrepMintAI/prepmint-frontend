'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Users, Award, Zap } from 'lucide-react';

export default function App() {
  const [, setIsScrolled] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
type Particle = {
    left: string;
    top: string;
    x: number;
    duration: number;
    delay: number;
  };


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    // Generate particle configs on mount
  const generatedParticles = [...Array(8)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      x: Math.random() * 40 - 20,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));

    setParticles(generatedParticles);


    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-600 via-blue-700 to-emerald-600 opacity-20 animate-pulse"></div>
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
                ease: "easeInOut",
                delay: p.delay,
              }}
            />
          ))}
        </div>


        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Left Content */}
            <motion.div 
              className="lg:w-1/2 mb-16 lg:mb-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.h1 
                className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                <span className="block">Master Smarter.</span>
                <span className="block mt-2 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Not Harder.
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-300 mb-10 max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.7 }}
              >
                PrepMint is where intelligent prep meets rewarding progress. Transform your learning with gamified experience.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
              >
                <motion.button
                  className="px-8 py-4 rounded-full font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Learning
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <motion.button
                  className="px-8 py-4 rounded-full font-bold border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-colors flex items-center justify-center group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Users className="mr-2 w-5 h-5" />
                  Explore as School
                </motion.button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div 
                className="flex items-center space-x-6 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.7 }}
              >
                <div className="flex items-center text-gray-400">
                  <Award className="w-5 h-5 mr-2 text-yellow-400" />
                  <span>10K+ Active Learners</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                  <span>95% Completion Rate</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual Panel */}
            <motion.div 
              className="lg:w-1/2 flex justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="relative">
                {/* Floating Progress Bars */}
                <motion.div
                  className="absolute -top-10 left-0 w-40 h-2 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full opacity-80"
                  animate={{ width: ['40%', '70%', '40%'] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                />
                <motion.div
                  className="absolute top-0 right-0 w-32 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-80"
                  animate={{ width: ['30%', '60%', '30%'] }}
                  transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
                />

                {/* Glassmorphism Card */}
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
                  {/* Holographic Dashboard */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-white/10 rounded-xl w-64 h-64 md:w-80 md:h-80 flex flex-col items-center justify-center">
                    {/* Glowing XP Meter */}
                    <div className="relative w-40 h-40 rounded-full border-4 border-cyan-400 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-spin" style={{ animationDuration: '15s' }}></div>
                      <div className="text-center">
                        <div className="text-3xl font-extrabold text-white">50%</div>
                        <div className="text-xs text-gray-300">XP Earned</div>
                      </div>
                    </div>

                    {/* Digital Classroom Placeholder */}
                    <div className="mt-4 text-center">
                      <div className="text-2xl">🎓</div>
                      <p className="text-sm text-gray-400">Virtual Prep Zone</p>
                    </div>
                  </div>

                  {/* XP Reward Popup */}
                  <motion.div
                    className="absolute -bottom-6 -right-6 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl p-4 shadow-lg transform rotate-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: 'spring', stiffness: 300 }}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                      <span className="text-white font-bold">+50 XP</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave animation at bottom */}
        <div className="relative w-full overflow-hidden -mt-4">
          <svg 
            className="block w-full h-12 md:h-20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path
              fill="#0f172a"
              fillOpacity="0.3"
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
            ></path>
            <path
              fill="#0f172a"
              fillOpacity="0.2"
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
            ></path>
            <path
              fill="#0f172a"
              fillOpacity="0.1"
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        .animate-pulse {
          animation: pulse 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}