'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Scan, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: "1",
    title: "Upload Answer Sheets",
    description: "Scan or photograph answer sheets and upload in bulk",
    icon: Upload,
    gradient: "from-blue-500 via-blue-600 to-cyan-600",
    bgGradient: "from-blue-50 to-cyan-50",
    details: ["PDF, JPG, PNG support", "Handwritten or typed", "Bulk upload ready"]
  },
  {
    number: "2",
    title: "AI Evaluates Instantly",
    description: "Our AI analyzes answers with human-level understanding",
    icon: Scan,
    gradient: "from-purple-500 via-purple-600 to-pink-600",
    bgGradient: "from-purple-50 to-pink-50",
    details: ["Context-aware evaluation", "Partial credit given", "Detailed reasoning"]
  },
  {
    number: "3",
    title: "Get Detailed Reports",
    description: "Comprehensive results with analytics in minutes",
    icon: BarChart3,
    gradient: "from-emerald-500 via-emerald-600 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50",
    details: ["Individual scores", "Class analytics", "Improvement suggestions"]
  },
  {
    number: "4",
    title: "Share with Students",
    description: "Students receive instant feedback and personalized insights",
    icon: CheckCircle2,
    gradient: "from-orange-500 via-orange-600 to-amber-600",
    bgGradient: "from-orange-50 to-amber-50",
    details: ["Automated distribution", "Detailed explanations", "Progress tracking"]
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-24 bg-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Simple 4-Step Process</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-emerald-900 bg-clip-text text-transparent">
              How PrepMint Works
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From upload to results in minutes. Experience the future of answer sheet evaluation.
          </p>
        </motion.div>

        {/* Steps Grid - Modern Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                {/* Card */}
                <div className={`relative h-full bg-gradient-to-br ${step.bgGradient} rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 group-hover:scale-[1.02]`}>
                  {/* Step number badge */}
                  <div className="absolute -top-4 -left-4 z-10">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${step.gradient} shadow-xl flex items-center justify-center transform rotate-6 group-hover:rotate-12 transition-transform`}>
                      <span className="text-white font-black text-xl md:text-2xl">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Details list */}
                  <ul className="space-y-2 md:space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 md:gap-3">
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                        </div>
                        <span className="text-sm md:text-base text-gray-700 font-medium">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Arrow connector for desktop */}
                  {index < 3 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                      <motion.div
                        animate={{
                          x: [0, 5, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <ArrowRight className={`w-8 h-8 text-gray-400 ${index % 2 === 0 ? 'rotate-0' : 'rotate-90'}`} />
                      </motion.div>
                    </div>
                  )}

                  {/* Arrow connector for mobile */}
                  {index < 3 && (
                    <div className="md:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
                      <motion.div
                        animate={{
                          y: [0, 5, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <ArrowRight className="w-8 h-8 text-gray-400 rotate-90" />
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Time Comparison - Redesigned */}
        <motion.div
          className="relative bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full filter blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-8 md:mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3">
                Save Massive Time with AI
              </h3>
              <p className="text-gray-300 text-sm md:text-base">
                See the dramatic difference AI makes in evaluation time
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 max-w-4xl mx-auto">
              {/* Traditional Method */}
              <motion.div
                className="relative bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-red-500 rounded-full">
                  <span className="text-white text-xs md:text-sm font-bold">OLD WAY</span>
                </div>
                <div className="text-center pt-4 md:pt-6">
                  <div className="text-5xl md:text-7xl font-black text-red-400 mb-3 md:mb-4">15+</div>
                  <div className="text-lg md:text-xl font-bold text-white mb-2">Hours</div>
                  <div className="text-sm md:text-base text-gray-400">Manual evaluation per 100 papers</div>
                </div>
              </motion.div>

              {/* With PrepMint */}
              <motion.div
                className="relative bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full shadow-lg">
                  <span className="text-white text-xs md:text-sm font-bold">WITH PREPMINT</span>
                </div>
                <div className="text-center pt-4 md:pt-6">
                  <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-3 md:mb-4">40</div>
                  <div className="text-lg md:text-xl font-bold text-white mb-2">Minutes</div>
                  <div className="text-sm md:text-base text-gray-300">AI-powered evaluation per 100 papers</div>
                  <div className="mt-4 md:mt-6 inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-400/30">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold text-xs md:text-sm">22x Faster!</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12 md:mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a href="/signup?type=institution">
            <motion.button
              className="group px-8 md:px-10 py-4 md:py-5 rounded-full font-bold text-base md:text-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Evaluating with AI Today
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </a>
          <p className="text-gray-500 text-xs md:text-sm mt-4 md:mt-6">
            No credit card required • Free demo available • Setup in minutes
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
