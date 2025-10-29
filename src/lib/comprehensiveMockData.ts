// src/lib/comprehensiveMockData.ts

// ==================== TYPE DEFINITIONS ====================

export interface Institution {
  id: string;
  name: string;
  type: 'school' | 'college';
  location: string;
  classes: string[]; // ['8', '9', '10'] or ['11', '12']
  sections: string[]; // ['A', 'B', 'C']
  totalStudents: number;
  totalTeachers: number;
  established: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'school' | 'college';
  maxMarks: number;
}

export interface Teacher {
  id: string;
  uid: string; // Firebase UID for login
  name: string;
  email: string;
  institutionId: string;
  subjects: string[]; // Subject IDs
  assignedClasses: {
    class: string;
    section: string;
    subject: string;
  }[];
  yearsOfExperience: number;
  joiningDate: string;
}

export interface Student {
  id: string;
  uid: string; // Firebase UID for login
  name: string;
  email: string;
  rollNo: string;
  class: string;
  section: string;
  institutionId: string;
  dateOfBirth: string;
  parentContact: string;
  performance: {
    overallPercentage: number;
    rank: number;
    attendance: number;
    testsCompleted: number;
    level: number; // Gamification
    xp: number;
    streak: number;
  };
  subjectScores: {
    subjectId: string;
    subjectName: string;
    teacherId: string;
    averageScore: number;
    testsCompleted: number;
    lastTestScore: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

export interface Test {
  id: string;
  title: string;
  type: 'unit-test' | 'midterm' | 'final' | 'assignment' | 'quiz';
  subjectId: string;
  subjectName: string;
  class: string;
  section: string;
  institutionId: string;
  teacherId: string;
  totalMarks: number;
  date: string;
  status: 'completed' | 'scheduled' | 'in-progress';
  duration: number; // minutes
  syllabusCovered: string[]; // chapters/topics
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  rank: number;
  submittedAt: string;
  evaluatedAt: string;
  teacherComments: string;
  aiComments: string;
  questionWiseScores: {
    questionNo: number;
    marks: number;
    totalMarks: number;
    aiComment: string;
    teacherComment: string;
  }[];
}

// ==================== MOCK DATA ====================

// Subjects
export const schoolSubjects: Subject[] = [
  { id: 'sub_lang1', name: 'Hindi', code: 'LANG1', type: 'school', maxMarks: 100 },
  { id: 'sub_lang2', name: 'Sanskrit', code: 'LANG2', type: 'school', maxMarks: 100 },
  { id: 'sub_eng', name: 'English', code: 'ENG', type: 'school', maxMarks: 100 },
  { id: 'sub_math', name: 'Mathematics', code: 'MATH', type: 'school', maxMarks: 100 },
  { id: 'sub_sci', name: 'Science', code: 'SCI', type: 'school', maxMarks: 100 },
  { id: 'sub_sst', name: 'Social Studies', code: 'SST', type: 'school', maxMarks: 100 },
];

export const collegeSubjects: Subject[] = [
  { id: 'sub_c_lang', name: 'Hindi', code: 'LANG', type: 'college', maxMarks: 100 },
  { id: 'sub_c_eng', name: 'English', code: 'ENG', type: 'college', maxMarks: 100 },
  { id: 'sub_c_phy', name: 'Physics', code: 'PHY', type: 'college', maxMarks: 100 },
  { id: 'sub_c_chem', name: 'Chemistry', code: 'CHEM', type: 'college', maxMarks: 100 },
  { id: 'sub_c_math', name: 'Mathematics', code: 'MATH', type: 'college', maxMarks: 100 },
  { id: 'sub_c_bio', name: 'Biology', code: 'BIO', type: 'college', maxMarks: 100 },
  { id: 'sub_c_cs', name: 'Computer Science', code: 'CS', type: 'college', maxMarks: 100 },
];

// Institutions
export const institutions: Institution[] = [
  {
    id: 'inst_001',
    name: 'Delhi Public School',
    type: 'school',
    location: 'Delhi',
    classes: ['8', '9', '10'],
    sections: ['A', 'B', 'C'],
    totalStudents: 270, // 3 classes * 3 sections * 30 students
    totalTeachers: 18, // 6 subjects * 3 sections
    established: '1995',
  },
  {
    id: 'inst_002',
    name: 'St. Xavier\'s School',
    type: 'school',
    location: 'Mumbai',
    classes: ['8', '9', '10'],
    sections: ['A', 'B', 'C'],
    totalStudents: 270,
    totalTeachers: 18,
    established: '1998',
  },
  {
    id: 'inst_003',
    name: 'Kendriya Vidyalaya',
    type: 'school',
    location: 'Bangalore',
    classes: ['8', '9', '10'],
    sections: ['A', 'B', 'C'],
    totalStudents: 270,
    totalTeachers: 18,
    established: '2000',
  },
  {
    id: 'inst_004',
    name: 'Presidency College',
    type: 'college',
    location: 'Chennai',
    classes: ['11', '12'],
    sections: ['A', 'B', 'C'],
    totalStudents: 180, // 2 classes * 3 sections * 30 students
    totalTeachers: 21, // 7 subjects * 3 sections
    established: '2005',
  },
];

// Sample Teachers (you'll need to generate more)
export const teachers: Teacher[] = [
  // Delhi Public School - Class 8A
  {
    id: 'tchr_001',
    uid: 'firebase_uid_tchr_001',
    name: 'Mrs. Sharma',
    email: 'sharma@dps.edu',
    institutionId: 'inst_001',
    subjects: ['sub_math'],
    assignedClasses: [
      { class: '8', section: 'A', subject: 'sub_math' },
      { class: '9', section: 'A', subject: 'sub_math' },
    ],
    yearsOfExperience: 12,
    joiningDate: '2013-06-15',
  },
  {
    id: 'tchr_002',
    uid: 'firebase_uid_tchr_002',
    name: 'Mr. Verma',
    email: 'verma@dps.edu',
    institutionId: 'inst_001',
    subjects: ['sub_sci'],
    assignedClasses: [
      { class: '8', section: 'A', subject: 'sub_sci' },
      { class: '8', section: 'B', subject: 'sub_sci' },
    ],
    yearsOfExperience: 10,
    joiningDate: '2015-07-01',
  },
  // Add more teachers for each subject and section...
];

// Generate Students Function
function generateStudents(): Student[] {
  const students: Student[] = [];
  const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun',
    'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Ananya', 'Aadhya', 'Navya', 'Diya', 'Saanvi',
    'Anika', 'Pari', 'Myra', 'Sara', 'Riya',
    'Priya', 'Pooja', 'Kavya', 'Ishita', 'Tanvi',
    'Rohan', 'Karan', 'Arnav', 'Dhruv', 'Yash'
  ];
  
  const lastNames = [
    'Sharma', 'Verma', 'Kumar', 'Singh', 'Patel',
    'Gupta', 'Reddy', 'Nair', 'Joshi', 'Desai',
    'Mehta', 'Kapoor', 'Chopra', 'Malhotra', 'Bansal'
  ];

  let studentCounter = 1;

  institutions.forEach(institution => {
    institution.classes.forEach(className => {
      institution.sections.forEach(section => {
        // 30 students per section
        for (let i = 1; i <= 30; i++) {
          const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
          const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
          const rollNo = `${className}${section}-${String(i).padStart(2, '0')}`;
          
          // Generate performance metrics
          const basePercentage = 60 + Math.random() * 35; // 60-95%
          const testsCompleted = Math.floor(5 + Math.random() * 5); // 5-10 tests
          
          // Generate subject scores
          const subjects = institution.type === 'school' ? schoolSubjects : collegeSubjects;
          const subjectScores = subjects.map(subject => ({
            subjectId: subject.id,
            subjectName: subject.name,
            teacherId: `tchr_${String(Math.floor(Math.random() * 18) + 1).padStart(3, '0')}`,
            averageScore: Math.floor(basePercentage + (Math.random() * 20 - 10)),
            testsCompleted: Math.floor(3 + Math.random() * 4),
            lastTestScore: Math.floor(basePercentage + (Math.random() * 30 - 15)),
            trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'stable' : 'down' as 'up' | 'down' | 'stable',
          }));

          students.push({
            id: `std_${String(studentCounter).padStart(4, '0')}`,
            uid: `firebase_uid_std_${String(studentCounter).padStart(4, '0')}`,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.edu`,
            rollNo,
            class: className,
            section,
            institutionId: institution.id,
            dateOfBirth: `${2010 + Math.floor(Math.random() * 3)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            parentContact: `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`,
            performance: {
              overallPercentage: Math.floor(basePercentage),
              rank: Math.floor(Math.random() * 30) + 1,
              attendance: Math.floor(85 + Math.random() * 15),
              testsCompleted,
              level: Math.floor(testsCompleted / 2) + 1,
              xp: testsCompleted * 100 + Math.floor(Math.random() * 500),
              streak: Math.floor(Math.random() * 15),
            },
            subjectScores,
          });

          studentCounter++;
        }
      });
    });
  });

  return students;
}

export const students = generateStudents();

// Generate Tests for October 2025
export const tests: Test[] = [
  // Completed Tests (October 1-26)
  {
    id: 'test_001',
    title: 'Mathematics Unit Test 1',
    type: 'unit-test',
    subjectId: 'sub_math',
    subjectName: 'Mathematics',
    class: '8',
    section: 'A',
    institutionId: 'inst_001',
    teacherId: 'tchr_001',
    totalMarks: 50,
    date: '2025-10-05',
    status: 'completed',
    duration: 60,
    syllabusCovered: ['Rational Numbers', 'Linear Equations'],
  },
  {
    id: 'test_002',
    title: 'Science Mid-term Exam',
    type: 'midterm',
    subjectId: 'sub_sci',
    subjectName: 'Science',
    class: '8',
    section: 'A',
    institutionId: 'inst_001',
    teacherId: 'tchr_002',
    totalMarks: 100,
    date: '2025-10-15',
    status: 'completed',
    duration: 180,
    syllabusCovered: ['Force and Pressure', 'Friction', 'Sound'],
  },
  // Scheduled Tests (October 27-31)
  {
    id: 'test_003',
    title: 'English Grammar Quiz',
    type: 'quiz',
    subjectId: 'sub_eng',
    subjectName: 'English',
    class: '8',
    section: 'A',
    institutionId: 'inst_001',
    teacherId: 'tchr_003',
    totalMarks: 25,
    date: '2025-10-28',
    status: 'scheduled',
    duration: 30,
    syllabusCovered: ['Tenses', 'Active/Passive Voice'],
  },
  {
    id: 'test_004',
    title: 'Social Studies Unit Test 2',
    type: 'unit-test',
    subjectId: 'sub_sst',
    subjectName: 'Social Studies',
    class: '8',
    section: 'A',
    institutionId: 'inst_001',
    teacherId: 'tchr_004',
    totalMarks: 50,
    date: '2025-10-30',
    status: 'scheduled',
    duration: 60,
    syllabusCovered: ['Indian Constitution', 'Judiciary'],
  },
  // Add more tests for other sections and classes...
];

// Helper Functions
export const getInstitutionById = (id: string) => institutions.find(inst => inst.id === id);
export const getTeacherById = (id: string) => teachers.find(tchr => tchr.id === id);
export const getStudentById = (id: string) => students.find(std => std.id === id);
export const getStudentsByClass = (institutionId: string, className: string, section: string) =>
  students.filter(s => s.institutionId === institutionId && s.class === className && s.section === section);
export const getTestsByTeacher = (teacherId: string) => tests.filter(t => t.teacherId === teacherId);
export const getTestsByClass = (institutionId: string, className: string, section: string) =>
  tests.filter(t => t.institutionId === institutionId && t.class === className && t.section === section);

// Analytics Helper Functions
export const getClassAverage = (institutionId: string, className: string, section: string) => {
  const classStudents = getStudentsByClass(institutionId, className, section);
  const totalPercentage = classStudents.reduce((sum, s) => sum + s.performance.overallPercentage, 0);
  return Math.floor(totalPercentage / classStudents.length);
};

export const getSubjectAverage = (institutionId: string, className: string, section: string, subjectId: string) => {
  const classStudents = getStudentsByClass(institutionId, className, section);
  const subjectScores = classStudents.map(s => s.subjectScores.find(ss => ss.subjectId === subjectId)?.averageScore || 0);
  return Math.floor(subjectScores.reduce((sum, score) => sum + score, 0) / subjectScores.length);
};

export const getInstitutionStats = (institutionId: string) => {
  const instStudents = students.filter(s => s.institutionId === institutionId);
  const totalPercentage = instStudents.reduce((sum, s) => sum + s.performance.overallPercentage, 0);
  const avgAttendance = instStudents.reduce((sum, s) => sum + s.performance.attendance, 0);

  return {
    totalStudents: instStudents.length,
    averagePercentage: Math.floor(totalPercentage / instStudents.length),
    averageAttendance: Math.floor(avgAttendance / instStudents.length),
    totalTests: tests.filter(t => t.institutionId === institutionId).length,
    completedTests: tests.filter(t => t.institutionId === institutionId && t.status === 'completed').length,
  };
};

// Additional helper functions for institution dashboard
export const getStudentsByInstitution = (institutionId: string) =>
  students.filter(s => s.institutionId === institutionId);

export const getTeachersByInstitution = (institutionId: string) =>
  teachers.filter(t => t.institutionId === institutionId);

export const getTestsByInstitution = (institutionId: string) =>
  tests.filter(t => t.institutionId === institutionId);
