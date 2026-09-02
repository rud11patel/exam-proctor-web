import bcrypt from 'bcryptjs';
import { pool, checkDatabaseConnection } from '../config/database';

async function seedDatabase() {
  console.log('🔄 Checking database connection before seeding...');
  const conn = await checkDatabaseConnection();

  if (!conn.connected) {
    console.error('❌ Database connection failed. Aborting seed.');
    process.exit(1);
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password@123', salt);

    const defaultUsers = [
      {
        name: 'Alex Rivera',
        email: 'student@university.edu',
        role: 'STUDENT',
        roll: 'CS2026-089',
        dept: 'Computer Science',
        university: 'MSU',
        studentId: 'MSU-000001',
      },
      {
        name: 'Prof. David Miller',
        email: 'professor@university.edu',
        role: 'FACULTY',
        dept: 'Computer Science & AI',
        university: 'MSU',
      },
      {
        name: 'Institutional Admin',
        email: 'admin@university.edu',
        role: 'ADMIN',
        dept: 'Examination Office',
      },
    ];

    let facultyUserId = '';
    let studentUserId = '';

    for (const u of defaultUsers) {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
      let userId = '';
      if (existing.rows.length === 0) {
        const userRes = await pool.query(
          `INSERT INTO users (name, email, password_hash, role, status)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [u.name, u.email, passwordHash, u.role, 'ACTIVE']
        );
        userId = userRes.rows[0].id;

        if (u.role === 'STUDENT') {
          await pool.query(
            `INSERT INTO student_profiles (user_id, roll_number, department, course, university, student_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, u.roll, u.dept, 'B.Tech CS', u.university || null, u.studentId || null]
          );

          if (u.university) {
            await pool.query(
              `INSERT INTO university_student_sequences (university_normalized, last_sequence_number, prefix)
               VALUES ($1, 1, 'MSU')
               ON CONFLICT (university_normalized) DO NOTHING`,
              [u.university.trim().toLowerCase()]
            );
          }
        } else if (u.role === 'FACULTY') {
          await pool.query(
            `INSERT INTO faculty_profiles (user_id, department, university)
             VALUES ($1, $2, $3)`,
            [userId, u.dept, u.university || null]
          );
        }
        console.log(`✅ Seeded user: ${u.name} (${u.role})`);
      } else {
        userId = existing.rows[0].id;
        console.log(`ℹ️ User already exists: ${u.email}`);
      }

      if (u.role === 'FACULTY') facultyUserId = userId;
      if (u.role === 'STUDENT') studentUserId = userId;
    }

    // Seed Sample Questions if Question Bank is empty
    const qCount = await pool.query('SELECT COUNT(*) FROM questions');
    if (parseInt(qCount.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial Question Bank items...');
      const sampleQuestions = [
        {
          text: 'What is the time complexity of searching in a balanced Binary Search Tree (BST)?',
          type: 'MCQ_SINGLE',
          subject: 'Data Structures & Algorithms',
          topic: 'Binary Search Trees',
          difficulty: 'MEDIUM',
          marks: 4,
          explanation: 'In a balanced BST, height is O(log n), so search operation runs in logarithmic time.',
          options: [
            { text: 'O(1)', isCorrect: false },
            { text: 'O(log n)', isCorrect: true },
            { text: 'O(n)', isCorrect: false },
            { text: 'O(n log n)', isCorrect: false },
          ],
        },
        {
          text: 'Which of the following sorting algorithms operates in O(n log n) worst-case time complexity?',
          type: 'MCQ_SINGLE',
          subject: 'Data Structures & Algorithms',
          topic: 'Sorting Algorithms',
          difficulty: 'EASY',
          marks: 4,
          explanation: 'Merge Sort guarantees O(n log n) worst-case performance by dividing arrays into equal halves.',
          options: [
            { text: 'Bubble Sort', isCorrect: false },
            { text: 'Quick Sort', isCorrect: false },
            { text: 'Merge Sort', isCorrect: true },
            { text: 'Insertion Sort', isCorrect: false },
          ],
        },
        {
          text: 'In relational database systems, ACID properties guarantee reliable database transactions. What does "A" stand for?',
          type: 'MCQ_SINGLE',
          subject: 'Database Systems',
          topic: 'Transactions',
          difficulty: 'EASY',
          marks: 2,
          explanation: 'Atomicity ensures that all statements in a transaction are executed completely or none at all.',
          options: [
            { text: 'Atomicity', isCorrect: true },
            { text: 'Availability', isCorrect: false },
            { text: 'Authentication', isCorrect: false },
            { text: 'Asynchrony', isCorrect: false },
          ],
        },
      ];

      const insertedQuestionIds: string[] = [];
      for (const q of sampleQuestions) {
        const qRes = await pool.query(
          `INSERT INTO questions (question_text, question_type, subject, topic, difficulty, marks, explanation, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [q.text, q.type, q.subject, q.topic, q.difficulty, q.marks, q.explanation, facultyUserId || null]
        );
        const qId = qRes.rows[0].id;
        insertedQuestionIds.push(qId);

        for (const opt of q.options) {
          await pool.query(
            `INSERT INTO question_options (question_id, option_text, is_correct)
             VALUES ($1, $2, $3)`,
            [qId, opt.text, opt.isCorrect]
          );
        }
      }
      console.log('✅ Seeded 3 sample Question Bank items');

      // Create Sample Exam
      const examCount = await pool.query('SELECT COUNT(*) FROM exams');
      if (parseInt(examCount.rows[0].count, 10) === 0) {
        const examRes = await pool.query(
          `INSERT INTO exams (
            title, description, subject, duration, maximum_marks, passing_marks,
            negative_marking, randomize_questions, randomize_options, maximum_attempts, status, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PUBLISHED', $11)
          RETURNING id`,
          [
            'Data Structures & Algorithms Final Examination',
            'Comprehensive end-of-semester proctored examination covering arrays, BSTs, sorting, and DBMS fundamentals.',
            'Computer Science',
            45, // 45 minutes
            10, // max marks
            4,  // passing marks
            1.00, // 1 mark negative marking
            true,
            true,
            2, // 2 max attempts
            facultyUserId || null,
          ]
        );
        const examId = examRes.rows[0].id;

        for (let i = 0; i < insertedQuestionIds.length; i++) {
          await pool.query(
            `INSERT INTO exam_questions (exam_id, question_id, ordering) VALUES ($1, $2, $3)`,
            [examId, insertedQuestionIds[i], i + 1]
          );
        }

        // Assign to all students
        if (studentUserId) {
          await pool.query(
            `INSERT INTO exam_assignments (exam_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [examId, studentUserId]
          );
        }
        console.log('✅ Seeded Data Structures & Algorithms sample exam');
      }
    }

    console.log('✅ Database seeding finished successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
