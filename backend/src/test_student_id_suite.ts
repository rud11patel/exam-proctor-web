import bcrypt from 'bcryptjs';
import { pool } from './config/database';
import { UserRepository } from './repositories/userRepository';
import { ExamRepository } from './repositories/examRepository';
import { register, login, getCurrentUser } from './controllers/authController';
import { getStudents } from './controllers/userController';
import { createExam } from './controllers/examController';
import './middleware/authMiddleware';

async function runStudentIdSuite() {
  console.log('🧪 ================================================================');
  console.log('🧪 RUNNING UNIVERSITY-SCOPED UNIQUE STUDENT ID TEST SUITE');
  console.log('🧪 ================================================================\n');

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
    const hash = await bcrypt.hash('TestPass@123', salt);

    // Clean up previous test artifacts
    await pool.query("DELETE FROM users WHERE email LIKE 'testid_%@testsuite.edu'");
    await pool.query("DELETE FROM university_student_sequences WHERE university_normalized IN ('abc university', 'xyz university', 'concurrent university')");

    console.log('1. Testing University-Scoped Sequential Student ID Generation...');

    // Student A1 at "ABC University"
    const stuA1 = await UserRepository.createUserWithProfile({
      name: 'Alice ABC',
      email: 'testid_stu_a1@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      university: 'ABC University',
    });
    assert(stuA1.student_id === 'ABC-000001', 'First student at ABC University receives ABC-000001', `Received: ${stuA1.student_id}`);

    // Student A2 at "ABC University"
    const stuA2 = await UserRepository.createUserWithProfile({
      name: 'Bob ABC',
      email: 'testid_stu_a2@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      university: 'ABC University',
    });
    assert(stuA2.student_id === 'ABC-000002', 'Second student at ABC University receives ABC-000002', `Received: ${stuA2.student_id}`);

    // Student B1 at "XYZ University" (Sequence must restart at 000001 for this university)
    const stuB1 = await UserRepository.createUserWithProfile({
      name: 'Charlie XYZ',
      email: 'testid_stu_b1@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      university: 'XYZ University',
    });
    assert(stuB1.student_id === 'XYZ-000001', 'First student at XYZ University receives XYZ-000001 (scoped to university)', `Received: ${stuB1.student_id}`);

    // Student B2 at "XYZ University"
    const stuB2 = await UserRepository.createUserWithProfile({
      name: 'Dana XYZ',
      email: 'testid_stu_b2@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      university: 'XYZ University',
    });
    assert(stuB2.student_id === 'XYZ-000002', 'Second student at XYZ University receives XYZ-000002', `Received: ${stuB2.student_id}`);

    console.log('\n2. Testing Case and Whitespace Normalization in Sequence Counter...');

    // Student A3 registering with lowercase and spaces "  abc university  "
    const stuA3 = await UserRepository.createUserWithProfile({
      name: 'Eve ABC Lower',
      email: 'testid_stu_a3@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      university: '  abc university  ',
    });
    assert(stuA3.student_id === 'ABC-000003', 'Student registered with "  abc university  " continues ABC sequence to ABC-000003', `Received: ${stuA3.student_id}`);

    // Student A4 registering with uppercase "ABC UNIVERSITY"
    const stuA4 = await UserRepository.createUserWithProfile({
      name: 'Frank ABC Upper',
      email: 'testid_stu_a4@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      university: 'ABC UNIVERSITY',
    });
    assert(stuA4.student_id === 'ABC-000004', 'Student registered with "ABC UNIVERSITY" continues ABC sequence to ABC-000004', `Received: ${stuA4.student_id}`);

    console.log('\n3. Testing Concurrency Safety (Simultaneous Registrations)...');

    // Launch 10 simultaneous student registrations at "Concurrent University"
    const concurrentRegistrations = Array.from({ length: 10 }, (_, i) => {
      return UserRepository.createUserWithProfile({
        name: `Concurrent Student ${i + 1}`,
        email: `testid_concurrent_${i + 1}@testsuite.edu`,
        passwordHash: hash,
        role: 'STUDENT',
        university: 'Concurrent University',
      });
    });

    const concurrentResults = await Promise.all(concurrentRegistrations);
    const concurrentIds = concurrentResults.map((r) => r.student_id!);
    const uniqueIds = new Set(concurrentIds);

    assert(uniqueIds.size === 10, '10 simultaneous registrations produced 10 UNIQUE student IDs (no duplicates)', `Unique count: ${uniqueIds.size}`);
    
    const allMatchPrefix = concurrentIds.every((id) => id.startsWith('CONCURRENT-'));
    assert(allMatchPrefix, 'All concurrent registrations have correct prefix CONCURRENT-');

    // Verify sequences span 000001 to 000010
    const sequenceNumbers = concurrentIds.map((id) => parseInt(id.split('-')[1], 10)).sort((a, b) => a - b);
    const isContiguous = sequenceNumbers.every((num, idx) => num === idx + 1);
    assert(isContiguous, 'All 10 generated student IDs form a strictly contiguous sequence [1..10]');

    console.log('\n4. Testing Registration API Security (Client-Submitted ID Ignored)...');

    let apiResStatus = 0;
    let apiResBody: any = null;
    const mockResRegister: any = {
      status(code: number) {
        apiResStatus = code;
        return this;
      },
      json(payload: any) {
        apiResBody = payload;
        return this;
      },
    };

    // Client attempts to spoof / pick its own studentId "HACKED-999999"
    await register(
      {
        body: {
          name: 'Mallory Malicious',
          email: 'testid_mallory@testsuite.edu',
          password: 'Password@123',
          role: 'STUDENT',
          university: 'ABC University',
          studentId: 'HACKED-999999',
          student_id: 'HACKED-999999',
        },
      } as any,
      mockResRegister
    );

    assert(apiResStatus === 201, 'Registration with spoofed studentId succeeds with 201');
    assert(apiResBody?.data?.user?.studentId === 'ABC-000005', 'Client studentId was IGNORED; server assigned ABC-000005', `Received: ${apiResBody?.data?.user?.studentId}`);
    assert(apiResBody?.data?.user?.university === 'ABC University', 'Returned user profile contains university');

    console.log('\n5. Testing Registration API Validation (Missing University)...');

    let missingUniStatus = 0;
    let missingUniCode = '';
    const mockResMissingUni: any = {
      status(code: number) {
        missingUniStatus = code;
        return this;
      },
      json(payload: any) {
        missingUniCode = payload.error?.code;
        return this;
      },
    };

    await register(
      {
        body: {
          name: 'No Uni Student',
          email: 'testid_nouni@testsuite.edu',
          password: 'Password@123',
          role: 'STUDENT',
          university: '   ',
        },
      } as any,
      mockResMissingUni
    );

    assert(missingUniStatus === 400 && missingUniCode === 'VALIDATION_ERROR', 'Student registration without university rejected with 400 VALIDATION_ERROR');

    console.log('\n6. Testing Login & Profile Response Stability (Student ID Persistence)...');

    let loginResBody: any = null;
    const mockResLogin: any = {
      status() { return this; },
      json(payload: any) {
        loginResBody = payload;
        return this;
      },
    };

    await login(
      {
        body: {
          email: 'testid_stu_a1@testsuite.edu',
          password: 'TestPass@123',
          role: 'STUDENT',
        },
      } as any,
      mockResLogin
    );

    assert(loginResBody?.data?.user?.studentId === 'ABC-000001', 'Login response preserves stable studentId ABC-000001');
    assert(loginResBody?.data?.user?.university === 'ABC University', 'Login response returns university');

    let meResBody: any = null;
    const mockResMe: any = {
      status() { return this; },
      json(payload: any) {
        meResBody = payload;
        return this;
      },
    };

    await getCurrentUser(
      {
        user: { id: stuA1.id, role: 'STUDENT' },
      } as any,
      mockResMe
    );

    assert(meResBody?.data?.user?.studentId === 'ABC-000001', 'getCurrentUser response preserves stable studentId ABC-000001');

    console.log('\n7. Testing Faculty Student Roster & Exam Assignment Isolation with Student IDs...');

    // Create Faculty at ABC University
    const facABC = await UserRepository.createUserWithProfile({
      name: 'Prof. ABC',
      email: 'testid_fac_abc@testsuite.edu',
      passwordHash: hash,
      role: 'FACULTY',
      university: 'ABC University',
    });

    let facultyRoster: any[] = [];
    const mockResGetStudents: any = {
      status() { return this; },
      json(payload: any) {
        facultyRoster = payload.data?.users || [];
        return this;
      },
    };

    await getStudents(
      {
        user: { id: facABC.id, role: 'FACULTY' },
      } as any,
      mockResGetStudents
    );

    const rosterIds = facultyRoster.map((s) => s.studentId);
    assert(rosterIds.includes('ABC-000001'), 'Faculty ABC roster includes student with studentId ABC-000001');
    assert(!rosterIds.includes('XYZ-000001'), 'Faculty ABC roster EXCLUDES student from XYZ University');

    // Faculty ABC attempts to assign Student B1 (XYZ University) to an exam
    // Create a question owned by facABC
    const qRes = await pool.query(
      `INSERT INTO questions (question_text, question_type, subject, difficulty, marks, created_by)
       VALUES ('What is a unique student ID?', 'MCQ_SINGLE', 'CS', 'EASY', 2, $1) RETURNING id`,
      [facABC.id]
    );
    const qId = qRes.rows[0].id;

    let examAssignmentStatus = 0;
    let examAssignmentCode = '';
    const mockResExam: any = {
      status(code: number) {
        examAssignmentStatus = code;
        return this;
      },
      json(payload: any) {
        examAssignmentCode = payload.error?.code;
        return this;
      },
    };

    await createExam(
      {
        user: { ...facABC, role: 'FACULTY' },
        body: {
          title: 'ABC Midterm Exam',
          subject: 'CS',
          duration: 45,
          questionIds: [qId],
          studentIds: [stuB1.id], // Student from XYZ University!
        },
      } as any,
      mockResExam
    );

    assert(
      examAssignmentStatus === 403 && examAssignmentCode === 'CROSS_UNIVERSITY_ASSIGNMENT_FORBIDDEN',
      'Faculty ABC cannot assign Student B1 (XYZ-000001) to an exam - rejected with 403'
    );

    // Clean up test fixtures
    await pool.query("DELETE FROM users WHERE email LIKE 'testid_%@testsuite.edu'");
    await pool.query("DELETE FROM university_student_sequences WHERE university_normalized IN ('abc university', 'xyz university', 'concurrent university')");

    console.log('\n================================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

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

runStudentIdSuite();
