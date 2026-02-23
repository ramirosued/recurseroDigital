import { CourseRepository } from '../core/infrastructure/CourseRepository';
import { Course } from '../core/models/Course';
import { CourseGame } from '../core/models/CourseGame';
import { Game } from '../core/models/Game';
import { DatabaseConnection } from './DatabaseConnection';

export class PostgreSQLCourseRepository implements CourseRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async findByCourseName(courseName: string): Promise<Course | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM courses WHERE name = $1',
        [courseName]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
          teacher_id: row.teacher_id,
          students: row.students
      };
    } catch (error) {
      console.error('Error al buscar el curso por el nombre de curso:', error);
      throw error;
    }
  }

  async addCourse(course: Course): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO courses (id, name, teacher_id)
         VALUES ($1, $2, $3)`,
        [course.id, course.name, null]
      );
    } catch (error) {
      console.error('Error al agregar curso:', error);
      throw error;
    }
  }

  async getAllCourses(): Promise<Course[]> {
    try {
      const result = await this.db.query('SELECT * FROM courses ORDER BY created_at DESC');
      return result.rows.map((row: any) => ({
        id: row.id,
          name: row.name,
          teacher_id: row.teacher_id,
          students: row.students
      }));
    } catch (error) {
      console.error('Error al obtener todos los cursos:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Course | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM courses WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
          name: row.name,
          teacher_id: row.teacher_id,
          students: row.students
      };
    } catch (error) {
      console.error('Error al buscar el curso por ID:', error);
      throw error;
    }
  }

  async updateCourse(course: Course): Promise<void> {
    try {
      await this.db.query(
        `UPDATE courses 
         SET name = $2, teacher_id = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [course.id, course.name, course.teacher_id]
      );
    } catch (error) {
      console.error('Error al actualizar el curso:', error);
      throw error;
    }
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      await this.db.query('DELETE FROM courses WHERE id = $1', [id]);
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      throw error;
    }
  }

  async getEnabledGamesByCourseId(courseId: string): Promise<CourseGame[]> {
    try {
      const result = await this.db.query(
        `SELECT 
           cg.id,
           cg.course_id,
           cg.game_id,
           cg.is_enabled,
           cg.order_index,
           cg.created_at,
           cg.updated_at,
           g.name as game_name,
           g.description as game_description,
           g.image_url as game_image_url,
           g.route as game_route,
           g.difficulty_level as game_difficulty_level,
           g.is_active as game_is_active,
           g.created_at as game_created_at,
           g.updated_at as game_updated_at
         FROM courses_games cg
         JOIN games g ON cg.game_id = g.id
         WHERE cg.course_id = $1 
           AND cg.is_enabled = true 
           AND g.is_active = true
         ORDER BY cg.order_index ASC`,
        [courseId]
      );

      return result.rows.map((row: any) => {
        const game = new Game(
          row.game_id,
          row.game_name,
          row.game_description,
          row.game_image_url,
          row.game_route,
          row.game_difficulty_level,
          row.game_is_active,
          row.game_created_at,
          row.game_updated_at
        );

        return new CourseGame(
          row.id,
          row.course_id,
          row.game_id,
          row.is_enabled,
          row.order_index,
          game,
          row.created_at,
          row.updated_at
        );
      });
    } catch (error) {
      console.error('Error al obtener juegos habilitados del curso:', error);
      throw error;
    }
  }

  async getAllGamesByCourseId(courseId: string): Promise<CourseGame[]> {
    try {
      const result = await this.db.query(
        `SELECT 
           cg.id,
           cg.course_id,
           cg.game_id,
           cg.is_enabled,
           cg.order_index,
           cg.created_at,
           cg.updated_at,
           g.name as game_name,
           g.description as game_description,
           g.image_url as game_image_url,
           g.route as game_route,
           g.difficulty_level as game_difficulty_level,
           g.is_active as game_is_active,
           g.created_at as game_created_at,
           g.updated_at as game_updated_at
         FROM courses_games cg
         JOIN games g ON cg.game_id = g.id
         WHERE cg.course_id = $1
         ORDER BY cg.order_index ASC`,
        [courseId]
      );

      return result.rows.map((row: any) => {
        const game = new Game(
          row.game_id,
          row.game_name,
          row.game_description,
          row.game_image_url,
          row.game_route,
          row.game_difficulty_level,
          row.game_is_active,
          row.game_created_at,
          row.game_updated_at
        );

        return new CourseGame(
          row.id,
          row.course_id,
          row.game_id,
          row.is_enabled,
          row.order_index,
          game,
          row.created_at,
          row.updated_at
        );
      });
    } catch (error) {
      console.error('Error al obtener todos los juegos del curso:', error);
      throw error;
    }
  }

  async getAllGames(): Promise<Game[]> {
    try {
      const result = await this.db.query(
        `SELECT * FROM games ORDER BY created_at ASC`
      );

      return result.rows.map((row: any) => {
        return new Game(
          row.id,
          row.name,
          row.description,
          row.image_url,
          row.route,
          row.difficulty_level,
          row.is_active,
          row.created_at,
          row.updated_at
        );
      });
    } catch (error) {
      console.error('Error al obtener todos los juegos:', error);
      throw error;
    }
  }


  async addGameToCourse(courseGameId: string, courseId: string, gameId: string): Promise<void> {
    try {
      const orderResult = await this.db.query(
        'SELECT COALESCE(MAX(order_index) + 1, 0) as next_order FROM courses_games WHERE course_id = $1',
        [courseId]
      );
      const nextOrder = orderResult.rows[0]?.next_order || 0;

      await this.db.query(
        `INSERT INTO courses_games (id, course_id, game_id, is_enabled, order_index)
         VALUES ($1, $2, $3, true, $4)
         ON CONFLICT (course_id, game_id)
         DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = CURRENT_TIMESTAMP`,
        [courseGameId, courseId, gameId, nextOrder]
      );
    } catch (error) {
      console.error('Error al agregar juego al curso:', error);
      throw error;
    }
  }

  async updateCourseGameStatus(courseGameId: string, isEnabled: boolean): Promise<void> {
    try {
      const result = await this.db.query(
        `UPDATE courses_games 
         SET is_enabled = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [isEnabled, courseGameId]
      );

      if (result.rowCount === 0) {
        throw new Error('El juego del curso no existe');
      }
    } catch (error) {
      console.error('Error al actualizar estado del juego del curso:', error);
      throw error;
    }
  }

  async createCourse(name: string, teacherId?: string): Promise<Course> {
    try {
      const courseId = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await this.db.query(
        `INSERT INTO courses (id, name, teacher_id, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [courseId, name, teacherId || null]
      );

      const allGames = await this.getAllGames();

      for (let i = 0; i < allGames.length; i++) {
        const game = allGames[i];
        const courseGameId = `course_game_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
        
        await this.db.query(
          `INSERT INTO courses_games (id, course_id, game_id, is_enabled, order_index, created_at, updated_at)
           VALUES ($1, $2, $3, false, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (course_id, game_id) DO NOTHING`,
          [courseGameId, courseId, game.id, i]
        );
      }

      return new Course(courseId, name, teacherId || '', []);
    } catch (error) {
      console.error('Error al crear curso:', error);
      throw error;
    }
  }

  async assignTeacherToCourse(teacherId: string, courseId: string): Promise<void> {
    try {
        // Si teacherId es cadena vacía, desasignar (poner null)
        const teacherIdValue = teacherId === '' ? null : teacherId;
        await this.db.query(
            `UPDATE courses 
             SET teacher_id = $1, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2`,
            [teacherIdValue, courseId]
        );
    } catch (error) {
        console.error('Error al asignar profesor al curso:', error);
        throw error;
    }
}

  async getCoursesByTeacherId(teacherId: string): Promise<Course[]> {
    try {
      const result = await this.db.query(
        `SELECT * FROM courses WHERE teacher_id = $1 ORDER BY created_at DESC`,
        [teacherId]
      );
      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        teacher_id: row.teacher_id,
        students: row.students
      }));
    } catch (error) {
      console.error('Error al obtener cursos por docente:', error);
      throw error;
    }
  }

}
