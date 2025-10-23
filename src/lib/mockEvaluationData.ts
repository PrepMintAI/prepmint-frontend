// src/lib/mockEvaluationData.ts

export interface StudentResult {
  id: number;
  name: string;
  rollNo: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: 'approved' | 'needs-revision' | 'pending';
  breakdown: {
    question: number;
    marks: number;
    total: number;
    aiComment: string;
    teacherComment?: string;
  }[];
  submittedAt: string;
}

export interface EvaluationData {
  id: number;
  title: string;
  subject: string;
  class: string;
  type: 'bulk' | 'single';
  totalMarks: number;
  totalSubmissions: number;
  evaluated: number;
  pending: number;
  createdAt: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'pending';
  avgScore: number;
  highestScore: number;
  lowestScore: number;
  students: StudentResult[];
}

// Mock Evaluation Data
export const mockEvaluations: EvaluationData[] = [
  {
    id: 1,
    title: 'Mathematics Midterm Exam',
    subject: 'Mathematics',
    class: 'Class 10-A',
    type: 'bulk',
    totalMarks: 100,
    totalSubmissions: 35,
    evaluated: 35,
    pending: 0,
    createdAt: '2025-10-20',
    dueDate: '2025-10-25',
    status: 'completed',
    avgScore: 82,
    highestScore: 98,
    lowestScore: 62,
    students: [
      {
        id: 1,
        name: 'Aarav Sharma',
        rollNo: '10A-01',
        score: 87,
        totalMarks: 100,
        percentage: 87,
        status: 'approved',
        breakdown: [
          { 
            question: 1, 
            marks: 29, 
            total: 30, 
            aiComment: 'Excellent understanding of quadratic equations. Applied the formula correctly with clear steps. Minor calculation error in the discriminant.',
            teacherComment: 'Great work! Watch your arithmetic.'
          },
          { 
            question: 2, 
            marks: 28, 
            total: 35, 
            aiComment: 'Good approach to trigonometry problem. Used correct identities but the final simplification needs improvement.',
            teacherComment: 'Review simplification rules.'
          },
          { 
            question: 3, 
            marks: 30, 
            total: 35, 
            aiComment: 'Perfect understanding of geometry theorems. All proofs are logically sound and well-presented.',
            teacherComment: 'Excellent proof!'
          },
        ],
        submittedAt: '2025-10-22 10:30 AM',
      },
      {
        id: 2,
        name: 'Priya Patel',
        rollNo: '10A-02',
        score: 92,
        totalMarks: 100,
        percentage: 92,
        status: 'approved',
        breakdown: [
          { 
            question: 1, 
            marks: 30, 
            total: 30, 
            aiComment: 'Perfect execution of quadratic formula. All steps clearly shown with correct final answer.',
            teacherComment: 'Outstanding work!'
          },
          { 
            question: 2, 
            marks: 32, 
            total: 35, 
            aiComment: 'Excellent trigonometry knowledge. Applied multiple identities correctly. Minor notation issue.',
            teacherComment: ''
          },
          { 
            question: 3, 
            marks: 30, 
            total: 35, 
            aiComment: 'Very good geometric proof. Clear reasoning and well-structured argument.',
            teacherComment: 'Keep up the excellent work!'
          },
        ],
        submittedAt: '2025-10-22 11:15 AM',
      },
      {
        id: 3,
        name: 'Rohan Kumar',
        rollNo: '10A-03',
        score: 78,
        totalMarks: 100,
        percentage: 78,
        status: 'needs-revision',
        breakdown: [
          { 
            question: 1, 
            marks: 24, 
            total: 30, 
            aiComment: 'Basic understanding shown but lacks detailed steps. Calculation error in final answer.',
            teacherComment: 'Show more working. Practice more.'
          },
          { 
            question: 2, 
            marks: 26, 
            total: 35, 
            aiComment: 'Attempted the problem but used incorrect trigonometric identity. Final answer is wrong.',
            teacherComment: 'Review trig identities carefully.'
          },
          { 
            question: 3, 
            marks: 28, 
            total: 35, 
            aiComment: 'Good attempt at proof but logic gap in the middle section. Conclusion needs better justification.',
            teacherComment: ''
          },
        ],
        submittedAt: '2025-10-22 09:45 AM',
      },
      {
        id: 4,
        name: 'Ananya Singh',
        rollNo: '10A-04',
        score: 95,
        totalMarks: 100,
        percentage: 95,
        status: 'approved',
        breakdown: [
          { question: 1, marks: 30, total: 30, aiComment: 'Perfect solution with clear methodology.', teacherComment: 'Excellent!' },
          { question: 2, marks: 33, total: 35, aiComment: 'Outstanding work. Minor presentation issue.', teacherComment: '' },
          { question: 3, marks: 32, total: 35, aiComment: 'Very strong proof with clear logic.', teacherComment: 'Well done!' },
        ],
        submittedAt: '2025-10-22 10:00 AM',
      },
      {
        id: 5,
        name: 'Kabir Mehta',
        rollNo: '10A-05',
        score: 85,
        totalMarks: 100,
        percentage: 85,
        status: 'approved',
        breakdown: [
          { question: 1, marks: 27, total: 30, aiComment: 'Good understanding. Minor error in steps.', teacherComment: '' },
          { question: 2, marks: 30, total: 35, aiComment: 'Solid approach. Well explained.', teacherComment: 'Good job!' },
          { question: 3, marks: 28, total: 35, aiComment: 'Clear proof with good structure.', teacherComment: '' },
        ],
        submittedAt: '2025-10-22 11:30 AM',
      },
    ],
  },
  {
    id: 2,
    title: 'Physics Unit Test - Chapter 5',
    subject: 'Physics',
    class: 'Class 11-A',
    type: 'bulk',
    totalMarks: 50,
    totalSubmissions: 40,
    evaluated: 40,
    pending: 0,
    createdAt: '2025-10-18',
    dueDate: '2025-10-22',
    status: 'completed',
    avgScore: 82,
    highestScore: 48,
    lowestScore: 28,
    students: [
      {
        id: 11,
        name: 'Sanjana Reddy',
        rollNo: '11A-01',
        score: 45,
        totalMarks: 50,
        percentage: 90,
        status: 'approved',
        breakdown: [
          { question: 1, marks: 15, total: 15, aiComment: 'Perfect understanding of thermodynamics laws.', teacherComment: 'Excellent!' },
          { question: 2, marks: 14, total: 15, aiComment: 'Very good derivation. Minor notation issue.', teacherComment: '' },
          { question: 3, marks: 16, total: 20, aiComment: 'Good problem solving. Check unit conversions.', teacherComment: 'Watch units!' },
        ],
        submittedAt: '2025-10-21 02:00 PM',
      },
      {
        id: 12,
        name: 'Arjun Nair',
        rollNo: '11A-02',
        score: 42,
        totalMarks: 50,
        percentage: 84,
        status: 'approved',
        breakdown: [
          { question: 1, marks: 14, total: 15, aiComment: 'Good understanding. Minor conceptual gap.', teacherComment: '' },
          { question: 2, marks: 14, total: 15, aiComment: 'Solid derivation with clear steps.', teacherComment: 'Good work!' },
          { question: 3, marks: 14, total: 20, aiComment: 'Calculation error in final answer.', teacherComment: 'Review calculations.' },
        ],
        submittedAt: '2025-10-21 02:15 PM',
      },
      {
        id: 13,
        name: 'Diya Kapoor',
        rollNo: '11A-03',
        score: 38,
        totalMarks: 50,
        percentage: 76,
        status: 'needs-revision',
        breakdown: [
          { question: 1, marks: 12, total: 15, aiComment: 'Basic understanding but lacks detail.', teacherComment: 'Add more explanation.' },
          { question: 2, marks: 13, total: 15, aiComment: 'Good attempt. Check the second step.', teacherComment: '' },
          { question: 3, marks: 13, total: 20, aiComment: 'Incomplete solution. Show more working.', teacherComment: 'Show all steps!' },
        ],
        submittedAt: '2025-10-21 01:45 PM',
      },
    ],
  },
  {
    id: 3,
    title: 'Chemistry Lab Report',
    subject: 'Chemistry',
    class: 'Class 11-B',
    type: 'single',
    totalMarks: 30,
    totalSubmissions: 1,
    evaluated: 1,
    pending: 0,
    createdAt: '2025-10-23',
    dueDate: '2025-10-24',
    status: 'completed',
    avgScore: 85,
    highestScore: 85,
    lowestScore: 85,
    students: [
      {
        id: 21,
        name: 'Vivaan Joshi',
        rollNo: '11B-12',
        score: 26,
        totalMarks: 30,
        percentage: 87,
        status: 'approved',
        breakdown: [
          { 
            question: 1, 
            marks: 9, 
            total: 10, 
            aiComment: 'Excellent experimental procedure. All steps clearly documented with proper safety measures.',
            teacherComment: 'Great lab technique!'
          },
          { 
            question: 2, 
            marks: 8, 
            total: 10, 
            aiComment: 'Good observations and data recording. Minor error in one measurement.',
            teacherComment: ''
          },
          { 
            question: 3, 
            marks: 9, 
            total: 10, 
            aiComment: 'Strong analysis and conclusion. References cited properly.',
            teacherComment: 'Well researched!'
          },
        ],
        submittedAt: '2025-10-23 04:30 PM',
      },
    ],
  },
];


// Helper function to get evaluation by ID
export const getEvaluationById = (id: number): EvaluationData | undefined => {
  return mockEvaluations.find(evaluation => evaluation.id === id); // ✅ Changed 'eval' to 'evaluation'
};

// Helper function to get summary for list view
export const getEvaluationSummary = () => {
  return mockEvaluations.map(evaluation => ({ // ✅ Changed 'eval' to 'evaluation'
    id: evaluation.id,
    title: evaluation.title,
    subject: evaluation.subject,
    class: evaluation.class,
    type: evaluation.type,
    totalSubmissions: evaluation.totalSubmissions,
    evaluated: evaluation.evaluated,
    pending: evaluation.pending,
    createdAt: evaluation.createdAt,
    dueDate: evaluation.dueDate,
    status: evaluation.status,
    avgScore: evaluation.avgScore,
  }));
};
