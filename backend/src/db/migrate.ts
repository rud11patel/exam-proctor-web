import fs from 'fs';
import path from 'path';
import { pool, checkDatabaseConnection } from '../config/database';

async function runMigrations() {
  console.log('🔄 Checking database connection before migration...');
  const conn = await checkDatabaseConnection();

  if (!conn.connected) {
    console.error('❌ Database connection failed. Aborting migrations.');
    console.error(conn.message);
    process.exit(1);
  }

  console.log('✅ Database connected. Running migration scripts...');

  try {
    const migrations = [
      '001_initial_schema.sql',
      '002_exams_schema.sql',
      '003_results_analytics_schema.sql',
      '004_proctoring_events_schema.sql',
      '005_add_university.sql',
      '006_add_university_student_id.sql',
    ];

    for (const file of migrations) {
      const migrationPath = path.resolve(__dirname, './migrations', file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(sql);
      console.log(`✅ Migration ${file} executed successfully!`);
    }

    console.log('🎉 All database schema migrations completed successfully!');
  } catch (error) {
    console.error('❌ Error executing database migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
