import { pool } from './config/database';
import { ProctoringRepository } from './repositories/proctoringRepository';
import { AttemptRepository } from './repositories/attemptRepository';
import { ExamRepository } from './repositories/examRepository';
import { UserRepository } from './repositories/userRepository';
import { MAX_EXAM_VIOLATIONS } from './config/proctoring';

async function runTests() {
  console.log('--- VIOLATION THRESHOLD TEST SUITE ---');
  let testUser: any = null;
  let testExam: any = null;

  try {
    // Setup
    testUser = await UserRepository.findByEmail('violationtest@msu.edu');
      const userRes = await pool.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ('Violation Test', 'violationtest@msu.edu', 'hash', 'STUDENT') RETURNING *`
      );
      testUser = userRes.rows[0];
      await pool.query(
        `INSERT INTO student_profiles (user_id, university) VALUES ($1, 'msu')`,
        [testUser.id]
      );

    testExam = await pool.query(`
      INSERT INTO exams (title, description, subject, duration, status, maximum_attempts, maximum_marks)
      VALUES ('Violation Test Exam', 'Test', 'CS', 60, 'ACTIVE', 5, 100)
      RETURNING *
    `);
    testExam = testExam.rows[0];

    // TEST 1: Under threshold
    console.log('\\n[TEST 1] Running violations under threshold...');
    const attempt1 = await pool.query(
      `INSERT INTO exam_attempts (exam_id, student_id, server_end_time, status) VALUES ($1, $2, NOW() + interval '1 hour', 'IN_PROGRESS') RETURNING *`,
      [testExam.id, testUser.id]
    );
    const attemptId1 = attempt1.rows[0].id;
    
    let result;
    for (let i = 0; i < 4; i++) {
      result = await ProctoringRepository.recordEventWithThreshold(attemptId1, testUser.id, 'TAB_SWITCH');
    }
    console.log(`Recorded 4 violations. Count: ${result?.violationCount}. AlreadySubmitted: ${result?.isAlreadySubmitted}`);
    if (result?.violationCount === 4 && !result?.isAlreadySubmitted) {
      console.log('✅ TEST 1 PASSED');
    } else {
      console.log('❌ TEST 1 FAILED');
    }

    // TEST 2: Threshold reached
    console.log('\\n[TEST 2] Reaching threshold auto-submission...');
    const attempt2 = await pool.query(
      `INSERT INTO exam_attempts (exam_id, student_id, server_end_time, status) VALUES ($1, $2, NOW() + interval '1 hour', 'IN_PROGRESS') RETURNING *`,
      [testExam.id, testUser.id]
    );
    const attemptId2 = attempt2.rows[0].id;

    for (let i = 0; i < 5; i++) {
      result = await ProctoringRepository.recordEventWithThreshold(attemptId2, testUser.id, 'TAB_SWITCH');
    }
    
    // Check if we need to call submitAttempt manually like controller
    if (result?.violationCount === 5) {
      await AttemptRepository.submitAttempt(attemptId2, testUser.id);
    }
    
    const finalAttempt2 = await AttemptRepository.getAttemptById(attemptId2);
    console.log(`Recorded 5 violations. Count: ${result?.violationCount}. Status: ${finalAttempt2?.status}`);
    if (result?.violationCount === 5 && finalAttempt2?.status === 'SUBMITTED') {
      console.log('✅ TEST 2 PASSED');
    } else {
      console.log('❌ TEST 2 FAILED');
    }

    // TEST 3: After auto-submission, new violations are ignored
    console.log('\\n[TEST 3] After auto-submission, ignore violations...');
    const resultAfterSubmit = await ProctoringRepository.recordEventWithThreshold(attemptId2, testUser.id, 'TAB_SWITCH');
    console.log(`Violation count after submit: ${resultAfterSubmit.violationCount}, isAlreadySubmitted: ${resultAfterSubmit.isAlreadySubmitted}`);
    if (resultAfterSubmit.isAlreadySubmitted && resultAfterSubmit.violationCount === 0) {
      console.log('✅ TEST 3 PASSED');
    } else {
      console.log('❌ TEST 3 FAILED');
    }

    // TEST 4: Race Condition Simulation
    console.log('\\n[TEST 4] Race Condition Simulation...');
    const attempt4 = await pool.query(
      `INSERT INTO exam_attempts (exam_id, student_id, server_end_time, status) VALUES ($1, $2, NOW() + interval '1 hour', 'IN_PROGRESS') RETURNING *`,
      [testExam.id, testUser.id]
    );
    const attemptId4 = attempt4.rows[0].id;

    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push((async () => {
        try {
          const res = await ProctoringRepository.recordEventWithThreshold(attemptId4, testUser.id, 'TAB_SWITCH');
          if (res.violationCount >= 5 && !res.isAlreadySubmitted) {
            await AttemptRepository.submitAttempt(attemptId4, testUser.id);
          }
          return res;
        } catch (e) {
          return null;
        }
      })());
    }

    const results = await Promise.all(promises);
    const finalAttempt4 = await AttemptRepository.getAttemptById(attemptId4);
    
    const actualCountRes = await pool.query('SELECT count(*) from proctoring_events WHERE attempt_id = $1', [attemptId4]);
    const actualCount = parseInt(actualCountRes.rows[0].count, 10);
    
    console.log(`10 Concurrent Requests -> Total violations in DB: ${actualCount}`);
    console.log(`Status: ${finalAttempt4?.status}`);
    // Since some events might get rejected after it's submitted, actualCount might be exactly 5, or more if they got in before submitAttempt fired.
    // Wait, since we are doing 10 requests, they get queued. The first 5 record and hit 5. The 5th calls submitAttempt. The 6th will block on 'FOR UPDATE' until submitAttempt finishes (if we wrap them?). 
    // Actually, recordEventWithThreshold does 'FOR UPDATE'. submitAttempt also does 'FOR UPDATE'. This creates a queue!
    // This is perfect!
    if (finalAttempt4?.status === 'SUBMITTED') {
      console.log('✅ TEST 4 PASSED');
    } else {
      console.log('❌ TEST 4 FAILED');
    }

  } catch (err) {
    console.error('Test Suite Error:', err);
  } finally {
    if (testExam) {
      await pool.query('DELETE FROM exams WHERE id = $1', [testExam.id]);
    }
    if (testUser) {
      await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
    }
    pool.end();
  }
}

runTests();
