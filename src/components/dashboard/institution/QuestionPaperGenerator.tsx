/* eslint-disable react-hooks/exhaustive-deps */
// src/components/dashboard/institution/QuestionPaperGenerator.tsx
'use client';
import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Edit2, 
  RefreshCw, 
  FileText, 
  Download, 
  HelpCircle, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  BarChart2,
  Clock,
  Settings
} from "lucide-react";

interface Question {
  id: string;
  type: 'objective' | 'theory';
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  topic: string;
  marks: number;
  question: string;
  options?: string[];
  correctAnswer?: string;
  answer?: string;
}

interface SectionConfig {
  id: string;
  name: string;
  totalMarks: number;
  numberOfQuestions: number;
  instruction: string;
}

interface ExamConfig {
  totalQuestions: number;
  questionTypes: ('objective' | 'theory' | 'mixed')[];
  difficulty: ('easy' | 'medium' | 'hard')[];
  sections: SectionConfig[];
  examType: string;
  subject: string;
  topics: string[];
  instructions: string;
  timeLimit: number;
  marksDistribution: Record<string, number>;
}

const mockQuestions: Question[] = [
  {
    id: 'q1',
    type: 'objective',
    difficulty: 'easy',
    subject: 'Physics',
    topic: 'Kinematics',
    marks: 4,
    question: 'A body moving with uniform acceleration has velocities 20 m/s and 30 m/s when it travels a distance of 100 m. What is its acceleration?',
    options: ['0.5 m/s²', '1.5 m/s²', '2.5 m/s²', '3.5 m/s²'],
    correctAnswer: '1.5 m/s²'
  },
  {
    id: 'q2',
    type: 'theory',
    difficulty: 'medium',
    subject: 'Chemistry',
    topic: 'Chemical Bonding',
    marks: 6,
    question: 'Explain the concept of hybridization in carbon atoms. Describe sp, sp² and sp³ hybridization with suitable examples.',
    answer: 'Hybridization is the mixing of atomic orbitals to form new hybrid orbitals... sp hybridization occurs when one s and one p orbital mix, forming two sp hybrid orbitals at 180°...'
  },
  {
    id: 'q3',
    type: 'objective',
    difficulty: 'hard',
    subject: 'Mathematics',
    topic: 'Calculus',
    marks: 4,
    question: 'The area bounded by the curve y = x² - 4x + 3 and the x-axis is:',
    options: ['2 sq units', '4/3 sq units', '8/3 sq units', '10/3 sq units'],
    correctAnswer: '4/3 sq units'
  },
  {
    id: 'q4',
    type: 'objective',
    difficulty: 'easy',
    subject: 'Biology',
    topic: 'Genetics',
    marks: 4,
    question: 'Which of the following represents a homozygous recessive genotype?',
    options: ['AA', 'Aa', 'aa', 'AB'],
    correctAnswer: 'aa'
  },
  {
    id: 'q5',
    type: 'theory',
    difficulty: 'medium',
    subject: 'Physics',
    topic: 'Electromagnetism',
    marks: 5,
    question: 'State Faraday\'s laws of electromagnetic induction and explain Lenz\'s law with an example.',
    answer: 'Faraday\'s first law states that whenever there is a change in magnetic flux linked with a circuit, an emf is induced...'
  }
];

const EXAM_TYPES = ['JEE', 'NEET', 'CBSE', 'State Boards', 'Custom'];
const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'History', 'Geography'];

const TOPICS = {
  Physics: ['Kinematics', 'Electromagnetism', 'Optics', 'Thermodynamics', 'Modern Physics'],
  Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Chemical Bonding'],
  Mathematics: ['Algebra', 'Calculus', 'Trigonometry', 'Coordinate Geometry', 'Probability'],
  Biology: ['Genetics', 'Ecology', 'Human Physiology', 'Cell Biology', 'Evolution'],
  English: ['Grammar', 'Literature', 'Comprehension', 'Writing Skills'],
  History: ['Ancient India', 'Medieval India', 'Modern India', 'World History'],
  Geography: ['Physical Geography', 'Human Geography', 'Economic Geography', 'Environmental Geography']
};

