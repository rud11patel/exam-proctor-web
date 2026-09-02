import { pool } from '../config/database';
import { UserDbModel, UserRole, UserStatus } from '../types/index';

export interface UserFullProfile extends UserDbModel {
  roll_number?: string;
  department?: string;
  course?: string;
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

  static async getUserProfile(id: string): Promise<UserFullProfile | null> {
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, u.updated_at,
             sp.roll_number,
             COALESCE(sp.department, fp.department) as department,
             sp.course
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
  }): Promise<UserFullProfile> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userRes = await client.query<UserDbModel>(
        `INSERT INTO users (name, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4, 'ACTIVE')
         RETURNING *`,
        [data.name, data.email.toLowerCase(), data.passwordHash, data.role]
      );
      const user = userRes.rows[0];

      if (data.role === 'STUDENT') {
        await client.query(
          `INSERT INTO student_profiles (user_id, roll_number, department, course)
           VALUES ($1, $2, $3, $4)`,
          [user.id, data.rollNumber || null, data.department || null, data.course || null]
        );
      } else if (data.role === 'FACULTY') {
        await client.query(
          `INSERT INTO faculty_profiles (user_id, department)
           VALUES ($1, $2)`,
          [user.id, data.department || null]
        );
      }

      await client.query('COMMIT');
      const profile = await this.getUserProfile(user.id);
      return profile!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAllUsersWithProfiles(searchQuery?: string, roleFilter?: string): Promise<UserFullProfile[]> {
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, u.updated_at,
             sp.roll_number,
             COALESCE(sp.department, fp.department) as department,
             sp.course
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

  static async updateUserStatus(userId: string, status: UserStatus): Promise<UserFullProfile> {
    await pool.query('UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2', [status, userId]);
    const profile = await this.getUserProfile(userId);
    if (!profile) throw new Error('User not found');
    return profile;
  }

  static async updateUserProfile(userId: string, updates: { name?: string; department?: string; course?: string }): Promise<UserFullProfile> {
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
           SET department = COALESCE($1, department), course = COALESCE($2, course), updated_at = NOW()
           WHERE user_id = $3`,
          [updates.department || null, updates.course || null, userId]
        );
      } else if (user?.role === 'FACULTY') {
        await client.query(
          `UPDATE faculty_profiles
           SET department = COALESCE($1, department), updated_at = NOW()
           WHERE user_id = $2`,
          [updates.department || null, userId]
        );
      }

      await client.query('COMMIT');
      const profile = await this.getUserProfile(userId);
      return profile!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
