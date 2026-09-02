import bcrypt from 'bcryptjs';
import { pool } from './config/database';
import { UserRepository } from './repositories/userRepository';
import { ExamRepository } from './repositories/examRepository';
import { generateToken } from './utils/jwt';
import './middleware/authMiddleware';

async function runTestSuite() {
  console.log('🧪 ========================================================');
  console.log('🧪 RUNNING UNIVERSITY RESTRICTION VERIFICATION TEST SUITE');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('TestPassword@123', salt);

    // Clean up any previous test accounts
    await pool.query("DELETE FROM users WHERE email LIKE 'test_%@testsuite.edu'");

    console.log('1. Setting up Test Users in PostgreSQL...');

    // Faculty A: "Maharaja Sayajirao University"
    const facA = await UserRepository.createUserWithProfile({
      name: 'Faculty Alpha',
      email: 'test_fac_a@testsuite.edu',
      passwordHash: hash,
      role: 'FACULTY',
      department: 'Computer Science',
      university: 'Maharaja Sayajirao University',
    });

    // Faculty B: "Parul University"
    const facB = await UserRepository.createUserWithProfile({
      name: 'Faculty Beta',
      email: 'test_fac_b@testsuite.edu',
      passwordHash: hash,
      role: 'FACULTY',
      department: 'Information Technology',
      university: 'Parul University',
    });

    // Faculty C: Whitespace-only university "   "
    const facC = await UserRepository.createUserWithProfile({
      name: 'Faculty Gamma',
      email: 'test_fac_c@testsuite.edu',
      passwordHash: hash,
      role: 'FACULTY',
      department: 'Electronics',
      university: '   ',
    });

    // Student A1: Exact casing "Maharaja Sayajirao University"
    const stuA1 = await UserRepository.createUserWithProfile({
      name: 'Student MSU Exact',
      email: 'test_stu_a1@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      rollNumber: 'MSU-001',
      university: 'Maharaja Sayajirao University',
    });

    // Student A2: Lowercase "maharaja sayajirao university"
    const stuA2 = await UserRepository.createUserWithProfile({
      name: 'Student MSU Lower',
      email: 'test_stu_a2@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      rollNumber: 'MSU-002',
      university: 'maharaja sayajirao university',
    });

    // Student A3: Uppercase with leading/trailing spaces "  MAHARAJA SAYAJIRAO UNIVERSITY  "
    const stuA3 = await UserRepository.createUserWithProfile({
      name: 'Student MSU Upper Trim',
      email: 'test_stu_a3@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      rollNumber: 'MSU-003',
      university: '  MAHARAJA SAYAJIRAO UNIVERSITY  ',
    });

    // Student B1: "Parul University"
    const stuB1 = await UserRepository.createUserWithProfile({
      name: 'Student Parul',
      email: 'test_stu_b1@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      rollNumber: 'PU-001',
      university: 'Parul University',
    });

    // Student C1: NULL university
    const stuC1 = await UserRepository.createUserWithProfile({
      name: 'Student No Univ',
      email: 'test_stu_c1@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      rollNumber: 'NO-UNIV',
    });

    // Create a question owned by Faculty A
    const qRes = await pool.query(
      `INSERT INTO questions (question_text, question_type, subject, difficulty, marks, created_by)
       VALUES ('What is O(1)?', 'MCQ_SINGLE', 'CS', 'EASY', 2, $1) RETURNING id`,
      [facA.id]
    );
    const qId = qRes.rows[0].id;

    console.log('✅ Test fixture created successfully.\n');

    console.log('2. Testing Student List Scoping by University...');

    // Faculty A querying students
    const msuStudents = await UserRepository.getStudentsByUniversity(facA.university!);
    const msuIds = msuStudents.map((s) => s.id);

    assert(msuIds.includes(stuA1.id), 'Faculty A can see Student A1 (exact match)');
    assert(msuIds.includes(stuA2.id), 'Faculty A can see Student A2 (case-insensitive lowercase match)');
    assert(msuIds.includes(stuA3.id), 'Faculty A can see Student A3 (whitespace-tolerant uppercase match)');
    assert(!msuIds.includes(stuB1.id), 'Faculty A CANNOT see Student B1 (different university - Parul)');
    assert(!msuIds.includes(stuC1.id), 'Faculty A CANNOT see Student C1 (NULL university)');

    // Faculty B querying students
    const parulStudents = await UserRepository.getStudentsByUniversity(facB.university!);
    const parulIds = parulStudents.map((s) => s.id);

    assert(parulIds.includes(stuB1.id), 'Faculty B can see Student B1 (Parul University)');
    assert(!parulIds.includes(stuA1.id), 'Faculty B CANNOT see Student A1 (Maharaja Sayajirao University)');
    assert(!parulIds.includes(stuA2.id), 'Faculty B CANNOT see Student A2 (Maharaja Sayajirao University)');
    assert(!parulIds.includes(stuC1.id), 'Faculty B CANNOT see Student C1 (NULL university)');

    console.log('\n3. Testing Capitalization and Whitespace Invariance...');
    // Querying with leading/trailing spaces in faculty university
    const msuFromSpacedFaculty = await UserRepository.getStudentsByUniversity('   Maharaja Sayajirao University   ');
    const spacedIds = msuFromSpacedFaculty.map((s) => s.id);
    assert(spacedIds.includes(stuA1.id) && spacedIds.includes(stuA2.id) && spacedIds.includes(stuA3.id),
      'Faculty with leading/trailing spaces matches students regardless of student capitalization/whitespace');

    // Querying with ALL CAPS in faculty university
    const msuFromCapsFaculty = await UserRepository.getStudentsByUniversity('MAHARAJA SAYAJIRAO UNIVERSITY');
    const capsIds = msuFromCapsFaculty.map((s) => s.id);
    assert(capsIds.includes(stuA1.id) && capsIds.includes(stuA2.id) && capsIds.includes(stuA3.id),
      'Faculty in ALL CAPS matches students regardless of student capitalization/whitespace');

    console.log('\n4. Testing Unconfigured / Missing Faculty University...');
    const facCProfile = await UserRepository.getUserProfile(facC.id);
    const facCUniv = facCProfile?.university?.trim();
    assert(!facCUniv, 'Faculty with whitespace university resolves to empty/unconfigured');

    const emptyUnivStudents = await UserRepository.getStudentsByUniversity(facCUniv || '');
    assert(emptyUnivStudents.length === 0, 'Unconfigured/empty university yields 0 students (safe default)');

    console.log('\n5. Testing Exam Assignment Validation (ID-Based Bypass Prevention)...');
    
    // Case 5.1: Same university assignment
    const validAssignment = await UserRepository.validateStudentsBelongToUniversity(
      [stuA1.id, stuA2.id, stuA3.id],
      facA.university!
    );
    assert(validAssignment.allValid === true, 'Faculty A assigning same-university students succeeds');

    // Case 5.2: Cross-university assignment attempt
    const crossAssignment = await UserRepository.validateStudentsBelongToUniversity(
      [stuB1.id],
      facA.university!
    );
    assert(crossAssignment.allValid === false, 'Faculty A assigning cross-university Student B1 is REJECTED');
    assert(crossAssignment.invalidStudentIds.includes(stuB1.id), 'Invalid student ID correctly identified');

    // Case 5.3: Mixed assignment attempt (A1 and B1)
    const mixedAssignment = await UserRepository.validateStudentsBelongToUniversity(
      [stuA1.id, stuB1.id],
      facA.university!
    );
    assert(mixedAssignment.allValid === false, 'Mixed assignment containing cross-university student is REJECTED');
    assert(mixedAssignment.invalidStudentIds.includes(stuB1.id), 'Cross-university student caught in mixed batch');

    // Case 5.4: Student with NULL university assignment attempt
    const nullUnivAssignment = await UserRepository.validateStudentsBelongToUniversity(
      [stuC1.id],
      facA.university!
    );
    assert(nullUnivAssignment.allValid === false, 'Assigning student with NULL university is REJECTED');

    console.log('\n6. Testing ExamRepository Auto-Assignment Scoping...');
    // Creating exam without studentIds when facultyUniversity is supplied
    const autoExam = await ExamRepository.createExam({
      title: 'MSU Midterm',
      subject: 'CS',
      duration: 30,
      maximumMarks: 20,
      passingMarks: 8,
      negativeMarking: 0,
      randomizeQuestions: false,
      randomizeOptions: false,
      maximumAttempts: 1,
      createdBy: facA.id,
      questionIds: [qId],
      facultyUniversity: facA.university!,
    });

    const assignedRows = await pool.query(
      'SELECT student_id FROM exam_assignments WHERE exam_id = $1',
      [autoExam.id]
    );
    const assignedIds = assignedRows.rows.map((r) => r.student_id);

    assert(assignedIds.includes(stuA1.id), 'Auto-assignment includes MSU student A1');
    assert(assignedIds.includes(stuA2.id), 'Auto-assignment includes MSU student A2');
    assert(assignedIds.includes(stuA3.id), 'Auto-assignment includes MSU student A3');
    assert(!assignedIds.includes(stuB1.id), 'Auto-assignment strictly EXCLUDES Parul student B1');
    assert(!assignedIds.includes(stuC1.id), 'Auto-assignment strictly EXCLUDES NULL university student C1');

    console.log('\n7. Testing HTTP Controller Endpoints (Direct Simulated Calls)...');
    // Test userController getStudents logic with Mock Req/Res
    const { getStudents } = await import('./controllers/userController');
    const { createExam } = await import('./controllers/examController');

    // Test 7.1: Faculty C with unconfigured university calling getStudents
    let resErrorStatus = 0;
    let resErrorCode = '';
    const mockResFacC: any = {
      status(code: number) {
        resErrorStatus = code;
        return this;
      },
      json(payload: any) {
        resErrorCode = payload.error?.code;
        return this;
      },
    };
    await getStudents({ user: { ...facC, role: 'FACULTY' } } as any, mockResFacC);
    assert(
      resErrorStatus === 400 && resErrorCode === 'UNIVERSITY_NOT_CONFIGURED',
      'Faculty without university receives 400 UNIVERSITY_NOT_CONFIGURED error'
    );

    // Test 7.2: Faculty A trying to create exam with cross-university Student B1
    let createExamStatus = 0;
    let createExamCode = '';
    const mockResCreateExam: any = {
      status(code: number) {
        createExamStatus = code;
        return this;
      },
      json(payload: any) {
        createExamCode = payload.error?.code;
        return this;
      },
    };
    await createExam(
      {
        user: { ...facA, role: 'FACULTY' },
        body: {
          title: 'Malicious Cross-University Assignment',
          subject: 'CS',
          duration: 30,
          questionIds: [qId],
          studentIds: [stuB1.id],
        },
      } as any,
      mockResCreateExam
    );
    assert(
      createExamStatus === 403 && createExamCode === 'CROSS_UNIVERSITY_ASSIGNMENT_FORBIDDEN',
      'createExam rejects cross-university student ID with 403 CROSS_UNIVERSITY_ASSIGNMENT_FORBIDDEN'
    );

    // Test 7.3: Faculty A creating exam with valid student IDs
    let successStatus = 0;
    let createdExamId = '';
    const mockResSuccess: any = {
      status(code: number) {
        successStatus = code;
        return this;
      },
      json(payload: any) {
        createdExamId = payload.data?.exam?.id;
        return this;
      },
    };
    await createExam(
      {
        user: { ...facA, role: 'FACULTY' },
        body: {
          title: 'Authorized Same-University Exam',
          subject: 'CS',
          duration: 30,
          questionIds: [qId],
          studentIds: [stuA1.id, stuA2.id],
        },
      } as any,
      mockResSuccess
    );
    assert(
      successStatus === 201 && !!createdExamId,
      'createExam succeeds with 201 when all students belong to faculty university'
    );

    // Clean up test fixtures and test-created exams
    await pool.query("DELETE FROM exam_assignments WHERE exam_id IN ($1, $2)", [autoExam.id, createdExamId]);
    await pool.query("DELETE FROM exam_questions WHERE exam_id IN ($1, $2)", [autoExam.id, createdExamId]);
    await pool.query("DELETE FROM exams WHERE id IN ($1, $2)", [autoExam.id, createdExamId]);
    await pool.query("DELETE FROM users WHERE email LIKE 'test_%@testsuite.edu'");

    console.log('\n========================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTestSuite();