export default function QuestionPaperGenerator() {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<{[key: string]: Question[]}>({});
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  
  const [config, setConfig] = useState<ExamConfig>({
    totalQuestions: 10,
    questionTypes: ['mixed'],
    difficulty: ['easy', 'medium'],
    sections: [
      {
        id: 'A',
        name: 'Section A',
        totalMarks: 40,
        numberOfQuestions: 10,
        instruction: 'Attempt all questions. All questions carry equal marks.'
      }
    ],
    examType: 'CBSE',
    subject: 'Physics',
    topics: ['Kinematics'],
    instructions: 'Attempt all questions. All questions carry equal marks. Show your work for theory questions.',
    timeLimit: 180,
    marksDistribution: {}
  });

  const getMarksPerQuestion = (sectionId: string) => {
    const section = config.sections.find(s => s.id === sectionId);
    if (!section || section.numberOfQuestions === 0) return 0;
    return Math.round(section.totalMarks / section.numberOfQuestions * 100) / 100;
  };

  const updateSectionConfig = (sectionId: string, field: keyof SectionConfig, value: SectionConfig[typeof field]) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId 
          ? { ...section, [field]: value }
          : section
      )
    }));
  };

  const addSection = () => {
    const newSectionId = String.fromCharCode(65 + config.sections.length);
    setConfig(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: newSectionId,
          name: `Section ${newSectionId}`,
          totalMarks: 20,
          numberOfQuestions: 5,
          instruction: `Attempt all questions in Section ${newSectionId}.`
        }
      ]
    }));
  };

  const removeSection = (sectionId: string) => {
    if (config.sections.length <= 1) return;
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  const totalMarks = config.sections.reduce((sum, section) => sum + section.totalMarks, 0);
  const totalQuestions = config.sections.reduce((sum, section) => sum + section.numberOfQuestions, 0);

  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      totalQuestions: totalQuestions
    }));
  }, [totalQuestions]);

  const generateMockPaper = () => {
    const sections: {[key: string]: Question[]} = {};
    let questionIndex = 0;
    
    config.sections.forEach(section => {
      const sectionQuestions: Question[] = [];
      const questionsForSection = mockQuestions.filter(q => 
        (config.questionTypes.includes('mixed') || config.questionTypes.includes(q.type)) &&
        config.difficulty.some(d => d === q.difficulty) &&
        config.topics.includes(q.topic)
      );
      
      const marksPerQuestion = getMarksPerQuestion(section.id);
      
      for (let i = 0; i < section.numberOfQuestions && questionIndex < questionsForSection.length; i++) {
        const question = questionsForSection[questionIndex % questionsForSection.length];
        const adjustedQuestion = marksPerQuestion !== question.marks 
          ? { ...question, marks: marksPerQuestion }
          : question;
          
        sectionQuestions.push(adjustedQuestion);
        questionIndex++;
      }
      
      sections[section.id] = sectionQuestions;
    });
    
    setGeneratedPaper(sections);
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      generateMockPaper();
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [config, generateMockPaper]);

  const handleConfigChange = (key: keyof ExamConfig, value: ExamConfig[keyof ExamConfig]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleTopicChange = (topic: string) => {
    setConfig(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const handleReplaceQuestion = (section: string, questionId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const sectionQuestions = generatedPaper[section];
      const updatedQuestions = sectionQuestions.map(q => 
        q.id === questionId 
          ? { ...q, question: `${q.question} (replaced)` } 
          : q
      );
      
      setGeneratedPaper(prev => ({
        ...prev,
        [section]: updatedQuestions
      }));
      
      setIsLoading(false);
    }, 800);
  };

  const handleEditQuestion = (questionId: string, currentContent: string) => {
    setIsEditing(questionId);
    setEditContent(currentContent);
  };

  const saveEdit = () => {
    if (isEditing) {
      const updatedPaper = { ...generatedPaper };
      Object.keys(updatedPaper).forEach(section => {
        updatedPaper[section] = updatedPaper[section].map(q => 
          q.id === isEditing ? { ...q, question: editContent } : q
        );
      });
      
      setGeneratedPaper(updatedPaper);
      setIsEditing(null);
      setEditContent('');
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setEditContent('');
  };

  const handleGeneratePDF = () => {
    console.log("Generating mock PDF...");
    console.log("Configuration:", config);
    console.log("Generated Paper:", generatedPaper);
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("PDF generated successfully! (This is a mock implementation)");
    }, 2000);
  };

  const addCustomQuestion = (section: string) => {
    const marksPerQuestion = getMarksPerQuestion(section);
    const newQuestion: Question = {
      id: `custom-${Date.now()}`,
      type: 'theory',
      difficulty: 'medium',
      subject: config.subject,
      topic: config.topics[0] || 'General',
      marks: marksPerQuestion || 5,
      question: 'Enter your custom question here...'
    };
    
    setGeneratedPaper(prev => ({
      ...prev,
      [section]: [...prev[section], newQuestion]
    }));
  };

  const removeQuestion = (section: string, questionId: string) => {
    setGeneratedPaper(prev => ({
      ...prev,
      [section]: prev[section].filter(q => q.id !== questionId)
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-600 bg-emerald-50';
      case 'medium': return 'text-teal-600 bg-teal-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    return type === 'objective' ? 
      <AlertCircle className="w-4 h-4 text-emerald-600" /> : 
      <BookOpen className="w-4 h-4 text-teal-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-t-2xl px-6 py-8 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Question Paper Generator</h1>
          <p className="text-emerald-100 text-sm md:text-base">Create professional exam papers in seconds with intelligent question selection</p>
        </div>
        
        {/* Configuration Panel */}
        <div className="bg-white rounded-lg p-6 mb-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Exam Configuration</h2>
                <p className="text-sm text-gray-500">Total: {totalQuestions} questions • {totalMarks} marks</p>
              </div>
            </div>
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={`transform transition-transform duration-200 ${isConfigOpen ? 'rotate-180' : ''}`}
              aria-expanded={isConfigOpen}
              aria-label={isConfigOpen ? "Collapse configuration" : "Expand configuration"}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {isConfigOpen && (
            <>
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'basic'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'basic'}
                >
                  Basic Settings
                </button>
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'advanced'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'advanced'}
                >
                  Advanced Settings
                </button>
              </div>
              
              {activeTab === 'basic' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                  {/* Exam Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center mr-2">
                        <span className="text-emerald-600 text-sm">1</span>
                      </div>
                      Exam Details
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exam Type
                      </label>
                      <select
                        value={config.examType}
                        onChange={(e) => handleConfigChange('examType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        {EXAM_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <select
                        value={config.subject}
                        onChange={(e) => {
                          handleConfigChange('subject', e.target.value);
                          handleConfigChange('topics', [TOPICS[e.target.value as keyof typeof TOPICS][0]]);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        {SUBJECTS.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topics
                      </label>
                      <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                        {TOPICS[config.subject as keyof typeof TOPICS]?.map(topic => (
                          <button
                            key={topic}
                            onClick={() => handleTopicChange(topic)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                              config.topics.includes(topic)
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                            }`}
                            aria-pressed={config.topics.includes(topic)}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Time & Instructions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center mr-2">
                        <span className="text-emerald-600 text-sm">2</span>
                      </div>
                      Time & Instructions
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Limit (minutes)
                      </label>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                          type="number"
                          value={config.timeLimit}
                          onChange={(e) => handleConfigChange('timeLimit', parseInt(e.target.value) || 30)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          min="30"
                          max="360"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        General Instructions
                      </label>
                      <textarea
                        value={config.instructions}
                        onChange={(e) => handleConfigChange('instructions', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        placeholder="Enter exam instructions..."
                      />
                    </div>
                  </div>
                  
                  {/* Question Parameters */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center mr-2">
                        <span className="text-emerald-600 text-sm">3</span>
                      </div>
                      Question Parameters
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Types
                      </label>
                      <div className="flex space-x-2">
                        {['objective', 'theory', 'mixed'].map((type) => (
                          <button
                            key={type}
                            onClick={() => handleConfigChange('questionTypes', [type as 'objective' | 'theory' | 'mixed'])}
                            className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                              config.questionTypes.includes(type as 'objective' | 'theory' | 'mixed')
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                            aria-pressed={config.questionTypes.includes(type as 'objective' | 'theory' | 'mixed')}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <div className="space-y-2">
                        {['easy', 'medium', 'hard'].map((level) => (
                          <label key={level} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={config.difficulty.includes(level as 'easy' | 'medium' | 'hard')}
                              onChange={(e) => {
                                const newDifficulties = e.target.checked
                                  ? [...config.difficulty, level as 'easy' | 'medium' | 'hard']
                                  : config.difficulty.filter(d => d !== level);
                                handleConfigChange('difficulty', newDifficulties);
                              }}
                              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <span className={`ml-2 text-sm capitalize ${getDifficultyColor(level)}`}>
                              {level}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-6">
                  <h3 className="font-semibold text-gray-900 flex items-center mb-4">
                    <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center mr-2">
                      <span className="text-emerald-600 text-sm">4</span>
                    </div>
                    Section Configuration
                  </h3>
                  <div className="space-y-4">
                    {config.sections.map((section) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">Section {section.id}</h5>
                          {config.sections.length > 1 && (
                            <button
                              onClick={() => removeSection(section.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove section"
                              aria-label="Remove section"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Section Name
                            </label>
                            <input
                              type="text"
                              value={section.name}
                              onChange={(e) => updateSectionConfig(section.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Instructions
                            </label>
                            <input
                              type="text"
                              value={section.instruction}
                              onChange={(e) => updateSectionConfig(section.id, 'instruction', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                              placeholder="Section instructions..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total Marks
                            </label>
                            <input
                              type="number"
                              value={section.totalMarks}
                              onChange={(e) => updateSectionConfig(section.id, 'totalMarks', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Number of Questions
                            </label>
                            <input
                              type="number"
                              value={section.numberOfQuestions}
                              onChange={(e) => updateSectionConfig(section.id, 'numberOfQuestions', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                              min="1"
                            />
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">
                            <strong>Marks per question:</strong> {getMarksPerQuestion(section.id)} marks
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={addSection}
                      disabled={config.sections.length >= 5}
                      className="flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Add new section"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Section</span>
                    </button>
                    <div className="flex space-x-6 text-sm">
                      <div className="text-gray-600">
                        <span className="font-medium text-emerald-600">Total Questions:</span> {totalQuestions}
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium text-emerald-600">Total Marks:</span> {totalMarks}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg p-6 mb-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="text-lg text-gray-600">Generating your question paper...</span>
            </div>
          </div>
        )}
        
        {/* Generated Paper Preview */}
        {!isLoading && Object.keys(generatedPaper).length > 0 && (
          <div className="space-y-6 mb-6">
            {/* Analytics Summary */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Paper Summary</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <BarChart2 className="w-4 h-4 mr-1" />
                    Difficulty Distribution
                  </div>
                  <button
                    onClick={() => setShowAnswerKey(!showAnswerKey)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showAnswerKey
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-pressed={showAnswerKey}
                  >
                    {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">{totalQuestions}</div>
                  <div className="text-sm text-emerald-700">Total Questions</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">
                    {Object.values(generatedPaper).flat().filter(q => q.type === 'objective').length}
                  </div>
                  <div className="text-sm text-emerald-700">Objective</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">
                    {Object.values(generatedPaper).flat().filter(q => q.type === 'theory').length}
                  </div>
                  <div className="text-sm text-emerald-700">Theory</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">{totalMarks}</div>
                  <div className="text-sm text-emerald-700">Total Marks</div>
                </div>
              </div>
            </div>
            
            {/* Question Paper */}
            {Object.entries(generatedPaper).map(([sectionId, questions]) => {
              const sectionConfig = config.sections.find(s => s.id === sectionId);
              const marksPerQuestion = getMarksPerQuestion(sectionId);
              return (
                <div key={sectionId} className="bg-white rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-white">{sectionConfig?.name || `Section ${sectionId}`}</h2>
                        <p className="text-gray-300 text-sm">
                          {sectionConfig?.instruction}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{sectionConfig?.totalMarks} marks</div>
                        <div className="text-gray-300 text-sm">{marksPerQuestion} marks per question</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {questions.map((question, questionIndex) => (
                      <div 
                        key={question.id} 
                        className={`border rounded-lg p-6 transition-all duration-200 hover:shadow-md ${
                          isEditing === question.id ? 'ring-2 ring-emerald-500 border-emerald-200' : 'border-gray-200'
                        }`}
                      >
                        {isEditing === question.id ? (
                          <div className="space-y-4">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={saveEdit}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                                  {getQuestionTypeIcon(question.type)}
                                  <span className="capitalize">{question.type}</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                                  {question.difficulty}
                                </span>
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {question.topic}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                                  {question.marks} marks
                                </span>
                              </div>
                            </div>
                            <div className="mb-4">
                              <p className="text-gray-900 leading-relaxed">
                                <span className="font-semibold text-gray-700 mr-2">{questionIndex + 1}.</span>
                                {question.question}
                              </p>
                              {question.options && (
                                <div className="mt-3 space-y-2">
                                  {question.options.map((option, idx) => (
                                    <div 
                                      key={idx} 
                                      className={`flex items-center p-2 rounded-lg text-sm ${
                                        showAnswerKey && option === question.correctAnswer
                                          ? 'bg-emerald-50 border border-emerald-200'
                                          : 'bg-gray-50'
                                      }`}
                                    >
                                      <span className="font-medium text-gray-600 w-6">
                                        {String.fromCharCode(65 + idx)}.
                                      </span>
                                      <span className={showAnswerKey && option === question.correctAnswer ? 'text-emerald-700 font-medium' : 'text-gray-700'}>
                                        {option}
                                      </span>
                                      {showAnswerKey && option === question.correctAnswer && (
                                        <CheckCircle className="w-4 h-4 text-emerald-500 ml-2" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {showAnswerKey && question.answer && (
                                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                  <h4 className="text-sm font-semibold text-emerald-800 mb-1">Answer:</h4>
                                  <p className="text-sm text-emerald-700">{question.answer}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditQuestion(question.id, question.question)}
                                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit question"
                                aria-label="Edit question"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReplaceQuestion(sectionId, question.id)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Replace with similar question"
                                aria-label="Replace question"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeQuestion(sectionId, question.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove question"
                                aria-label="Remove question"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addCustomQuestion(sectionId)}
                      className="w-full mt-4 flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      aria-label="Add custom question"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Custom Question</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* PDF Generation */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ready to Export</h3>
                <p className="text-sm text-gray-600">Generate and download your professional question paper</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={handleGeneratePDF}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Generate PDF"
              >
                <FileText className="w-5 h-5" />
                <span>Generate PDF</span>
              </button>
              <button
                disabled={isLoading}
                className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                aria-label="Download question paper"
              >
                <Download className="w-5 h-5" />
                <span>Download Question Paper</span>
              </button>
              <button
                disabled={isLoading}
                className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                aria-label="Download answer key"
              >
                <Download className="w-5 h-5" />
                <span>Download Answer Key</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* XP Rewards Preview */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-green-800">Student Engagement</h3>
          </div>
          <p className="text-green-700 mb-4">
            Students who complete this paper will earn <strong className="text-green-900">{Math.round(totalMarks * 10)} XP</strong> and unlock the <strong className="text-green-900">Advanced Problem Solver</strong> badge!
          </p>
          <div className="flex items-center text-sm text-green-600">
            <HelpCircle className="w-4 h-4 mr-1" />
            <span>XP rewards motivate students to practice more and track their progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}
