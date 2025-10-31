// src/components/landing/FeaturesSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Bot, CheckCircle2, FileText, Zap, BarChart3, Trophy } from 'lucide-react';

const features = [
  {
    icon: Brain,
    iconBg: 'from-purple-500 to-indigo-500',
    title: 'AI-Powered Assessments',
    description: 'Intelligent evaluation system that analyzes your answers with deep understanding, not just pattern matching.',
    benefit: 'Save 90% grading time'
  },
  {
    icon: Zap,
    iconBg: 'from-cyan-500 to-blue-500',
    title: 'Instant Feedback',
    description: 'Get detailed explanations and personalized improvement suggestions within seconds of submission.',
    benefit: 'Learn 3x faster'
  },
  {
    icon: Trophy,
    iconBg: 'from-yellow-500 to-orange-500',
    title: 'Gamified Progress',
    description: 'Earn XP, unlock badges, and level up as you master concepts. Learning becomes addictively fun.',
    benefit: '95% completion rate'
  },
  {
    icon: BarChart3,
    iconBg: 'from-emerald-500 to-teal-500',
    title: 'Performance Analytics',
    description: 'Track your growth with detailed insights. Identify weak areas and watch your progress soar.',
    benefit: 'Data-driven insights'
  },
  {
    icon: Bot,
    iconBg: 'from-pink-500 to-rose-500',
    title: '24/7 AI Tutor',
    description: 'MintBot is always ready to help. Get explanations tailored to your learning style, anytime.',
    benefit: 'Never stuck again'
  },
  {
    icon: FileText,
    iconBg: 'from-indigo-500 to-purple-500',
    title: 'Question Generator',
    description: 'Create custom question papers instantly. Perfect for practice tests or institutional assessments.',
    benefit: 'Unlimited practice'
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 border border-cyan-200 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Zap className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-semibold text-cyan-700">Powered by Advanced AI</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Everything You Need to Excel
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Smart tools designed to make learning engaging, efficient, and effective for students and educators alike.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${feature.iconBg} mb-5 shadow-lg`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>

                  {/* Benefit badge */}
                  <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-md">
                    {feature.benefit}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative element */}
                  <div className="mt-6 h-1 w-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-600 mb-4">Ready to experience the future of learning?</p>
          <motion.a
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Free
            <CheckCircle2 className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}