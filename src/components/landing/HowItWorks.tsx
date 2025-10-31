'use client';
import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: "1",
    title: "Choose a Quiz",
    description: "Pick your topic. Dive in.",
    icon: "📚",
    color: "from-blue-400 to-cyan-400",
    emoji: "🚀"
  },
  {
    number: "2",
    title: "Answer & Earn XP",
    description: "Crack it. Rack it. Build your streak.",
    icon: "🔥",
    color: "from-green-400 to-emerald-400",
    emoji: "🪙"
  },
  {
    number: "3",
    title: "Ask AI for Help",
    description: "Stuck? Ask MintBot.",
    icon: "🧠",
    color: "from-purple-400 to-pink-400",
    emoji: "🤖"
  },
  {
    number: "4",
    title: "Win Real Rewards",
    description: "Redeem XP for rewards that matter.",
    icon: "🎁",
    color: "from-yellow-400 to-orange-400",
    emoji: "🏆"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            How PrepMint Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Level up your learning in 4 epic steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-16 left-8 md:left-1/2 md:transform md:-translate-x-1/2 h-[calc(100%-8rem)] w-1 bg-gradient-to-b from-blue-400 via-green-400 to-purple-400 hidden md:block"></div>
          
          <div className="space-y-8 md:space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative flex flex-col md:flex-row items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Step number circle */}
                <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 z-10">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-white`}>
                    {step.number}
                  </div>
                </div>

                {/* Mobile progress connector */}
                {index < steps.length - 1 && (
                  <div className="absolute left-9 top-16 w-1 h-16 bg-gradient-to-b from-blue-400 to-green-400 md:hidden"></div>
                )}

                {/* Content card */}
                <div className={`md:w-full md:ml-0 ${index % 2 === 0 ? 'md:pr-8 md:pl-16' : 'md:pl-8 md:pr-16'} mt-8 md:mt-0`}>
                  <div className={`p-6 rounded-3xl shadow-xl bg-white border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                    index % 2 === 0 ? 'md:mr-auto md:ml-8' : 'md:ml-auto md:mr-8'
                  } max-w-md mx-auto md:mx-0`}>
                    {/* Icon header */}
                    <div className="flex items-center mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-3xl mr-4 shadow-md`}>
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                        <p className="text-gray-600 font-medium">{step.description}</p>
                      </div>
                    </div>

                    {/* Visual element */}
                    <div className="relative h-32 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 overflow-hidden border border-gray-200">
                      {/* Animated background elements */}
                      <div className="absolute inset-0">
                        <div className={`absolute top-4 left-4 w-8 h-8 rounded-full bg-gradient-to-r ${step.color} opacity-20 animate-pulse`}></div>
                        <div className={`absolute bottom-6 right-6 w-6 h-6 rounded-full bg-gradient-to-r ${step.color} opacity-30 animate-pulse`}></div>
                        <div className={`absolute top-8 right-8 w-4 h-4 rounded-full bg-gradient-to-r ${step.color} opacity-40 animate-pulse`}></div>
                      </div>

                      {/* Step-specific visual */}
                      {index === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-blue-600">📚</div>
                            <div className="w-8 h-8 rounded-lg bg-green-100 border-2 border-green-300 flex items-center justify-center text-green-600">🔍</div>
                            <div className="w-8 h-8 rounded-lg bg-purple-100 border-2 border-purple-300 flex items-center justify-center text-purple-600">🚀</div>
                          </div>
                        </div>
                      )}

                      {index === 1 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl animate-bounce">🪙</div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white animate-ping">🔥</div>
                          </div>
                        </div>
                      )}

                      {index === 2 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-3xl">🤖</div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg border-2 border-purple-400">💭</div>
                          </div>
                        </div>
                      )}

                      {index === 3 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center text-xl">🎁</div>
                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-teal-400 rounded-lg flex items-center justify-center text-xl">🏆</div>
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center text-xl">🎟️</div>
                          </div>
                        </div>
                      )}

                      {/* Emoji accent */}
                      <div className="absolute top-2 right-2 text-2xl animate-pulse">
                        {step.emoji}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <a href="/signup">
            <div className="inline-block bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
              Start Learning Now
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}