# PrepMint Data Population Scripts

This directory contains scripts for populating Firebase with mock data for development and testing.

## Prerequisites

1. **Firebase Admin SDK credentials** must be configured in `.env.local`:
   ```bash
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

2. **Node.js 18+** installed

3. **firebase-admin** package installed (already in dependencies)

## Scripts

### `populate-firebase-data.js`

Populates Firebase with comprehensive mock data for two schools.

**What it creates:**

- **2 Schools**:
  - Nandi School (Bellary, Karnataka)
  - Vidya Vikas School (Bellary, Karnataka)

- **120 Students total** (60 per school):
  - Classes: 5, 6, 7, 8
  - Sections: A, B, C (3 sections per class)
  - 5 students per section
  - Realistic Indian names
  - Email format: `firstname.lastname.studentXXX@schoolname.edu.in`

- **Teachers**:
  - 6 subject teachers per school (Math, Science, English, Social Studies, Hindi, Kannada)
  - 12 class teachers per school (one for each class-section combination)
  - Total: 36 teachers (18 per school)
  - Email format: `firstname.lastname.teacher@schoolname.edu.in`

- **6 Subjects per school**:
  - Mathematics (MATH)
  - Science (SCI)
  - English (ENG)
  - Social Studies (SST)
  - Hindi (HIN)
  - Kannada (KAN)

- **6 Badges**:
  - First Upload, Quick Learner, Perfect Score, Week Streak, Century, Achiever

**Login Credentials:**
- Default password for all users: `Test@123`

## Usage

### Step 1: Ensure environment variables are set

Make sure your `.env.local` file has Firebase Admin SDK credentials:

```bash
# Check if .env.local exists
cat .env.local | grep FIREBASE_ADMIN
```

### Step 2: Run the population script

```bash
npm run populate-data
```

**⚠️ WARNING**: This script will **clear all existing data** from the following collections:
- institutions
- users
- subjects
- tests
- evaluations
- activity
- notifications
- jobQueues
- badges
- leaderboards

**Note**: Firebase Auth users are NOT automatically deleted. You may need to manually clean them up from Firebase Console → Authentication → Users.

### Step 3: Verify data

After running the script, verify the data in Firebase Console:

1. **Firestore Database**:
   - institutions: 2 documents
   - users: ~156 documents (120 students + 36 teachers)
   - subjects: 12 documents (6 per school)
   - badges: 6 documents

2. **Authentication**:
   - Check that users were created with verified emails
   - Custom claims should be set (role, institutionId)

## Sample Login Credentials

After running the script, you'll see sample credentials in the output. Here are some examples:

**Teacher Login** (Math teacher at Nandi School):
```
Email: (shown in script output)
Password: Test@123
```

**Student Login** (Class 5-A student at Nandi School):
```
Email: (shown in script output)
Password: Test@123
```

## Script Output Example

```
🚀 PrepMint Firebase Data Population Script
==========================================

📊 Configuration:
   - Schools: 2
   - Classes: 5, 6, 7, 8 (Sections: A, B, C)
   - Students per section: 5
   - Total students: 120
   - Subjects: 6
   - Total teachers: 36

🗑️  Clearing existing data...
   ✓ Cleared 0 documents from institutions
   ✓ Cleared 0 documents from users
   ...

🏫 Creating institutions...
   ✓ Created institution: Nandi School (abc123...)
   ✓ Created institution: Vidya Vikas School (def456...)

📚 Creating subjects...
   ✓ Created 6 subjects for Nandi School
   ✓ Created 6 subjects for Vidya Vikas School

👨‍🏫 Creating teachers...
   ✓ Created teacher: Ramesh Kumar (Mathematics)
   ...

👨‍🎓 Creating students...
   ✓ Created 10 students...
   ✓ Created 20 students...
   ...

🏆 Creating badges...
   ✓ Created 6 badges

✅ Data population completed successfully!

📝 Summary:
   - Institutions: 2
   - Subjects: 12
   - Teachers: 36
   - Students: 120
   - Badges: 6

🔑 Login Credentials:
   Default Password for all users: Test@123

   Sample Teacher Login:
   - ramesh.kumar.teacher@nandischool.edu.in

   Sample Student Login:
   - aarav.sharma.student5A01@nandischool.edu.in
```

## Troubleshooting

### Error: "Failed to authenticate"
- Check that your Firebase Admin SDK credentials are correct in `.env.local`
- Ensure the private key is properly formatted with `\n` characters

### Error: "Email already exists"
- The script will skip users with duplicate emails
- If you need to re-run, manually delete users from Firebase Console first

### Error: "Permission denied"
- Ensure your service account has the necessary permissions:
  - Firebase Admin SDK Admin Service Agent
  - Cloud Datastore User (for Firestore)

### No output or script hangs
- Check your internet connection
- Verify Firebase project is active
- Check Firebase Console for any quota limits

## Customization

To customize the data generation, edit `populate-firebase-data.js`:

- **Change school names**: Edit the `SCHOOLS` array
- **Adjust class range**: Modify the `CLASSES` array
- **Change sections**: Update the `SECTIONS` array
- **More/fewer students**: Change `STUDENTS_PER_SECTION`
- **Add subjects**: Extend the `SUBJECTS` array
- **Modify names**: Update name arrays (`TEACHER_FIRST_NAMES`, `STUDENT_FIRST_NAMES`, etc.)

## Data Structure

### Institution Document
```javascript
{
  name: "Nandi School",
  location: "Bellary",
  cityId: "bellary-karnataka",
  address: "MG Road, Bellary, Karnataka 583101",
  principal: "Dr. Raghavendra Rao",
  establishedYear: 2010,
  totalStudents: 60,
  totalTeachers: 18,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  active: true
}
```

### User Document (Student)
```javascript
{
  uid: "firebase-auth-uid",
  email: "aarav.sharma.student5A01@nandischool.edu.in",
  displayName: "Aarav Sharma",
  role: "student",
  institutionId: "institution-id",
  class: 5,
  section: "A",
  rollNumber: "5A01",
  className: "Class 5-A",
  xp: 250,
  level: 3,
  badges: [],
  streak: 15,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp,
  active: true
}
```

### User Document (Teacher)
```javascript
{
  uid: "firebase-auth-uid",
  email: "ramesh.kumar.teacher@nandischool.edu.in",
  displayName: "Ramesh Kumar",
  role: "teacher",
  institutionId: "institution-id",
  subjects: ["subject-id"],
  subjectNames: ["Mathematics"],
  // OR for class teachers:
  classTeacher: "5-A",
  className: "Class 5-A",
  xp: 350,
  level: 4,
  badges: [],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp,
  active: true
}
```

### Subject Document
```javascript
{
  name: "Mathematics",
  code: "MATH",
  type: "core",
  institutionId: "institution-id",
  description: "Mathematics curriculum for classes 5-8",
  createdAt: Timestamp,
  active: true
}
```

## Next Steps

After populating the data:

1. **Login as different users** to test role-based access
2. **Create tests** as a teacher
3. **Submit evaluations** as students
4. **Review analytics** in admin/institution dashboards
5. **Test gamification** features (XP, badges, streaks)

## Support

For issues or questions about the data population scripts, contact: teja.kg@prepmint.in
