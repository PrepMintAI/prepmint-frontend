// src/components/landing/FeaturesSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, CheckCircle2, FileText, BarChart3, Shield, Clock, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Brain,
    iconBg: 'from-purple-500 to-indigo-500',
    title: 'AI-Powered Evaluation',
    description: 'Advanced AI analyzes handwritten and digital answer sheets with human-level accuracy, understanding context and concepts.',
    benefit: '98% accuracy'
  },
  {
    icon: Zap,
    iconBg: 'from-cyan-500 to-blue-500',
    title: 'Instant Results',
    description: 'Get comprehensive evaluation results within minutes, not days. Upload answer sheets and receive detailed feedback immediately.',
    benefit: 'Save 90% time'
  },
  {
    icon: BarChart3,
    iconBg: 'from-emerald-500 to-teal-500',
    title: 'Detailed Analytics',
    description: 'Deep insights into student performance, class trends, and learning gaps. Track progress with actionable data visualizations.',
    benefit: 'Data-driven insights'
  },
  {
    icon: Clock,
    iconBg: 'from-orange-500 to-amber-500',
    title: 'Bulk Processing',
    description: 'Evaluate hundreds of answer sheets simultaneously. Perfect for mid-terms, finals, and large-scale assessments.',
    benefit: '150+ papers/hour'
  },
  {
    icon: Shield,
    iconBg: 'from-pink-500 to-rose-500',
    title: 'Consistent Grading',
    description: 'Eliminate human bias and inconsistency. Every student is evaluated with the same rigorous standards.',
    benefit: 'Fair & unbiased'
  },
  {
    icon: FileText,
    iconBg: 'from-indigo-500 to-purple-500',
    title: 'Flexible Formats',
    description: 'Support for handwritten papers, PDFs, images, and digital submissions. Works with any question format or subject.',
    benefit: 'Universal support'
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
            The Problem: Manual Evaluation is Slow
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Teachers spend 15+ hours weekly on grading. Results are inconsistent. Feedback is delayed. Students suffer.
          </p>
          <div className="inline-block bg-gradient-to-r from-emerald-100 to-cyan-100 border border-emerald-200 rounded-2xl px-6 py-4">
            <p className="text-2xl font-bold text-gray-900">The Solution: <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">PrepMint AI</span></p>
          </div>
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

        {/* Benefits Summary */}
        <motion.div
          className="mt-16 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Why Institutions Choose PrepMint</h3>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Join 100+ schools and coaching institutes that have transformed their assessment process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">90%</div>
              <div className="text-gray-300 font-medium">Time Saved on Grading</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">98%</div>
              <div className="text-gray-300 font-medium">Evaluation Accuracy</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">60%</div>
              <div className="text-gray-300 font-medium">Cost Reduction</div>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-600 mb-4 text-lg">Ready to transform your evaluation process?</p>
          <motion.a
            href="/signup?type=institution"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try PrepMint for Your Institution
            <CheckCircle2 className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
