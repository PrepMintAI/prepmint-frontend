// src/components/landing/InstitutionSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, BarChart3, Users, FileText, Zap, Target, Clock, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "90% Faster Grading",
    description: "AI evaluates answers instantly with human-level accuracy"
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Real-Time Analytics",
    description: "Track student progress and identify learning gaps instantly"
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Smart Question Papers",
    description: "Generate custom assessments aligned with your curriculum"
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Bulk Management",
    description: "Onboard and manage hundreds of students effortlessly"
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Curriculum Alignment",
    description: "Ensure assessments match your academic standards"
  }
];

const benefits = [
  {
    icon: Clock,
    metric: "15 hours",
    label: "Saved per teacher weekly",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: DollarSign,
    metric: "60%",
    label: "Cost reduction vs traditional",
    color: "from-emerald-500 to-teal-500"
  },
  {
    icon: TrendingUp,
    metric: "40%",
    label: "Average score improvement",
    color: "from-purple-500 to-pink-500"
  }
];

export default function InstitutionSection() {
  return (
    <section id="for-schools" className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">For Educational Institutions</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
            Transform Your Institution&apos;s Assessment Process
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Empower teachers, engage students, and achieve measurable outcomes with AI-powered tools built for modern education.
          </p>
        </motion.div>

        {/* Benefits Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${benefit.color} mb-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className={`text-3xl font-extrabold bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent mb-2`}>
                  {benefit.metric}
                </div>
                <div className="text-sm text-gray-600 font-medium">{benefit.label}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            className="lg:w-1/2 space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Everything Your Institution Needs
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                From automated grading to deep analytics, PrepMint gives educators superpowers to focus on what matters most: teaching.
              </p>
            </div>

            <ul className="space-y-4">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-4 group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center justify-center mt-0.5 shadow-md group-hover:scale-110 transition-transform">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-cyan-600 group-hover:text-cyan-700 transition-colors">
                        {feature.icon}
                      </div>
                      <span className="text-lg text-gray-900 font-semibold group-hover:text-cyan-600 transition-colors">
                        {feature.title}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/signup?type=institution">
                <motion.button
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-emerald-600 transition-all group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Request Demo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="#features">
                <motion.button
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-bold border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  View All Features
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Dashboard Preview */}
          <motion.div
            className="lg:w-1/2 w-full"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-6 shadow-2xl border border-gray-200">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                {/* Dashboard Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Springfield Academy</h3>
                    <p className="text-sm text-gray-500">Analytics Dashboard</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-full font-semibold border border-emerald-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Live
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
                    <p className="text-xs text-cyan-800 font-semibold mb-1">Active Students</p>
                    <p className="text-2xl font-extrabold text-gray-900">1,248</p>
                    <p className="text-xs text-cyan-600 mt-1">+12% this month</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-xs text-emerald-800 font-semibold mb-1">Avg. Score</p>
                    <p className="text-2xl font-extrabold text-gray-900">87%</p>
                    <p className="text-xs text-emerald-600 mt-1">+8% improvement</p>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                    <span className="text-sm font-bold text-cyan-600">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-3 rounded-full shadow-md" style={{ width: '87%' }}></div>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-gray-700">Weekly Performance</h4>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Tests</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Scores</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between h-24 gap-1.5">
                    {[65, 80, 45, 90, 75, 60, 85].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-gradient-to-t from-cyan-500 to-emerald-500 rounded-t-lg opacity-90 hover:opacity-100 transition-opacity shadow-sm"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Footer Stats */}
                <div className="flex justify-between pt-4 mt-4 border-t border-gray-100 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Updated 2 min ago
                  </span>
                  <span className="text-cyan-600 font-medium hover:text-cyan-700 cursor-pointer">
                    View full report →
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
