#!/usr/bin/env node

/**
 * PrepMint Firebase Data Population Script
 *
 * Populates Firebase with comprehensive mock data:
 * - 2 schools (Nandi School in Bellary + one more)
 * - Classes 5-8 with sections A, B, C (12 classes per school)
 * - 5 students per section (60 students per school, 120 total)
 * - Teachers for each subject + class teachers
 * - Subjects (Math, Science, English, Social Studies, Hindi, Kannada)
 */

require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

// Configuration
const SCHOOLS = [
  {
    name: 'Nandi School',
    location: 'Bellary',
    cityId: 'bellary-karnataka',
    address: 'MG Road, Bellary, Karnataka 583101',
    principal: 'Dr. Raghavendra Rao',
    establishedYear: 2010,
  },
  {
    name: 'Vidya Vikas School',
    location: 'Bellary',
    cityId: 'bellary-karnataka',
    address: 'Station Road, Bellary, Karnataka 583102',
    principal: 'Mrs. Lakshmi Devi',
    establishedYear: 2008,
  },
];

const CLASSES = [5, 6, 7, 8];
const SECTIONS = ['A', 'B', 'C'];
const STUDENTS_PER_SECTION = 5;

const SUBJECTS = [
  { name: 'Mathematics', code: 'MATH', type: 'core' },
  { name: 'Science', code: 'SCI', type: 'core' },
  { name: 'English', code: 'ENG', type: 'core' },
  { name: 'Social Studies', code: 'SST', type: 'core' },
  { name: 'Hindi', code: 'HIN', type: 'language' },
  { name: 'Kannada', code: 'KAN', type: 'language' },
];

const TEACHER_FIRST_NAMES = [
  'Ramesh', 'Suresh', 'Mahesh', 'Rajesh', 'Dinesh',
  'Priya', 'Divya', 'Kavya', 'Shreya', 'Ananya',
  'Vijay', 'Arun', 'Kiran', 'Mohan', 'Prakash',
  'Suma', 'Rekha', 'Meena', 'Geetha', 'Radha',
];

const TEACHER_LAST_NAMES = [
  'Kumar', 'Reddy', 'Sharma', 'Rao', 'Patel',
  'Singh', 'Nair', 'Iyer', 'Desai', 'Joshi',
];

const STUDENT_FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun',
  'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
  'Aadhya', 'Ananya', 'Pari', 'Anika', 'Diya',
  'Saanvi', 'Aaradhya', 'Navya', 'Angel', 'Prisha',
  'Riya', 'Myra', 'Sara', 'Jiya', 'Shanaya',
  'Advait', 'Kiaan', 'Ayush', 'Atharv', 'Kabir',
];

const STUDENT_LAST_NAMES = [
  'Sharma', 'Kumar', 'Reddy', 'Patel', 'Singh',
  'Rao', 'Nair', 'Iyer', 'Desai', 'Joshi',
  'Gupta', 'Mehta', 'Shah', 'Agarwal', 'Bansal',
];

// Utility Functions
function generateEmail(firstName, lastName, role, institutionName) {
  const cleanName = institutionName.toLowerCase().replace(/\s+/g, '');
  const cleanFirst = firstName.toLowerCase();
  const cleanLast = lastName.toLowerCase();
  return `${cleanFirst}.${cleanLast}.${role}@${cleanName}.edu.in`;
}

