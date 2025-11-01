'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { GraduationCap, ArrowLeft, Mail, User, Calendar, BookOpen, Save, X } from 'lucide-react';
import { schoolSubjects } from '@/lib/comprehensiveMockData';

interface TeacherFormData {
  name: string;
  email: string;
  yearsOfExperience: number;
  joiningDate: string;
  selectedSubjects: string[];
}

export function AddTeacherClient({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    yearsOfExperience: 0,
    joiningDate: new Date().toISOString().split('T')[0],
    selectedSubjects: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsOfExperience' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || formData.selectedSubjects.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: In production, call Firebase API to create teacher
      // const response = await api.post('/teachers', {
      //   ...formData,
      //   institutionId,
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Teacher added successfully!');
      router.push('/dashboard/institution/teachers');
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Failed to add teacher. Please try again.');
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
          onClick={() => router.push('/dashboard/institution/teachers')}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap size={28} />
            Add New Teacher
          </h1>
          <p className="text-gray-600">Add a new teaching staff member to your institution</p>
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
                    placeholder="Enter teacher&apos;s full name"
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
                    placeholder="teacher@school.com"
                    required
                  />
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap size={16} className="inline mr-1" />
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="0"
                  />
                </div>

                {/* Joining Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Joining Date
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Subject Selection */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                Subjects *
              </h2>
              <p className="text-sm text-gray-600 mb-4">Select subjects this teacher will teach</p>
              <div className="grid md:grid-cols-3 gap-3">
                {schoolSubjects.map(subject => (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => handleSubjectToggle(subject.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.selectedSubjects.includes(subject.id)
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{subject.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{subject.code}</div>
                  </button>
                ))}
              </div>
              {formData.selectedSubjects.length === 0 && (
                <p className="text-sm text-red-600 mt-2">Please select at least one subject</p>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            leftIcon={<X size={20} />}
            onClick={() => router.push('/dashboard/institution/teachers')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            leftIcon={<Save size={20} />}
            disabled={isSubmitting || !formData.name || !formData.email || formData.selectedSubjects.length === 0}
          >
            {isSubmitting ? 'Adding...' : 'Add Teacher'}
          </Button>
        </div>
      </form>
    </div>
  );
}
