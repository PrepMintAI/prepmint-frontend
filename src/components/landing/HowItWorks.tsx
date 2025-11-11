'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Scan, BarChart3, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    number: "1",
    title: "Upload Answer Sheets",
    description: "Scan or photograph answer sheets and upload in bulk",
    icon: Upload,
    color: "from-blue-400 to-cyan-400",
    details: "Support for PDF, JPG, PNG. Handwritten or typed. Single or batch upload."
  },
  {
    number: "2",
    title: "AI Evaluates Instantly",
    description: "Our AI analyzes answers with human-level understanding",
    icon: Scan,
    color: "from-purple-400 to-pink-400",
    details: "Context-aware evaluation. Partial credit. Detailed reasoning for each mark."
  },
  {
    number: "3",
    title: "Get Detailed Reports",
    description: "Comprehensive results with analytics in minutes",
    icon: BarChart3,
    color: "from-emerald-400 to-teal-400",
    details: "Individual scores, class analytics, weak areas, improvement suggestions."
  },
  {
    number: "4",
    title: "Share with Students",
    description: "Students receive instant feedback and personalized insights",
    icon: CheckCircle2,
    color: "from-yellow-400 to-orange-400",
    details: "Automated distribution. Detailed explanations. Progress tracking."
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
            From upload to results in 4 simple steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-16 left-8 md:left-1/2 md:transform md:-translate-x-1/2 h-[calc(100%-8rem)] w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-emerald-400 hidden md:block"></div>

          <div className="space-y-8 md:space-y-16">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
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
                    <div className="absolute left-9 top-16 w-1 h-16 bg-gradient-to-b from-blue-400 to-purple-400 md:hidden"></div>
                  )}

                  {/* Content card */}
                  <div className={`md:w-full md:ml-0 ${index % 2 === 0 ? 'md:pr-8 md:pl-16' : 'md:pl-8 md:pr-16'} mt-8 md:mt-0`}>
                    <div className={`p-6 rounded-3xl shadow-xl bg-white border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                      index % 2 === 0 ? 'md:mr-auto md:ml-8' : 'md:ml-auto md:mr-8'
                    } max-w-md mx-auto md:mx-0`}>
                      {/* Icon header */}
                      <div className="flex items-center mb-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mr-4 shadow-md`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                          <p className="text-gray-600 font-medium">{step.description}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{step.details}</p>
                      </div>

                      {/* Visual progress indicator */}
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                        <span className="font-medium">Step {step.number} of 4</span>
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-8 h-1 rounded-full ${
                                i <= index ? `bg-gradient-to-r ${step.color}` : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Time comparison */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-cyan-50 via-blue-50 to-emerald-50 rounded-3xl p-8 border-2 border-cyan-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-gray-600 font-semibold mb-2">Traditional Method</div>
              <div className="text-5xl font-extrabold text-red-500 mb-2">15+ hours</div>
              <div className="text-sm text-gray-600">Manual evaluation per 100 papers</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600 font-semibold mb-2">With PrepMint AI</div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent mb-2">40 minutes</div>
              <div className="text-sm text-gray-600">AI-powered evaluation per 100 papers</div>
            </div>
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <a href="/signup?type=institution">
            <div className="inline-block bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
              Start Evaluating with AI Today
            </div>
          </a>
          <p className="text-gray-500 text-sm mt-4">No credit card required • Free demo available</p>
        </motion.div>
      </div>
    </section>
  );
}