function generatePassword() {
  return 'Test@123'; // Simple password for testing
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Data Generation Functions
async function clearExistingData() {
  console.log('\n🗑️  Clearing existing data...');

  const collections = [
    'institutions',
    'users',
    'subjects',
    'tests',
    'evaluations',
    'activity',
    'notifications',
    'jobQueues',
    'badges',
    'leaderboards',
  ];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const batchSize = 500;
    let batch = db.batch();
    let count = 0;

    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      count++;

      if (count === batchSize) {
        await batch.commit();
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    console.log(`   ✓ Cleared ${snapshot.size} documents from ${collectionName}`);
  }

  // Clear Firebase Auth users (except current admin)
  console.log('   ⚠️  Note: Firebase Auth users not cleared automatically (requires manual cleanup or Cloud Functions)');
}

async function createInstitutions() {
  console.log('\n🏫 Creating institutions...');
  const institutionIds = [];

  for (const school of SCHOOLS) {
    const institutionRef = db.collection('institutions').doc();
    const institutionId = institutionRef.id;

    await institutionRef.set({
      name: school.name,
      location: school.location,
      cityId: school.cityId,
      address: school.address,
      principal: school.principal,
      establishedYear: school.establishedYear,
      totalStudents: CLASSES.length * SECTIONS.length * STUDENTS_PER_SECTION,
      totalTeachers: SUBJECTS.length + (CLASSES.length * SECTIONS.length), // Subject teachers + class teachers
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      active: true,
    });

    institutionIds.push({
      id: institutionId,
      name: school.name,
    });

    console.log(`   ✓ Created institution: ${school.name} (${institutionId})`);
  }

  return institutionIds;
}

async function createSubjects(institutionIds) {
  console.log('\n📚 Creating subjects...');
  const subjectIds = {};

  for (const institution of institutionIds) {
    subjectIds[institution.id] = [];

    for (const subject of SUBJECTS) {
      const subjectRef = db.collection('subjects').doc();
      const subjectId = subjectRef.id;

      await subjectRef.set({
        name: subject.name,
        code: subject.code,
        type: subject.type,
        institutionId: institution.id,
        description: `${subject.name} curriculum for classes 5-8`,
        createdAt: Timestamp.now(),
        active: true,
      });

      subjectIds[institution.id].push({
        id: subjectId,
        name: subject.name,
        code: subject.code,
      });
    }

    console.log(`   ✓ Created ${SUBJECTS.length} subjects for ${institution.name}`);
  }

  return subjectIds;
}

async function createTeachers(institutionIds, subjectIds) {
  console.log('\n👨‍🏫 Creating teachers...');
  const teachers = {};

  for (const institution of institutionIds) {
    teachers[institution.id] = {
      subjectTeachers: {},
      classTeachers: {},
    };

    // Create subject teachers
    for (const subject of subjectIds[institution.id]) {
      const firstName = randomElement(TEACHER_FIRST_NAMES);
      const lastName = randomElement(TEACHER_LAST_NAMES);
      const email = generateEmail(firstName, lastName, 'teacher', institution.name);
      const password = generatePassword();

      try {
        // Create Firebase Auth user
        const userRecord = await auth.createUser({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
          emailVerified: true,
        });

        // Set custom claims
        await auth.setCustomUserClaims(userRecord.uid, {
          role: 'teacher',
          institutionId: institution.id,
          email,
        });

        // Create Firestore user document
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email,
          displayName: `${firstName} ${lastName}`,
          role: 'teacher',
          institutionId: institution.id,
          subjects: [subject.id],
          subjectNames: [subject.name],
          xp: randomInt(100, 500),
          level: randomInt(1, 5),
          badges: [],
          photoURL: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          lastLoginAt: Timestamp.now(),
          active: true,
        });

        teachers[institution.id].subjectTeachers[subject.code] = {
          uid: userRecord.uid,
          name: `${firstName} ${lastName}`,
          email,
          subjectId: subject.id,
        };

        console.log(`   ✓ Created teacher: ${firstName} ${lastName} (${subject.name})`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`   ⚠️  Email already exists: ${email}, skipping...`);
        } else {
          console.error(`   ✗ Error creating teacher ${email}:`, error.message);
        }
      }
    }

    // Create class teachers
    for (const classNum of CLASSES) {
      for (const section of SECTIONS) {
        const firstName = randomElement(TEACHER_FIRST_NAMES);
        const lastName = randomElement(TEACHER_LAST_NAMES);
        const email = generateEmail(firstName, lastName, `class${classNum}${section}`, institution.name);
        const password = generatePassword();

        try {
          const userRecord = await auth.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
            emailVerified: true,
          });

          await auth.setCustomUserClaims(userRecord.uid, {
            role: 'teacher',
            institutionId: institution.id,
            email,
          });

          await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            displayName: `${firstName} ${lastName}`,
            role: 'teacher',
            institutionId: institution.id,
            classTeacher: `${classNum}-${section}`,
            className: `Class ${classNum}-${section}`,
            xp: randomInt(100, 500),
            level: randomInt(1, 5),
            badges: [],
            photoURL: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            lastLoginAt: Timestamp.now(),
            active: true,
          });

          teachers[institution.id].classTeachers[`${classNum}-${section}`] = {
            uid: userRecord.uid,
            name: `${firstName} ${lastName}`,
            email,
          };

          console.log(`   ✓ Created class teacher: ${firstName} ${lastName} (Class ${classNum}-${section})`);
        } catch (error) {
          if (error.code === 'auth/email-already-exists') {
            console.log(`   ⚠️  Email already exists: ${email}, skipping...`);
          } else {
            console.error(`   ✗ Error creating class teacher ${email}:`, error.message);
          }
        }
      }
    }
  }

  return teachers;
}

