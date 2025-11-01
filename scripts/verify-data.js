#!/usr/bin/env node

/**
 * PrepMint Firebase Data Verification Script
 * Verifies that all data was populated correctly
 */

require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');

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

async function verifyData() {
  console.log('\n🔍 Verifying Firebase Data...\n');

  // Check institutions
  const institutionsSnapshot = await db.collection('institutions').get();
  console.log(`✓ Institutions: ${institutionsSnapshot.size}`);
  institutionsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${data.name} (${data.location})`);
  });

  // Check subjects
  const subjectsSnapshot = await db.collection('subjects').get();
  console.log(`\n✓ Subjects: ${subjectsSnapshot.size}`);

  // Check users by role
  const usersSnapshot = await db.collection('users').get();
  const students = usersSnapshot.docs.filter(doc => doc.data().role === 'student');
  const teachers = usersSnapshot.docs.filter(doc => doc.data().role === 'teacher');
  const admins = usersSnapshot.docs.filter(doc => doc.data().role === 'admin');
  const devs = usersSnapshot.docs.filter(doc => doc.data().role === 'dev');

  console.log(`\n✓ Users: ${usersSnapshot.size}`);
  console.log(`  - Students: ${students.length}`);
  console.log(`  - Teachers: ${teachers.length}`);
  console.log(`  - Admins: ${admins.length}`);
  console.log(`  - Devs: ${devs.length}`);

  // Show dev users
  if (devs.length > 0) {
    console.log('\n👨‍💻 Dev Users:');
    devs.forEach(dev => {
      const data = dev.data();
      console.log(`  - ${data.displayName} (${data.email})`);
    });
  }

  // Check badges
  const badgesSnapshot = await db.collection('badges').get();
  console.log(`\n✓ Badges: ${badgesSnapshot.size}`);
  badgesSnapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${data.name} (${data.iconUrl})`);
  });

  // Sample students by school
  console.log('\n📚 Sample Students:');
  const institutionDocs = institutionsSnapshot.docs;
  for (const instDoc of institutionDocs.slice(0, 2)) {
    const instData = instDoc.data();
    const instStudents = students.filter(s => s.data().institutionId === instDoc.id);
    console.log(`\n  ${instData.name}:`);

    // Group by class
    const classes = {};
    instStudents.forEach(s => {
      const data = s.data();
      const key = `Class ${data.class}-${data.section}`;
      if (!classes[key]) classes[key] = [];
      classes[key].push(data);
    });

    Object.keys(classes).sort().slice(0, 3).forEach(className => {
      console.log(`    ${className}: ${classes[className].length} students`);
      classes[className].slice(0, 2).forEach(student => {
        console.log(`      - ${student.displayName} (${student.rollNumber})`);
      });
    });
  }

  // Sample teachers
  console.log('\n👨‍🏫 Sample Teachers:');
  for (const instDoc of institutionDocs.slice(0, 2)) {
    const instData = instDoc.data();
    const instTeachers = teachers.filter(t => t.data().institutionId === instDoc.id);
    console.log(`\n  ${instData.name}: ${instTeachers.length} teachers`);

    const subjectTeachers = instTeachers.filter(t => t.data().subjects);
    const classTeachers = instTeachers.filter(t => t.data().classTeacher);

    console.log(`    Subject Teachers: ${subjectTeachers.length}`);
    subjectTeachers.slice(0, 3).forEach(teacher => {
      const data = teacher.data();
      console.log(`      - ${data.displayName} (${data.subjectNames?.join(', ')})`);
    });

    console.log(`    Class Teachers: ${classTeachers.length}`);
    classTeachers.slice(0, 3).forEach(teacher => {
      const data = teacher.data();
      console.log(`      - ${data.displayName} (${data.className})`);
    });
  }

  console.log('\n✅ Data verification complete!\n');
  process.exit(0);
}

verifyData().catch(error => {
  console.error('\n❌ Error during verification:', error);
  process.exit(1);
});
