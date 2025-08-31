// src/components/landing/InstitutionSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, BarChart3, Users, FileText, Zap, Target } from 'lucide-react';

const features = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Instant Question Paper Generator"
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Automated Paper Checking"
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Custom Analytics Dashboard"
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Bulk Student Management"
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Curriculum Alignment Tools"
  }
];

export default function App() {
  return (
    <section id="for-schools" className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div 
            className="lg:w-1/2 space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                For Educational Institutions
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Empower your teachers and students with intelligent tools built for modern education.
              </p>
            </div>
            
            <ul className="space-y-5">
              {features.map((feature, index) => (
                <motion.li 
                  key={index}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      {feature.icon}
                    </div>
                    <span className="text-lg text-gray-800 font-medium">
                      {feature.title}
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
            
            <motion.button
              className="flex items-center gap-3 px-8 py-4 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Book a Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
          
          {/* Right Column - Dashboard Preview */}
          <motion.div 
            className="lg:w-1/2 w-full"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                {/* Dashboard Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Greenwood High School</h3>
                    <p className="text-sm text-gray-500">Academic Dashboard</p>
                  </div>
                  <div className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                    Live
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">Active Students</p>
                    <p className="text-2xl font-bold text-gray-900">1,248</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-green-800 font-medium">Avg. Score</p>
                    <p className="text-2xl font-bold text-gray-900">87%</p>
                  </div>
                </div>
                
                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm text-gray-500">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                
                {/* Chart Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Class Performance</h4>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between h-20 gap-1">
                    {[65, 80, 45, 90, 75, 60, 85].map((height, index) => (
                      <div 
                        key={index}
                        className="flex-1 bg-gradient-to-t from-blue-500 to-green-500 rounded-t opacity-80"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                {/* Footer Stats */}
                <div className="flex justify-between pt-4 text-xs text-gray-500">
                  <span>Last updated: 2 min ago</span>
                  <span>View full report →</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
