#!/usr/bin/env node

/**
 * Create Dev User Script
 * Creates a developer user with full admin access
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

async function createDevUser() {
  console.log('\n🔧 Creating Dev User...\n');

  const email = 'teja.kg@prepmint.in';
  const password = 'Test@123'; // Default password, should be changed after first login
  const displayName = 'Teja KG';

  try {
    // Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`✓ User already exists in Firebase Auth: ${email}`);
      console.log(`  UID: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create Firebase Auth user
        userRecord = await auth.createUser({
          email,
          password,
          displayName,
          emailVerified: true,
        });
        console.log(`✓ Created Firebase Auth user: ${email}`);
        console.log(`  UID: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // Set custom claims for dev role
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'dev',
      email,
    });
    console.log(`✓ Set custom claims: role=dev`);

    // Check if Firestore document exists
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      // Update existing document
      await userDocRef.update({
        role: 'dev',
        displayName,
        email,
        updatedAt: Timestamp.now(),
      });
      console.log(`✓ Updated Firestore user document`);
    } else {
      // Create Firestore user document
      await userDocRef.set({
        uid: userRecord.uid,
        email,
        displayName,
        role: 'dev',
        xp: 0,
        level: 1,
        badges: [],
        photoURL: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        active: true,
      });
      console.log(`✓ Created Firestore user document`);
    }

    console.log('\n✅ Dev user created successfully!\n');
    console.log('📝 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: dev (full admin access)`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    // Verify the user
    const updatedUser = await auth.getUser(userRecord.uid);
    const claims = updatedUser.customClaims;
    console.log('🔍 Verification:');
    console.log(`   ✓ Email verified: ${updatedUser.emailVerified}`);
    console.log(`   ✓ Custom claims role: ${claims?.role}`);

    const firestoreDoc = await userDocRef.get();
    const firestoreData = firestoreDoc.data();
    console.log(`   ✓ Firestore role: ${firestoreData?.role}`);
    console.log(`   ✓ Display name: ${firestoreData?.displayName}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating dev user:', error);
    process.exit(1);
  }
}

createDevUser();
