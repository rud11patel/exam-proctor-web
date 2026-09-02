import bcrypt from 'bcryptjs';
import { pool } from './config/database';
import { UserRepository } from './repositories/userRepository';
import { ExamRepository } from './repositories/examRepository';
import { AuditRepository } from './repositories/auditRepository';
import { deleteExam, getFacultyExams } from './controllers/examController';

async function runExamDeletionSuite() {
  console.log('🧪 ================================================================');
  console.log('🧪 RUNNING COMPLETE EXAMINATION DELETION TEST SUITE');
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

  const testExamIds: string[] = [];

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('TestPass@123', salt);

    // Teardown any leftover test accounts
    await pool.query("DELETE FROM users WHERE email LIKE 'deltest_%@testsuite.edu'");

    console.log('1. Setting up Test Users (Faculty A, Faculty B, Student, Admin)...');

    const facA = await UserRepository.createUserWithProfile({
      name: 'Faculty Alpha',
      email: 'deltest_fac_a@testsuite.edu',
      passwordHash: hash,
      role: 'FACULTY',
      university: 'MSU',
    });

    const facB = await UserRepository.createUserWithProfile({
      name: 'Faculty Beta',
      email: 'deltest_fac_b@testsuite.edu',
      passwordHash: hash,
      role: 'FACULTY',
      university: 'MSU',
    });

    const student = await UserRepository.createUserWithProfile({
      name: 'Candidate Test',
      email: 'deltest_student@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      university: 'MSU',
    });

    const admin = await UserRepository.createUserWithProfile({
      name: 'Admin Test',
      email: 'deltest_admin@testsuite.edu',
      passwordHash: hash,
      role: 'ADMIN',
    });

    // Create shared question
    const qRes = await pool.query(
      `INSERT INTO questions (question_text, question_type, subject, difficulty, marks, created_by)
       VALUES ('What is test question?', 'MCQ_SINGLE', 'CS', 'EASY', 2, $1) RETURNING id`,
      [facA.id]
    );
    const qId = qRes.rows[0].id;

    console.log('\n2. Testing Faculty Own Exam Deletion...');

    // Faculty A creates Exam 1
    const exam1 = await ExamRepository.createExam({
      title: 'Faculty A Exam 1',
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
      studentIds: [student.id],
      facultyUniversity: 'MSU',
    });
    testExamIds.push(exam1.id);

    // Faculty A calls deleteExam on Exam 1
    let status1 = 0;
    let body1: any = null;
    const mockRes1: any = {
      status(code: number) { status1 = code; return this; },
      json(payload: any) { body1 = payload; return this; },
    };

    await deleteExam(
      {
        params: { id: exam1.id },
        user: { ...facA, role: 'FACULTY' },
      } as any,
      mockRes1
    );

    assert(status1 === 200, 'Faculty A can delete their own exam (HTTP 200)');
    assert(body1?.data?.action === 'DELETED', 'Action is marked as DELETED in response');

    // Verify it is removed from database
    const checkDb1 = await ExamRepository.getExamById(exam1.id);
    assert(checkDb1 === null, 'Exam 1 is completely removed from database');

    console.log('\n3. Testing Cross-Faculty Deletion Prohibition (Ownership Security)...');

    // Faculty B creates Exam 2
    const exam2 = await ExamRepository.createExam({
      title: 'Faculty B Exam 2',
      subject: 'CS',
      duration: 30,
      maximumMarks: 20,
      passingMarks: 8,
      negativeMarking: 0,
      randomizeQuestions: false,
      randomizeOptions: false,
      maximumAttempts: 1,
      createdBy: facB.id,
      questionIds: [qId],
      studentIds: [student.id],
      facultyUniversity: 'MSU',
    });
    testExamIds.push(exam2.id);

    // Faculty A attempts to delete Faculty B's Exam 2
    let status2 = 0;
    let code2 = '';
    const mockRes2: any = {
      status(code: number) { status2 = code; return this; },
      json(payload: any) { code2 = payload.error?.code; return this; },
    };

    await deleteExam(
      {
        params: { id: exam2.id },
        user: { ...facA, role: 'FACULTY' }, // Faculty A!
      } as any,
      mockRes2
    );

    assert(status2 === 403 && code2 === 'FORBIDDEN', 'Faculty A CANNOT delete Faculty B exam (HTTP 403 FORBIDDEN)');

    // Verify Exam 2 is still intact in DB
    const checkDb2 = await ExamRepository.getExamById(exam2.id);
    assert(checkDb2 !== null, 'Faculty B exam remains intact in database');

    console.log('\n4. Testing Student Role Deletion Guard...');

    // Student attempts to call deleteExam
    let statusStudent = 0;
    let codeStudent = '';
    const mockResStudent: any = {
      status(code: number) { statusStudent = code; return this; },
      json(payload: any) { codeStudent = payload.error?.code; return this; },
    };

    // Simulate route middleware authorization check for STUDENT
    const { requireRole } = await import('./middleware/authMiddleware');
    let roleGuardPassed = false;
    const reqMockStudent = { user: { ...student, role: 'STUDENT' } } as any;
    const resMockStudent = {
      status(code: number) { statusStudent = code; return this; },
      json(payload: any) { codeStudent = payload.error?.code; return this; },
    } as any;
    const nextMock = () => { roleGuardPassed = true; };

    requireRole('FACULTY', 'ADMIN')(reqMockStudent, resMockStudent, nextMock);

    assert(
      statusStudent === 403 && codeStudent === 'FORBIDDEN' && !roleGuardPassed,
      'Student role blocked from deleteExam endpoint by authorization middleware (403 FORBIDDEN)'
    );

    console.log('\n5. Testing Admin Universal Deletion Privileges...');

    // Admin calls deleteExam on Faculty B's Exam 2
    let statusAdmin = 0;
    let bodyAdmin: any = null;
    const mockResAdmin: any = {
      status(code: number) { statusAdmin = code; return this; },
      json(payload: any) { bodyAdmin = payload; return this; },
    };

    await deleteExam(
      {
        params: { id: exam2.id },
        user: { ...admin, role: 'ADMIN' },
      } as any,
      mockResAdmin
    );

    assert(statusAdmin === 200, 'Admin can delete faculty exam (HTTP 200)');
    const checkDbAdmin = await ExamRepository.getExamById(exam2.id);
    assert(checkDbAdmin === null, 'Exam 2 removed from database by Admin');

    console.log('\n6. Testing Non-Existent Exam Deletion (404)...');

    let status404 = 0;
    let code404 = '';
    const mockRes404: any = {
      status(code: number) { status404 = code; return this; },
      json(payload: any) { code404 = payload.error?.code; return this; },
    };

    await deleteExam(
      {
        params: { id: '00000000-0000-0000-0000-000000000000' },
        user: { ...facA, role: 'FACULTY' },
      } as any,
      mockRes404
    );

    assert(status404 === 404 && code404 === 'NOT_FOUND', 'Deleting non-existent exam returns HTTP 404 NOT_FOUND');

    console.log('\n7. Testing Active In-Progress Exam Deletion Safeguard...');

    // Faculty A creates Exam 3
    const exam3 = await ExamRepository.createExam({
      title: 'Active In-Progress Exam 3',
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
      studentIds: [student.id],
      facultyUniversity: 'MSU',
    });
    testExamIds.push(exam3.id);

    // Student begins taking Exam 3 (attempt status IN_PROGRESS)
    const serverEnd = new Date(Date.now() + 30 * 60 * 1000);
    const attemptRes = await pool.query(
      `INSERT INTO exam_attempts (exam_id, student_id, attempt_number, server_end_time, status)
       VALUES ($1, $2, 1, $3, 'IN_PROGRESS') RETURNING id`,
      [exam3.id, student.id, serverEnd]
    );
    const attemptId = attemptRes.rows[0].id;

    // Faculty A attempts to delete Exam 3 while student is taking it
    let statusActive = 0;
    let codeActive = '';
    const mockResActive: any = {
      status(code: number) { statusActive = code; return this; },
      json(payload: any) { codeActive = payload.error?.code; return this; },
    };

    await deleteExam(
      {
        params: { id: exam3.id },
        user: { ...facA, role: 'FACULTY' },
      } as any,
      mockResActive
    );

    assert(
      statusActive === 409 && codeActive === 'CANNOT_DELETE_ACTIVE_EXAM',
      'Cannot delete active examination while student attempt is IN_PROGRESS (HTTP 409 CANNOT_DELETE_ACTIVE_EXAM)'
    );

    console.log('\n8. Testing Completed Exam Safe Archiving & Data Retention...');

    // Student finishes Exam 3 (attempt becomes SUBMITTED)
    await pool.query(
      `UPDATE exam_attempts 
       SET status = 'SUBMITTED', submitted_at = CURRENT_TIMESTAMP, total_score = 16, percentage = 80, is_passed = TRUE
       WHERE id = $1`,
      [attemptId]
    );

    // Faculty A deletes Exam 3 with completed student evaluations
    let statusArchived = 0;
    let bodyArchived: any = null;
    const mockResArchived: any = {
      status(code: number) { statusArchived = code; return this; },
      json(payload: any) { bodyArchived = payload; return this; },
    };

    await deleteExam(
      {
        params: { id: exam3.id },
        user: { ...facA, role: 'FACULTY' },
      } as any,
      mockResArchived
    );

    assert(statusArchived === 200, 'Completed exam deletion succeeds (HTTP 200)');
    assert(bodyArchived?.data?.action === 'ARCHIVED', 'Completed exam action is safely set to ARCHIVED');

    // Verify academic evaluation history is PRESERVED in DB
    const preservedAttempt = await pool.query('SELECT * FROM exam_attempts WHERE id = $1', [attemptId]);
    assert(preservedAttempt.rows.length === 1, 'Student attempt and grade evaluation record is preserved');

    const archivedExam = await pool.query('SELECT status FROM exams WHERE id = $1', [exam3.id]);
    assert(archivedExam.rows[0]?.status === 'ARCHIVED', 'Exam record transitioned to ARCHIVED status');

    // Verify archived exam is excluded from faculty active exam roster
    const facultyList = await ExamRepository.getExamsForFaculty(facA.id);
    const facultyExamIds = facultyList.map((e) => e.id);
    assert(!facultyExamIds.includes(exam3.id), 'Archived exam is excluded from faculty active examinations listing');

    console.log('\n9. Testing Audit Logging Verification...');

    const auditRes = await pool.query(
      "SELECT * FROM audit_logs WHERE action = 'EXAM_DELETED' AND actor_id = $1 ORDER BY created_at DESC",
      [facA.id]
    );
    assert(auditRes.rows.length >= 2, 'Audit logs recorded for exam deletion operations');
    const lastAudit = auditRes.rows[0];
    assert(lastAudit.actor_name === facA.name, 'Audit log contains actor name');
    assert(lastAudit.target_type === 'EXAM', 'Audit log target_type is EXAM');
    assert(lastAudit.metadata?.examId === exam3.id, 'Audit log metadata records examId');

    // Clean up test data
    console.log('\n10. Teardown test fixtures...');
    await pool.query('DELETE FROM exam_attempts WHERE exam_id = ANY($1)', [testExamIds]);
    await pool.query('DELETE FROM exam_assignments WHERE exam_id = ANY($1)', [testExamIds]);
    await pool.query('DELETE FROM exam_questions WHERE exam_id = ANY($1)', [testExamIds]);
    await pool.query('DELETE FROM exams WHERE id = ANY($1)', [testExamIds]);
    await pool.query('DELETE FROM questions WHERE id = $1', [qId]);
    await pool.query("DELETE FROM users WHERE email LIKE 'deltest_%@testsuite.edu'");

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

runExamDeletionSuite();
