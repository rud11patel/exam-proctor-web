import bcrypt from 'bcryptjs';
import { pool } from './config/database';
import { UserRepository } from './repositories/userRepository';
import { ExamRepository } from './repositories/examRepository';
import { AttemptRepository } from './repositories/attemptRepository';
import { ResultRepository } from './repositories/resultRepository';
import { ProctoringRepository } from './repositories/proctoringRepository';

async function runStudentLifecycleSuite() {
  console.log('🧪 ================================================================');
  console.log('🧪 RUNNING STUDENT RESULTS, ATTEMPTS & LIFECYCLE TEST SUITE');
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
    await pool.query("DELETE FROM users WHERE email LIKE 'lifetest_%@testsuite.edu'");

    console.log('1. Setting up Test Faculty and Students...');

    const faculty = await UserRepository.createUserWithProfile({
      name: 'Faculty Tester',
      email: 'lifetest_faculty@testsuite.edu',
      passwordHash: hash,
      role: 'FACULTY',
      university: 'Maharaja Sayajirao University',
    });

    const studentA = await UserRepository.createUserWithProfile({
      name: 'Student Candidate A',
      email: 'lifetest_student_a@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      university: 'Maharaja Sayajirao University',
    });

    const studentB = await UserRepository.createUserWithProfile({
      name: 'Student Candidate B',
      email: 'lifetest_student_b@testsuite.edu',
      passwordHash: hash,
      role: 'STUDENT',
      university: 'Maharaja Sayajirao University',
    });

    // Create 2 test questions
    const q1Res = await pool.query(
      `INSERT INTO questions (question_text, question_type, subject, difficulty, marks, created_by)
       VALUES ('What is O(1) in time complexity?', 'MCQ_SINGLE', 'Computer Science', 'EASY', 50, $1) RETURNING id`,
      [faculty.id]
    );
    const q1Id = q1Res.rows[0].id;
    const opt1Res = await pool.query(
      `INSERT INTO question_options (question_id, option_text, is_correct)
       VALUES ($1, 'Constant Time', true), ($1, 'Linear Time', false) RETURNING id`,
      [q1Id]
    );
    const q1CorrectOpt = opt1Res.rows[0].id;

    const q2Res = await pool.query(
      `INSERT INTO questions (question_text, question_type, subject, difficulty, marks, created_by)
       VALUES ('What is binary search complexity?', 'MCQ_SINGLE', 'Computer Science', 'EASY', 50, $1) RETURNING id`,
      [faculty.id]
    );
    const q2Id = q2Res.rows[0].id;
    const opt2Res = await pool.query(
      `INSERT INTO question_options (question_id, option_text, is_correct)
       VALUES ($1, 'O(log n)', true), ($1, 'O(n^2)', false) RETURNING id`,
      [q2Id]
    );
    const q2CorrectOpt = opt2Res.rows[0].id;

    console.log('\n2. Creating Exam Alpha (Max Attempts = 2)...');

    const examAlpha = await ExamRepository.createExam({
      title: 'Data Structures Midterm',
      subject: 'Computer Science',
      duration: 30,
      maximumMarks: 100,
      passingMarks: 50,
      negativeMarking: 0,
      randomizeQuestions: false,
      randomizeOptions: false,
      maximumAttempts: 2,
      createdBy: faculty.id,
      questionIds: [q1Id, q2Id],
      studentIds: [studentA.id, studentB.id],
      facultyUniversity: 'Maharaja Sayajirao University',
    });
    testExamIds.push(examAlpha.id);

    console.log('\n3. Testing Initial Assigned vs Results State (Zero Attempts)...');

    // Student A checks assigned exams
    const assignedBefore = await ExamRepository.getExamsForStudent(studentA.id);
    const alphaAssigned0 = assignedBefore.find((e) => e.id === examAlpha.id);
    assert(!!alphaAssigned0, 'Exam Alpha appears in Assigned Exams before starting');
    assert(alphaAssigned0?.remaining_attempts === 2, 'Assigned exam reports 2 remaining attempts');
    assert(alphaAssigned0?.attempt_count === 0, 'Assigned exam reports 0 attempts started');

    // Student A checks results & analytics
    const resultsBefore = await ResultRepository.getStudentResults(studentA.id);
    const alphaResult0 = resultsBefore.find((r) => r.exam_id === examAlpha.id);
    assert(!alphaResult0, 'Exam Alpha does NOT appear in Results & Analytics before any attempt is completed');

    console.log('\n4. Testing Attempt 1: Start, Resume & In-Progress Safeguards...');

    // Student A starts Attempt 1
    const att1 = await AttemptRepository.startAttempt(examAlpha.id, studentA.id);
    assert(att1.attempt_number === 1, 'First attempt receives attempt_number 1');
    assert(att1.status === 'IN_PROGRESS', 'First attempt has status IN_PROGRESS');

    // Student A calls startAttempt again while Attempt 1 is active (Resume behavior)
    const att1Resume = await AttemptRepository.startAttempt(examAlpha.id, studentA.id);
    assert(att1Resume.id === att1.id, 'Calling startAttempt while in progress resumes the existing attempt');
    assert(att1Resume.attempt_number === 1, 'Attempt number remains 1 upon resume');

    // In-progress attempt must NOT appear in Results & Analytics
    const resultsWhileInProgress = await ResultRepository.getStudentResults(studentA.id);
    const alphaResultInProgress = resultsWhileInProgress.find((r) => r.exam_id === examAlpha.id);
    assert(!alphaResultInProgress, 'In-progress exam does NOT appear in Results & Analytics as completed');

    // Exam remains in Assigned Exams with active attempt ID
    const assignedWhileInProgress = await ExamRepository.getExamsForStudent(studentA.id);
    const alphaAssignedInProgress = assignedWhileInProgress.find((e) => e.id === examAlpha.id);
    assert(!!alphaAssignedInProgress, 'Exam with in-progress attempt remains available in Assigned Exams');
    assert(alphaAssignedInProgress?.in_progress_attempt_id === att1.id, 'Assigned exam exposes in_progress_attempt_id');

    console.log('\n5. Testing Attempt 1 Submission (Score = 50)...');

    // Answer Q1 correctly, leave Q2 blank (Score = 50/100)
    await AttemptRepository.saveAnswer(att1.id, q1Id, [q1CorrectOpt], false);
    const submittedAtt1 = await AttemptRepository.submitAttempt(att1.id, studentA.id);
    assert(submittedAtt1.status === 'SUBMITTED', 'Attempt 1 submitted successfully');
    assert(parseFloat(submittedAtt1.total_score.toString()) === 50, 'Attempt 1 score is 50');

    // Assigned Exams status: Attempt 1 used, 1 remaining
    const assignedAfterAtt1 = await ExamRepository.getExamsForStudent(studentA.id);
    const alphaAssignedAfterAtt1 = assignedAfterAtt1.find((e) => e.id === examAlpha.id);
    assert(!!alphaAssignedAfterAtt1, 'Exam Alpha still in Assigned Exams because 1 attempt remains');
    assert(alphaAssignedAfterAtt1?.remaining_attempts === 1, 'Assigned exam correctly reports 1 remaining attempt');
    assert(alphaAssignedAfterAtt1?.in_progress_attempt_id === null, 'No in-progress attempt active');

    // Results & Analytics status: Attempt 1 appears with score 50
    const resultsAfterAtt1 = await ResultRepository.getStudentResults(studentA.id);
    const alphaResultAfterAtt1 = resultsAfterAtt1.find((r) => r.exam_id === examAlpha.id);
    assert(!!alphaResultAfterAtt1, 'Exam Alpha now appears in Results & Analytics');
    assert(parseFloat(alphaResultAfterAtt1?.best_score) === 50, 'Results & Analytics reports Best Score = 50');
    assert(alphaResultAfterAtt1?.total_attempts_count === 1, 'Results & Analytics reports 1 attempt completed');

    console.log('\n6. Testing Attempt 2: Bugfix Verification (Next Attempt Number & Limit)...');

    // Student A starts Attempt 2
    const att2 = await AttemptRepository.startAttempt(examAlpha.id, studentA.id);
    assert(att2.attempt_number === 2, 'Second attempt receives attempt_number 2 (LIMIT 1 bug is resolved!)');
    assert(att2.id !== att1.id, 'Second attempt has unique ID');

    // Answer Q1 & Q2 correctly (Score = 100/100)
    await AttemptRepository.saveAnswer(att2.id, q1Id, [q1CorrectOpt], false);
    await AttemptRepository.saveAnswer(att2.id, q2Id, [q2CorrectOpt], false);
    const submittedAtt2 = await AttemptRepository.submitAttempt(att2.id, studentA.id);
    assert(parseFloat(submittedAtt2.total_score.toString()) === 100, 'Attempt 2 score is 100');

    console.log('\n7. Testing Attempt Exhaustion & Removal from Assigned Exams...');

    // Assigned Exams status: 0 attempts remain -> Exam Alpha MUST DISAPPEAR from Assigned Exams!
    const assignedAfterAtt2 = await ExamRepository.getExamsForStudent(studentA.id);
    const alphaAssignedAfterAtt2 = assignedAfterAtt2.find((e) => e.id === examAlpha.id);
    assert(
      !alphaAssignedAfterAtt2,
      'Exam Alpha DISAPPEARED from Assigned Exams after exhausting all allowed attempts'
    );

    // Attempt 3 request must be rejected
    let att3Failed = false;
    try {
      await AttemptRepository.startAttempt(examAlpha.id, studentA.id);
    } catch (err: any) {
      att3Failed = true;
      assert(
        err.message.includes('Maximum attempt limit reached'),
        'Attempt 3 rejected with maximum attempt limit error'
      );
    }
    assert(att3Failed, 'Attempt 3 was blocked by AttemptRepository');

    console.log('\n8. Testing Highest Score Rule in Results & Analytics...');

    const resultsAfterAtt2 = await ResultRepository.getStudentResults(studentA.id);
    const alphaResultAfterAtt2 = resultsAfterAtt2.find((r) => r.exam_id === examAlpha.id);
    assert(!!alphaResultAfterAtt2, 'Exam Alpha appears in Results & Analytics after exhaustion');
    assert(parseFloat(alphaResultAfterAtt2?.best_score) === 100, 'Highest score rule: Best Score = 100 (not 50)');
    assert(alphaResultAfterAtt2?.total_attempts_count === 2, 'Attempts count reports 2/2');
    assert(alphaResultAfterAtt2?.remaining_attempts === 0, 'Remaining attempts is 0');
    assert(alphaResultAfterAtt2?.is_passed === true, 'Status is PASSED');

    console.log('\n9. Testing Order-Invariance: Highest Score on Earlier Attempt...');

    // Create Exam Beta with Max Attempts = 3
    const examBeta = await ExamRepository.createExam({
      title: 'Algorithm Analysis',
      subject: 'Computer Science',
      duration: 30,
      maximumMarks: 100,
      passingMarks: 50,
      negativeMarking: 0,
      randomizeQuestions: false,
      randomizeOptions: false,
      maximumAttempts: 3,
      createdBy: faculty.id,
      questionIds: [q1Id, q2Id],
      studentIds: [studentA.id],
      facultyUniversity: 'Maharaja Sayajirao University',
    });
    testExamIds.push(examBeta.id);

    // Attempt 1: Score 100 (Both correct)
    const beta1 = await AttemptRepository.startAttempt(examBeta.id, studentA.id);
    await AttemptRepository.saveAnswer(beta1.id, q1Id, [q1CorrectOpt], false);
    await AttemptRepository.saveAnswer(beta1.id, q2Id, [q2CorrectOpt], false);
    await AttemptRepository.submitAttempt(beta1.id, studentA.id);

    // Attempt 2: Score 50 (Only Q1 correct)
    const beta2 = await AttemptRepository.startAttempt(examBeta.id, studentA.id);
    await AttemptRepository.saveAnswer(beta2.id, q1Id, [q1CorrectOpt], false);
    await AttemptRepository.submitAttempt(beta2.id, studentA.id);

    // Attempt 3: Score 0 (Unanswered)
    const beta3 = await AttemptRepository.startAttempt(examBeta.id, studentA.id);
    await AttemptRepository.submitAttempt(beta3.id, studentA.id);

    // Verify Results & Analytics uses MAX score (100), not the latest (0)
    const betaResults = await ResultRepository.getStudentResults(studentA.id);
    const betaResultEntry = betaResults.find((r) => r.exam_id === examBeta.id);
    assert(
      parseFloat(betaResultEntry?.best_score) === 100,
      'Results & Analytics returns MAX score (100) despite latest attempt being 0'
    );
    assert(betaResultEntry?.total_attempts_count === 3, 'Reports 3/3 attempts exhausted');

    console.log('\n10. Testing Student Authorization & Data Isolation...');

    // Student B has NEVER attempted Exam Alpha or Beta
    const studentBResults = await ResultRepository.getStudentResults(studentB.id);
    assert(studentBResults.length === 0, 'Student B results list is empty (cannot see Student A results)');

    // Student B attempting to view Student A attempt state is blocked
    const studentAAttempt = await AttemptRepository.getAttemptById(att1.id);
    assert(studentAAttempt?.student_id === studentA.id, 'Attempt belongs to Student A');
    assert(studentAAttempt?.student_id !== studentB.id, 'Attempt does NOT belong to Student B');

    console.log('\n11. Testing Proctoring Events Logging...');

    const event = await ProctoringRepository.recordEvent(
      beta1.id,
      studentA.id,
      'FULLSCREEN_EXIT',
      { timestamp: Date.now(), reason: 'User toggled window' }
    );
    assert(event.event_type === 'FULLSCREEN_EXIT', 'Fullscreen exit proctoring event recorded');

    const tabEvent = await ProctoringRepository.recordEvent(
      beta1.id,
      studentA.id,
      'TAB_SWITCH',
      { timestamp: Date.now() }
    );
    assert(tabEvent.event_type === 'TAB_SWITCH', 'Tab switch proctoring event recorded');

    const eventsList = await ProctoringRepository.getEventsByAttempt(beta1.id);
    assert(eventsList.length >= 2, 'Proctoring events stored in database for attempt');

    console.log('\n12. Teardown test fixtures...');
    await pool.query('DELETE FROM proctoring_events WHERE attempt_id = ANY(SELECT id FROM exam_attempts WHERE exam_id = ANY($1))', [testExamIds]);
    await pool.query('DELETE FROM answers WHERE attempt_id = ANY(SELECT id FROM exam_attempts WHERE exam_id = ANY($1))', [testExamIds]);
    await pool.query('DELETE FROM exam_results WHERE exam_id = ANY($1)', [testExamIds]);
    await pool.query('DELETE FROM exam_attempts WHERE exam_id = ANY($1)', [testExamIds]);
    await pool.query('DELETE FROM exam_assignments WHERE exam_id = ANY($1)', [testExamIds]);
    await pool.query('DELETE FROM exam_questions WHERE exam_id = ANY($1)', [testExamIds]);
    await pool.query('DELETE FROM exams WHERE id = ANY($1)', [testExamIds]);
    await pool.query('DELETE FROM question_options WHERE question_id IN ($1, $2)', [q1Id, q2Id]);
    await pool.query('DELETE FROM questions WHERE id IN ($1, $2)', [q1Id, q2Id]);
    await pool.query("DELETE FROM users WHERE email LIKE 'lifetest_%@testsuite.edu'");

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

runStudentLifecycleSuite();
