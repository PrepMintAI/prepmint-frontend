// src/app/help/page.tsx
'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { motion } from 'framer-motion';
import {
  HelpCircle, MessageCircle, Book, Video,
  Mail, Phone, ChevronDown, ChevronUp, Send,
  Sparkles
} from 'lucide-react';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I upload my answer sheet?',
        a: 'Click on "Get Score ⚡" in the sidebar, then either drag and drop your image/PDF or click to browse files. Our AI will analyze it instantly!'
      },
      {
        q: 'What file formats are supported?',
        a: 'We support JPG, PNG, and PDF files. Make sure your image is clear and well-lit for best results.'
      },
      {
        q: 'How does the AI evaluation work?',
        a: 'Our advanced AI scans your answer sheet, recognizes handwriting, compares with the answer key, and provides instant feedback with detailed explanations.'
      },
    ]
  },
  {
    category: 'XP & Rewards',
    questions: [
      {
        q: 'How do I earn XP?',
        a: 'You earn XP by completing tests (50 XP), getting perfect scores (100 XP bonus), maintaining streaks (25 XP daily), and unlocking badges (75 XP each).'
      },
      {
        q: 'What are levels?',
        a: 'Levels represent your overall progress. You level up automatically as you earn more XP. Higher levels unlock special badges and features!'
      },
      {
        q: 'How do I climb the leaderboard?',
        a: 'Earn more XP by completing tests regularly, maintaining streaks, and scoring high. You can compete globally or within your school!'
      },
    ]
  },
  {
    category: 'Account & Settings',
    questions: [
      {
        q: 'Can I change my school/institution?',
        a: 'Yes! Go to Settings → Account → Institution Code and update it. You&apos;ll need a valid institution code from your new school.'
      },
      {
        q: 'How do I reset my password?',
        a: 'Click on "Forgot Password" on the login page. We&apos;ll send you a reset link via email.'
      },
      {
        q: 'Is my data safe?',
        a: 'Absolutely! We use industry-standard encryption and never share your personal information with third parties.'
      },
    ]
  },
];

const quickLinks = [
  { name: 'Video Tutorials', icon: Video, href: '#', color: 'from-red-500 to-pink-600' },
  { name: 'Documentation', icon: Book, href: '#', color: 'from-blue-500 to-cyan-600' },
  { name: 'Community Forum', icon: MessageCircle, href: '#', color: 'from-purple-500 to-indigo-600' },
  { name: 'What&apos;s New', icon: Sparkles, href: '#', color: 'from-yellow-500 to-orange-600' },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message sent! We&apos;ll get back to you within 24 hours.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <AppLayout>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <HelpCircle className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              How can we help you? 💬
            </h1>
            <p className="text-gray-600 text-lg">
              Find answers, get support, and learn how to make the most of PrepMint
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Card
                  key={index}
                  variant="elevated"
                  padding="lg"
                  hover
                  clickable
                  className="text-center cursor-pointer"
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{link.name}</p>
                </Card>
              );
            })}
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated" padding="lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                {faqs.map((category, catIndex) => (
                  <div key={catIndex}>
                    <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-2xl">
                        {catIndex === 0 ? '🚀' : catIndex === 1 ? '🏆' : '⚙️'}
                      </span>
                      {category.category}
                    </h3>
                    <div className="space-y-2">
                      {category.questions.map((faq, faqIndex) => {
                        const id = `${catIndex}-${faqIndex}`;
                        const isOpen = openFaq === id;

                        return (
                          <div
                            key={id}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() => toggleFaq(id)}
                              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                            >
                              <span className="font-medium text-gray-900 flex-1 pr-4">
                                {faq.q}
                              </span>
                              {isOpen ? (
                                <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
                              ) : (
                                <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                              )}
                            </button>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-4 pb-4 text-gray-600"
                              >
                                {faq.a}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="elevated" padding="lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Still need help? 🤝
              </h2>
              <p className="text-gray-600 mb-6">
                Send us a message and we&apos;ll get back to you within 24 hours
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us more about your question or issue..."
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  leftIcon={<Send size={20} />}
                >
                  Send Message
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Card variant="gradient" padding="lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                  <p className="text-sm text-gray-600 mb-2">For general inquiries</p>
                  <a href="mailto:support@prepmint.com" className="text-blue-600 text-sm font-medium hover:underline">
                    support@prepmint.com
                  </a>
                </div>
              </div>
            </Card>

            <Card variant="gradient" padding="lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                  <p className="text-sm text-gray-600 mb-2">Mon-Fri, 9AM-6PM IST</p>
                  <a href="tel:+911234567890" className="text-green-600 text-sm font-medium hover:underline">
                    +91 1234 567 890
                  </a>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
