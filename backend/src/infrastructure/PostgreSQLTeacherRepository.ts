import { TeacherRepository } from '../core/infrastructure/TeacherRepository';
import { Teacher } from '../core/models/Teacher';
import { User, UserRole } from '../core/models/User';
import { DatabaseConnection } from './DatabaseConnection';

export class PostgreSQLTeacherRepository implements TeacherRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async findByUserName(userName: string): Promise<Teacher | null> {
    try {
      const result = await this.db.query(
        `SELECT t.*, u.id as user_id, u.username, u.password_hash, u.role 
         FROM teachers t 
         JOIN users u ON t.user_id = u.id 
         WHERE u.username = $1 AND t.enable = true`,
        [userName]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const user = new User(row.user_id, row.username, row.password_hash, row.role as UserRole);
      return new Teacher(
        row.id,
        row.name,
        row.surname,
        row.email,
        user
      );
    } catch (error) {
      console.error('Error al buscar profesor por nombre de usuario:', error);
      throw error;
    }
  }

  async addTeacher(teacherData: Teacher): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO users (id, username, password_hash, role)
         VALUES ($1, $2, $3, $4)`,
        [
          teacherData.user.id,
          teacherData.user.username,
          teacherData.user.passwordHash,
          teacherData.user.role
        ]
      );

      await this.db.query(
        `INSERT INTO teachers (id, user_id, name, surname, email, enable)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          teacherData.id,
          teacherData.user.id,
          teacherData.name,
          teacherData.surname,
          teacherData.email,
          true // enable por defecto en true
        ]
      );
    } catch (error) {
      console.error('Error al agregar profesor:', error);
      throw error;
    }
  }

  // Nota: getAllTeachers retorna TODOS los docentes (activos e inactivos) para el admin
  async getAllTeachers(): Promise<Teacher[]> {
    try {
      const result = await this.db.query(
        `SELECT t.*, u.id as user_id, u.username, u.password_hash, u.role 
         FROM teachers t 
         JOIN users u ON t.user_id = u.id 
         ORDER BY t.created_at DESC`
      );
      return result.rows.map((row: any) => {
        const user = new User(row.user_id, row.username, row.password_hash, row.role);
        return new Teacher(
          row.id,
          row.name,
          row.surname,
          row.email,
          user
        );
      });
    } catch (error) {
      console.error('Error al obtener todos los profesores:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Teacher | null> {
    try {
      const result = await this.db.query(
        `SELECT t.*, u.id as user_id, u.username, u.password_hash, u.role 
         FROM teachers t 
         JOIN users u ON t.user_id = u.id 
         WHERE t.id = $1 AND t.enable = true`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const user = new User(row.user_id, row.username, row.password_hash, row.role as UserRole);
      return new Teacher(
        row.id,
        row.name,
        row.surname,
        row.email,
        user
      );
    } catch (error) {
      console.error('Error al buscar profesor por ID:', error);
      throw error;
    }
  }

  async updateTeacher(teacherData: Teacher): Promise<void> {
    try {
      await this.db.query(
        `UPDATE users 
         SET username = $2, password_hash = $3, role = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [
          teacherData.user.id,
          teacherData.user.username,
          teacherData.user.passwordHash,
          teacherData.user.role
        ]
      );

      await this.db.query(
        `UPDATE teachers 
         SET name = $2, surname = $3, email = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [
          teacherData.id,
          teacherData.name,
          teacherData.surname,
          teacherData.email
        ]
      );
    } catch (error) {
      console.error('Error al actualizar profesor:', error);
      throw error;
    }
  }

  async deleteTeacher(id: string): Promise<void> {
    try {
      // Verificar que el docente existe (incluso si está deshabilitado)
      const result = await this.db.query(
        `SELECT id FROM teachers WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Profesor no encontrado');
      }

      await this.db.query(
        `UPDATE teachers SET enable = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );
    } catch (error) {
      console.error('Error al deshabilitar profesor:', error);
      throw error;
    }
  }

  async enableTeacher(id: string): Promise<void> {
    try {
      const result = await this.db.query(
        `SELECT id FROM teachers WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Profesor no encontrado');
      }

      await this.db.query(
        `UPDATE teachers SET enable = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );
    } catch (error) {
      console.error('Error al reactivar profesor:', error);
      throw error;
    }
  }
}
