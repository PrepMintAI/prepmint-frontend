'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { Users, ArrowLeft, Mail, User, Calendar, BookOpen, Save, X, Phone } from 'lucide-react';

interface StudentFormData {
  name: string;
  email: string;
  rollNo: string;
  class: string;
  section: string;
  dateOfBirth: string;
  parentContact: string;
}

export function AddStudentClient({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    rollNo: '',
    class: '9',
    section: 'A',
    dateOfBirth: '',
    parentContact: '',
  });

  const classes = ['8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.rollNo) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: In production, call Firebase API to create student
      // const response = await api.post('/students', {
      //   ...formData,
      //   institutionId,
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Student added successfully!');
      router.push('/dashboard/institution/students');
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={20} />}
          onClick={() => router.push('/dashboard/institution/students')}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={28} />
            Add New Student
          </h1>
          <p className="text-gray-600">Add a new student to your institution</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="Enter student&apos;s full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="student@school.com"
                    required
                  />
                </div>

                {/* Roll Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen size={16} className="inline mr-1" />
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="e.g., A001"
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Class and Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Class Assignment</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class *
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  >
                    {classes.map(cls => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section *
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  >
                    {sections.map(sec => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Parent Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-1" />
                    Parent Contact
                  </label>
                  <input
                    type="tel"
                    name="parentContact"
                    value={formData.parentContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            leftIcon={<X size={20} />}
            onClick={() => router.push('/dashboard/institution/students')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            leftIcon={<Save size={20} />}
            disabled={isSubmitting || !formData.name || !formData.email || !formData.rollNo}
          >
            {isSubmitting ? 'Adding...' : 'Add Student'}
          </Button>
        </div>
      </form>
    </div>
  );
}
