'use client';
import React from "react";
import { motion, AnimatePresence } from 'framer-motion';

const xpData = [
  { 
    action: "Complete Quiz", 
    amount: "10-50 XP", 
    color: "from-emerald-400 to-cyan-500", 
    icon: "📄",
    description: "Finish any quiz to earn XP"
  },
  { 
    action: "Daily Streak", 
    amount: "20 XP", 
    color: "from-orange-400 to-red-500", 
    icon: "🔥",
    description: "Keep your learning streak alive"
  },
  { 
    action: "Refer Friend", 
    amount: "100 XP", 
    color: "from-purple-400 to-pink-500", 
    icon: "👯‍♂️",
    description: "Share PrepMint with friends"
  },
  { 
    action: "Perfect Score", 
    amount: "Bonus 50 XP", 
    color: "from-yellow-400 to-amber-500", 
    icon: "⭐",
    description: "Ace a quiz with 100% score"
  }
];

const rewardsData = [
  { 
    reward: "AI Tutor Session", 
    cost: 100, 
    icon: "🤖",
    description: "Get 1-on-1 help from AI tutor"
  },
  { 
    reward: "Answer Evaluation", 
    cost: 50, 
    icon: "✅",
    description: "Detailed feedback on your answers"
  },
  { 
    reward: "Study Coupons", 
    cost: 250, 
    icon: "🎟️",
    description: "Exclusive discounts on study materials"
  },
  { 
    reward: "Premium Features", 
    cost: 500, 
    icon: "👑",
    description: "Unlock all premium tools"
  }
];

export default function GamifiedXP() {

  const unlockedRewards = new Set(
    rewardsData
      .filter(() => Math.random() > 0.5)
      .map(r => r.reward)
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-100 p-4 md:p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -20, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40"
          animate={{ 
            scale: [1, 1.3, 1],
            y: [0, 30, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with XP Balance */}
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          
          
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
            PrepMint XP Hub
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Level up your learning game. Earn XP, unlock rewards, become a study legend! 🚀
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {/* Earn XP Section - Game Card Style */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/30 relative overflow-hidden"
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), inset 0 0 15px rgba(255, 255, 255, 0.3)'
            }}
          >
            {/* Card Header with Game Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center text-2xl mr-3 shadow-lg">
                  💰
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Earn XP</h2>
              </div>
              <div className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-white text-sm font-bold shadow-lg">
                LEVEL UP
              </div>
            </div>

            <div className="space-y-5">
              {xpData.map((item, index) => (
                <motion.div
                  key={index}
                  className="relative p-5 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{type: "spring", stiffness: 300, duration: 0.5, delay: 0.1 * index   }}
                >
                  {/* Animated XP coins */}
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg animate-bounce">
                    💰
                  </div>
                  
                  <div className="flex items-start">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center text-white text-2xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{item.action}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      <div className="flex items-center">
                        <span className="text-emerald-600 font-bold text-lg mr-2">{item.amount}</span>
                        <motion.div 
                          className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                    </div>
                    <motion.div
                      className={`px-4 py-2 rounded-xl bg-gradient-to-r ${item.color} text-white font-bold text-sm shadow-md hover:shadow-lg transition-all`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{ 
                        boxShadow: [
                          `0 0 10px rgba(74, 222, 128, 0.3)`,
                          `0 0 20px rgba(74, 222, 128, 0.6)`,
                          `0 0 10px rgba(74, 222, 128, 0.3)`
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      EARN
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Spend XP Section - Rewards Shop */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/30 relative overflow-hidden"
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), inset 0 0 15px rgba(255, 255, 255, 0.3)'
            }}
          >
            {/* Card Header with Shop Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center text-2xl mr-3 shadow-lg">
                  🛒
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Rewards Shop</h2>
              </div>
              <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-bold shadow-lg">
                UNLOCK
              </div>
            </div>

            <div className="space-y-5">
              {rewardsData.map((item, index) => (
                <motion.div
                  key={index}
                  className="relative p-5 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, duration: 0.5, delay: 0.1 * index }}
                >
                  {/* Animated sparkle effect for unlocked items */}
                  <AnimatePresence>
                    {unlockedRewards.has(item.reward) && (
                      <motion.div
                        className="absolute top-2 right-2 text-yellow-400 text-xl"
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        ✨
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex items-start">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-2xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span role="img" aria-label="icon">{item.icon}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{item.reward}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      <div className="flex items-center">
                        <span className="text-purple-600 font-bold text-lg mr-2">{item.cost} XP</span>
                        <motion.div 
                          className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                    </div>
                    <motion.button
                      className="px-4 py-2 rounded-xl font-bold text-sm shadow-md bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      >
                      UNLOCK
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}