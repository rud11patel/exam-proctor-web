import { pool } from '../config/database';
import { UserDbModel, UserRole, UserStatus } from '../types/index';
import { normalizeUniversity, getUniversityPrefix, formatStudentId } from '../utils/university';

export interface UserFullProfile extends UserDbModel {
  student_id?: string;
  roll_number?: string;
  department?: string;
  course?: string;
  university?: string;
}

export class UserRepository {
  static async findByEmail(email: string): Promise<UserDbModel | null> {
    const result = await pool.query<UserDbModel>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<UserDbModel | null> {
    const result = await pool.query<UserDbModel>('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Concurrency-safe, atomic sequence increment for university-scoped student IDs.
   * Uses PostgreSQL ON CONFLICT DO UPDATE RETURNING with row-level locks.
   */
  static async generateNextStudentId(client: any, university: string): Promise<string> {
    const normalized = normalizeUniversity(university);
    if (!normalized) {
      throw new Error('Cannot generate student ID for unconfigured university');
    }
    const prefix = getUniversityPrefix(university);

    const query = `
      INSERT INTO university_student_sequences (university_normalized, last_sequence_number, prefix)
      VALUES ($1, 1, $2)
      ON CONFLICT (university_normalized)
      DO UPDATE SET
          last_sequence_number = university_student_sequences.last_sequence_number + 1,
          updated_at = CURRENT_TIMESTAMP
      RETURNING last_sequence_number, prefix;
    `;

    const result = await client.query(query, [normalized, prefix]);
    const row = result.rows[0];
    const seq = parseInt(row.last_sequence_number, 10);
    const activePrefix = row.prefix || prefix;
    return formatStudentId(activePrefix, seq);
  }

  static async getUserProfile(id: string): Promise<UserFullProfile | null> {
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, u.updated_at,
             sp.student_id,
             sp.roll_number,
             COALESCE(sp.department, fp.department) as department,
             sp.course,
             COALESCE(sp.university, fp.university) as university
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      WHERE u.id = $1
    `;
    const result = await pool.query<UserFullProfile>(query, [id]);
    return result.rows[0] || null;
  }

  static async createUserWithProfile(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    rollNumber?: string;
    department?: string;
    course?: string;
    university?: string;
    studentId?: string;
  }): Promise<UserFullProfile> {
    const client = await pool.connect();
    let createdUserId = '';
    try {
      await client.query('BEGIN');

      const userRes = await client.query<UserDbModel>(
        `INSERT INTO users (name, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4, 'ACTIVE')
         RETURNING *`,
        [data.name, data.email.toLowerCase(), data.passwordHash, data.role]
      );
      const user = userRes.rows[0];
      createdUserId = user.id;

      if (data.role === 'STUDENT') {
        // Automatically generate university-scoped student ID if not explicitly specified
        const finalStudentId = data.studentId || (data.university ? await this.generateNextStudentId(client, data.university) : null);

        await client.query(
          `INSERT INTO student_profiles (user_id, roll_number, department, course, university, student_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.id, data.rollNumber || null, data.department || null, data.course || null, data.university || null, finalStudentId]
        );
      } else if (data.role === 'FACULTY') {
        await client.query(
          `INSERT INTO faculty_profiles (user_id, department, university)
           VALUES ($1, $2, $3)`,
          [user.id, data.department || null, data.university || null]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    const profile = await this.getUserProfile(createdUserId);
    return profile!;
  }

  static async getAllUsersWithProfiles(searchQuery?: string, roleFilter?: string): Promise<UserFullProfile[]> {
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, u.updated_at,
             sp.student_id,
             sp.roll_number,
             COALESCE(sp.department, fp.department) as department,
             sp.course,
             COALESCE(sp.university, fp.university) as university
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (searchQuery) {
      params.push(`%${searchQuery.toLowerCase()}%`);
      query += ` AND (LOWER(u.name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length})`;
    }

    if (roleFilter && roleFilter !== 'ALL') {
      params.push(roleFilter.toUpperCase());
      query += ` AND u.role = $${params.length}`;
    }

    query += ' ORDER BY u.created_at DESC';
    const result = await pool.query<UserFullProfile>(query, params);
    return result.rows;
  }

  /**
   * Retrieves active students enrolled at the same university.
   * Performs case-insensitive, whitespace-trimmed comparison in PostgreSQL.
   */
  static async getStudentsByUniversity(university: string): Promise<UserFullProfile[]> {
    const trimmed = university.trim();
    if (!trimmed) {
      return [];
    }

    const query = `
      SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, u.updated_at,
             sp.student_id,
             sp.roll_number,
             sp.department,
             sp.course,
             sp.university
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'STUDENT'
        AND u.status = 'ACTIVE'
        AND sp.university IS NOT NULL
        AND TRIM(sp.university) != ''
        AND LOWER(TRIM(sp.university)) = LOWER(TRIM($1))
      ORDER BY u.name ASC
    `;
    const result = await pool.query<UserFullProfile>(query, [trimmed]);
    return result.rows;
  }

  /**
   * Validates whether every student in studentIds is an active student belonging
   * to the specified university (using case-insensitive, whitespace-trimmed matching).
   */
  static async validateStudentsBelongToUniversity(
    studentIds: string[],
    university: string
  ): Promise<{ allValid: boolean; invalidStudentIds: string[] }> {
    const trimmed = university.trim();
    if (!trimmed || studentIds.length === 0) {
      return { allValid: false, invalidStudentIds: studentIds };
    }

    // Unique student IDs to validate
    const uniqueIds = Array.from(new Set(studentIds));

    const query = `
      SELECT u.id
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'STUDENT'
        AND u.status = 'ACTIVE'
        AND u.id = ANY($1::uuid[])
        AND sp.university IS NOT NULL
        AND TRIM(sp.university) != ''
        AND LOWER(TRIM(sp.university)) = LOWER(TRIM($2))
    `;

    const result = await pool.query<{ id: string }>(query, [uniqueIds, trimmed]);
    const validIdSet = new Set(result.rows.map((r) => r.id));

    const invalidStudentIds = uniqueIds.filter((id) => !validIdSet.has(id));
    return {
      allValid: invalidStudentIds.length === 0,
      invalidStudentIds,
    };
  }

  static async updateUserStatus(userId: string, status: UserStatus): Promise<UserFullProfile> {
    await pool.query('UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2', [status, userId]);
    const profile = await this.getUserProfile(userId);
    if (!profile) throw new Error('User not found');
    return profile;
  }

  static async updateUserProfile(
    userId: string,
    updates: { name?: string; department?: string; course?: string; university?: string }
  ): Promise<UserFullProfile> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (updates.name) {
        await client.query('UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2', [updates.name, userId]);
      }

      const user = await this.findById(userId);
      if (user?.role === 'STUDENT') {
        await client.query(
          `UPDATE student_profiles
           SET department = COALESCE($1, department),
               course = COALESCE($2, course),
               university = COALESCE($3, university),
               updated_at = NOW()
           WHERE user_id = $4`,
          [updates.department || null, updates.course || null, updates.university || null, userId]
        );
      } else if (user?.role === 'FACULTY') {
        await client.query(
          `UPDATE faculty_profiles
           SET department = COALESCE($1, department),
               university = COALESCE($2, university),
               updated_at = NOW()
           WHERE user_id = $3`,
          [updates.department || null, updates.university || null, userId]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    const profile = await this.getUserProfile(userId);
    return profile!;
  }
}