async function createStudents(institutionIds) {
  console.log('\n👨‍🎓 Creating students...');
  const students = {};
  let totalCreated = 0;

  for (const institution of institutionIds) {
    students[institution.id] = [];

    for (const classNum of CLASSES) {
      for (const section of SECTIONS) {
        for (let i = 1; i <= STUDENTS_PER_SECTION; i++) {
          const firstName = randomElement(STUDENT_FIRST_NAMES);
          const lastName = randomElement(STUDENT_LAST_NAMES);
          const rollNumber = `${classNum}${section}${String(i).padStart(2, '0')}`;
          const email = generateEmail(firstName, lastName, `student${rollNumber}`, institution.name);
          const password = generatePassword();

          try {
            const userRecord = await auth.createUser({
              email,
              password,
              displayName: `${firstName} ${lastName}`,
              emailVerified: true,
            });

            await auth.setCustomUserClaims(userRecord.uid, {
              role: 'student',
              institutionId: institution.id,
              email,
            });

            await db.collection('users').doc(userRecord.uid).set({
              uid: userRecord.uid,
              email,
              displayName: `${firstName} ${lastName}`,
              role: 'student',
              institutionId: institution.id,
              class: classNum,
              section,
              rollNumber,
              className: `Class ${classNum}-${section}`,
              xp: randomInt(0, 1000),
              level: randomInt(1, 10),
              badges: [],
              streak: randomInt(0, 30),
              photoURL: null,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              lastLoginAt: Timestamp.now(),
              active: true,
            });

            students[institution.id].push({
              uid: userRecord.uid,
              name: `${firstName} ${lastName}`,
              email,
              class: classNum,
              section,
              rollNumber,
            });

            totalCreated++;

            if (totalCreated % 10 === 0) {
              console.log(`   ✓ Created ${totalCreated} students...`);
            }
          } catch (error) {
            if (error.code === 'auth/email-already-exists') {
              // Skip silently for students
            } else {
              console.error(`   ✗ Error creating student ${email}:`, error.message);
            }
          }
        }
      }
    }

    console.log(`   ✓ Created ${students[institution.id].length} students for ${institution.name}`);
  }

  return students;
}

async function createBadges() {
  console.log('\n🏆 Creating badges...');

  const badges = [
    { id: 'first-upload', name: 'First Upload', description: 'Uploaded first assignment', iconUrl: '🎯', xpRequired: 50 },
    { id: 'quick-learner', name: 'Quick Learner', description: 'Completed 10 evaluations', iconUrl: '⚡', xpRequired: 100 },
    { id: 'perfect-score', name: 'Perfect Score', description: 'Achieved 100% in an evaluation', iconUrl: '💯', xpRequired: 100 },
    { id: 'week-streak', name: 'Week Streak', description: '7-day login streak', iconUrl: '🔥', xpRequired: 70 },
    { id: 'century', name: 'Century', description: 'Earned 100 XP', iconUrl: '💯', xpRequired: 100 },
    { id: 'achiever', name: 'Achiever', description: 'Reached level 5', iconUrl: '🌟', xpRequired: 2500 },
  ];

  for (const badge of badges) {
    await db.collection('badges').doc(badge.id).set({
      ...badge,
      createdAt: Timestamp.now(),
      active: true,
    });
  }

  console.log(`   ✓ Created ${badges.length} badges`);
}

// Main execution
async function main() {
  console.log('🚀 PrepMint Firebase Data Population Script');
  console.log('==========================================\n');
  console.log(`📊 Configuration:`);
  console.log(`   - Schools: ${SCHOOLS.length}`);
  console.log(`   - Classes: ${CLASSES.join(', ')} (Sections: ${SECTIONS.join(', ')})`);
  console.log(`   - Students per section: ${STUDENTS_PER_SECTION}`);
  console.log(`   - Total students: ${SCHOOLS.length * CLASSES.length * SECTIONS.length * STUDENTS_PER_SECTION}`);
  console.log(`   - Subjects: ${SUBJECTS.length}`);
  console.log(`   - Total teachers: ${SCHOOLS.length * (SUBJECTS.length + CLASSES.length * SECTIONS.length)}\n`);

  try {
    // Clear existing data
    await clearExistingData();

    // Create data
    const institutionIds = await createInstitutions();
    const subjectIds = await createSubjects(institutionIds);
    const teachers = await createTeachers(institutionIds, subjectIds);
    const students = await createStudents(institutionIds);
    await createBadges();

    console.log('\n✅ Data population completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Institutions: ${institutionIds.length}`);
    console.log(`   - Subjects: ${Object.values(subjectIds).reduce((sum, arr) => sum + arr.length, 0)}`);
    console.log(`   - Teachers: ${Object.values(teachers).reduce((sum, t) => sum + Object.keys(t.subjectTeachers).length + Object.keys(t.classTeachers).length, 0)}`);
    console.log(`   - Students: ${Object.values(students).reduce((sum, arr) => sum + arr.length, 0)}`);
    console.log(`   - Badges: 6`);

    console.log('\n🔑 Login Credentials:');
    console.log('   Default Password for all users: Test@123');
    console.log('\n   Sample Teacher Login:');
    for (const institution of institutionIds) {
      const firstTeacher = Object.values(teachers[institution.id].subjectTeachers)[0];
      if (firstTeacher) {
        console.log(`   - ${firstTeacher.email}`);
        break;
      }
    }
    console.log('\n   Sample Student Login:');
    for (const institution of institutionIds) {
      if (students[institution.id].length > 0) {
        console.log(`   - ${students[institution.id][0].email}`);
        break;
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during data population:', error);
    process.exit(1);
  }
}

// Run the script
main();
