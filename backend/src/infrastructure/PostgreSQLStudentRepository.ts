import { StudentRepository } from '../core/infrastructure/StudentRepository';
import { Student } from '../core/models/Student';
import { User, UserRole } from '../core/models/User';
import { DatabaseConnection } from './DatabaseConnection';

export class PostgreSQLStudentRepository implements StudentRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async findByUserName(userName: string): Promise<Student | null> {
    try {
      const result = await this.db.query(
        `SELECT s.*, u.id as user_id, u.username, u.password_hash, u.role 
         FROM students s 
         JOIN users u ON s.user_id = u.id 
         WHERE u.username = $1 AND s.enable = true`,
        [userName]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const user = new User(row.user_id, row.username, row.password_hash, row.role as UserRole);
      return new Student(
        row.id,
        row.name,
        row.lastname,
        row.dni,
        row.course_id,
        user
      );
    } catch (error) {
      console.error('Error al buscar estudiante por nombre de usuario:', error);
      throw error;
    }
  }

  async addStudent(studentData: Student): Promise<void> {
    try {
      // Primero insertar el usuario
      await this.db.query(
        `INSERT INTO users (id, username, password_hash, role)
         VALUES ($1, $2, $3, $4)`,
        [
          studentData.user.id,
          studentData.user.username,
          studentData.user.passwordHash,
          studentData.user.role
        ]
      );

      // Luego insertar el estudiante
      await this.db.query(
        `INSERT INTO students (id, user_id, name, lastname, dni, course_id, enable)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          studentData.id,
          studentData.user.id,
          studentData.name,
          studentData.lastname,
          studentData.dni,
          studentData.courseId,
          true 
        ]
      );
    } catch (error) {
      console.error('Error al agregar estudiante:', error);
      throw error;
    }
  }

  // Métodos adicionales útiles para administración
  // Nota: getAllStudents retorna TODOS los estudiantes (activos e inactivos) para el admin
  async getAllStudents(): Promise<Student[]> {
    try {
      const result = await this.db.query(
        `SELECT s.*, u.id as user_id, u.username, u.password_hash, u.role 
         FROM students s 
         JOIN users u ON s.user_id = u.id 
         ORDER BY s.created_at DESC`
      );
      return result.rows.map((row: any) => {
        const user = new User(row.user_id, row.username, row.password_hash, row.role);
        return new Student(
          row.id,
          row.name,
          row.lastname,
          row.dni,
          row.course_id,
          user
        );
      });
    } catch (error) {
      console.error('Error al obtener todos los estudiantes:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Student | null> {
    try {
      const result = await this.db.query(
        `SELECT s.*, u.id as user_id, u.username, u.password_hash, u.role 
         FROM students s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.id = $1 AND s.enable = true`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const user = new User(row.user_id, row.username, row.password_hash, row.role as UserRole);
      return new Student(
        row.id,
        row.name,
        row.lastname,
        row.dni,
        row.course_id,
        user
      );
    } catch (error) {
      console.error('Error al buscar estudiante por ID:', error);
      throw error;
    }
  }

  async updateStudent(studentData: Student): Promise<void> {
    try {
      await this.db.query(
        `UPDATE users 
         SET username = $2, password_hash = $3, role = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [
          studentData.user.id,
          studentData.user.username,
          studentData.user.passwordHash,
          studentData.user.role
        ]
      );

      await this.db.query(
        `UPDATE students 
         SET name = $2, lastname = $3, dni = $4, course_id = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [
          studentData.id,
          studentData.name,
          studentData.lastname,
          studentData.dni,
          studentData.courseId
        ]
      );
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      throw error;
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      // Verificar que el estudiante existe (incluso si está deshabilitado)
      const result = await this.db.query(
        `SELECT id FROM students WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Estudiante no encontrado');
      }

      //poner enable = false
      await this.db.query(
        `UPDATE students SET enable = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );
    } catch (error) {
      console.error('Error al deshabilitar estudiante:', error);
      throw error;
    }
  }

  async enableStudent(id: string): Promise<void> {
    try {
      const result = await this.db.query(
        `SELECT id FROM students WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Estudiante no encontrado');
      }

      await this.db.query(
        `UPDATE students SET enable = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );
    } catch (error) {
      console.error('Error al reactivar estudiante:', error);
      throw error;
    }
  }

  async assignCourseToStudent(studentId: string, courseId: string): Promise<void> {
    try {
      await this.db.query(
        `UPDATE students SET course_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [studentId, courseId]
      );
    } catch (error) {
      console.error('Error al asignar curso a estudiante:', error);
      throw error;
    }
  }

  async getEnrollmentDate(studentId: string): Promise<Date | null> {
    try {
      const result = await this.db.query(
        `SELECT created_at FROM students WHERE id = $1`,
        [studentId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Date(result.rows[0].created_at);
    } catch (error) {
      console.error('Error al obtener fecha de inscripción:', error);
      throw error;
    }
  }

  async getStudentsByCourseId(courseId: string): Promise<Student[]> {
    try {
      const result = await this.db.query(
        `SELECT s.*, u.id as user_id, u.username, u.password_hash, u.role 
         FROM students s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.course_id = $1 AND s.enable = true
         ORDER BY s.created_at DESC`,
        [courseId]
      );

      return result.rows.map((row: any) => {
        const user = new User(row.user_id, row.username, row.password_hash, row.role);
        return new Student(
          row.id,
          row.name,
          row.lastname,
          row.dni,
          row.course_id,
          user
        );
      });
    } catch (error) {
      console.error('Error al obtener estudiantes por curso:', error);
      throw error;
    }
  }
}
