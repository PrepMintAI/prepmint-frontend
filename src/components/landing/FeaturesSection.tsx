// src/components/landing/FeaturesSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: "🧠",
    title: "Smart Quizzes with XP",
    description: "Adaptive quizzes that adjust to your level and reward you with XP for every correct answer."
  },
  {
    icon: "🤖",
    title: "AI Tutor (MintBot)",
    description: "Get 24/7 personalized help from our AI tutor that explains concepts in your learning style."
  },
  {
    icon: "✅",
    title: "Automated Answer Evaluation",
    description: "Instant feedback on your answers with detailed explanations powered by AI."
  },
  {
    icon: "💬",
    title: "Doubt Solver + Community",
    description: "Ask questions and get answers from both AI and our community of learners."
  },
  {
    icon: "📄",
    title: "Question Paper Generator",
    description: "Create customized question papers instantly for institutions and educators."
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-4">Powerful Learning Features</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to transform your learning experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}