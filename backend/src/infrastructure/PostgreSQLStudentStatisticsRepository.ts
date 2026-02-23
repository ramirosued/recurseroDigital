import { StudentStatisticsRepository } from '../core/infrastructure/StudentStatisticsRepository';
import { StudentStatistics } from '../core/models/StudentStatistics';
import { DatabaseConnection } from './DatabaseConnection';

export class PostgreSQLStudentStatisticsRepository implements StudentStatisticsRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async saveStatistics(statistics: StudentStatistics): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO student_statistics (
          id, student_id, game_id, level, activity, points, total_points, 
          attempts, correct_answers, total_questions, completion_time, 
          is_completed, max_unlocked_level, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          statistics.id,
          statistics.studentId,
          statistics.gameId,
          statistics.level,
          statistics.activity,
          statistics.points,
          statistics.totalPoints,
          statistics.attempts,
          statistics.correctAnswers,
          statistics.totalQuestions,
          statistics.completionTime,
          statistics.isCompleted,
          statistics.maxUnlockedLevel,
          statistics.createdAt,
          statistics.updatedAt
        ]
      );
    } catch (error) {
      console.error('Error al guardar estadísticas:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<StudentStatistics | null> {
    try {
      const result = await this.db.query(
        `SELECT * FROM student_statistics WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToStatistics(result.rows[0]);
    } catch (error) {
      console.error('Error al buscar estadísticas por ID:', error);
      throw error;
    }
  }

  async updateStatistics(statistics: StudentStatistics): Promise<void> {
    try {
      await this.db.query(
        `UPDATE student_statistics SET
          level = $2, activity = $3, points = $4, total_points = $5,
          attempts = $6, correct_answers = $7, total_questions = $8,
          completion_time = $9, is_completed = $10, max_unlocked_level = $11,
          updated_at = $12
        WHERE id = $1`,
        [
          statistics.id,
          statistics.level,
          statistics.activity,
          statistics.points,
          statistics.totalPoints,
          statistics.attempts,
          statistics.correctAnswers,
          statistics.totalQuestions,
          statistics.completionTime,
          statistics.isCompleted,
          statistics.maxUnlockedLevel,
          statistics.updatedAt
        ]
      );
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
      throw error;
    }
  }

  async deleteStatistics(id: string): Promise<void> {
    try {
      await this.db.query('DELETE FROM student_statistics WHERE id = $1', [id]);
    } catch (error) {
      console.error('Error al eliminar estadísticas:', error);
      throw error;
    }
  }

  async findByStudentAndGame(studentId: string, gameId: string): Promise<StudentStatistics[]> {
    try {
      const result = await this.db.query(
        `SELECT * FROM student_statistics 
         WHERE student_id = $1 AND game_id = $2 
         ORDER BY level, activity, created_at DESC`,
        [studentId, gameId]
      );

      return result.rows.map((row: any) => this.mapRowToStatistics(row));
    } catch (error) {
      console.error('Error al buscar estadísticas por estudiante y juego:', error);
      throw error;
    }
  }

  async findByStudent(studentId: string): Promise<StudentStatistics[]> {
    try {
      const result = await this.db.query(
        `SELECT * FROM student_statistics 
         WHERE student_id = $1 
         ORDER BY game_id, level, activity, created_at DESC`,
        [studentId]
      );

      return result.rows.map((row: any) => this.mapRowToStatistics(row));
    } catch (error) {
      console.error('Error al buscar estadísticas por estudiante:', error);
      throw error;
    }
  }

  async findByGame(gameId: string): Promise<StudentStatistics[]> {
    try {
      const result = await this.db.query(
        `SELECT * FROM student_statistics 
         WHERE game_id = $1 
         ORDER BY student_id, level, activity, created_at DESC`,
        [gameId]
      );

      return result.rows.map((row: any) => this.mapRowToStatistics(row));
    } catch (error) {
      console.error('Error al buscar estadísticas por juego:', error);
      throw error;
    }
  }

  async findStudentProgress(studentId: string, gameId: string): Promise<StudentStatistics | null> {
    try {
      const result = await this.db.query(
        `SELECT * FROM student_statistics 
         WHERE student_id = $1 AND game_id = $2 
         ORDER BY max_unlocked_level DESC, created_at DESC 
         LIMIT 1`,
        [studentId, gameId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToStatistics(result.rows[0]);
    } catch (error) {
      console.error('Error al buscar progreso del estudiante:', error);
      throw error;
    }
  }

  async findLatestStatistics(studentId: string, gameId: string): Promise<StudentStatistics | null> {
    try {
      const result = await this.db.query(
        `SELECT * FROM student_statistics 
         WHERE student_id = $1 AND game_id = $2 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [studentId, gameId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToStatistics(result.rows[0]);
    } catch (error) {
      console.error('Error al buscar últimas estadísticas:', error);
      throw error;
    }
  }

  async findStatisticsByLevel(studentId: string, gameId: string, level: number): Promise<StudentStatistics[]> {
    try {
      const result = await this.db.query(
        `SELECT * FROM student_statistics 
         WHERE student_id = $1 AND game_id = $2 AND level = $3 
         ORDER BY activity, created_at DESC`,
        [studentId, gameId, level]
      );

      return result.rows.map((row: any) => this.mapRowToStatistics(row));
    } catch (error) {
      console.error('Error al buscar estadísticas por nivel:', error);
      throw error;
    }
  }

  async getStudentTotalPoints(studentId: string): Promise<number> {
    try {
      const result = await this.db.query(
        `SELECT SUM(total_points) as total FROM student_statistics 
         WHERE student_id = $1`,
        [studentId]
      );

      return parseInt(result.rows[0]?.total) || 0;
    } catch (error) {
      console.error('Error al obtener puntos totales del estudiante:', error);
      throw error;
    }
  }

  async getStudentTotalPointsByGame(studentId: string, gameId: string): Promise<number> {
    try {
      const result = await this.db.query(
        `SELECT SUM(total_points) as total FROM student_statistics 
         WHERE student_id = $1 AND game_id = $2`,
        [studentId, gameId]
      );

      return parseInt(result.rows[0]?.total) || 0;
    } catch (error) {
      console.error('Error al obtener puntos totales por juego:', error);
      throw error;
    }
  }

  async getStudentCompletionRate(studentId: string, gameId: string): Promise<number> {
    try {
      const result = await this.db.query(
        `SELECT 
           COUNT(CASE WHEN is_completed = true THEN 1 END) as completed,
           COUNT(*) as total
         FROM student_statistics 
         WHERE student_id = $1 AND game_id = $2`,
        [studentId, gameId]
      );

      const row = result.rows[0];
      if (row.total === 0) return 0;
      
      return (row.completed / row.total) * 100;
    } catch (error) {
      console.error('Error al obtener tasa de finalización:', error);
      throw error;
    }
  }

  async getStudentAverageAccuracy(studentId: string, gameId: string): Promise<number> {
    try {
      const result = await this.db.query(
        `SELECT AVG(correct_answers::float / NULLIF(total_questions, 0)) * 100 as accuracy
         FROM student_statistics 
         WHERE student_id = $1 AND game_id = $2 
         AND total_questions > 0`,
        [studentId, gameId]
      );

      return parseFloat(result.rows[0]?.accuracy) || 0;
    } catch (error) {
      console.error('Error al obtener precisión promedio:', error);
      throw error;
    }
  }

  async getAllStudentsProgress(gameId: string): Promise<StudentStatistics[]> {
    try {
      const result = await this.db.query(
        `SELECT DISTINCT ON (student_id) *
         FROM student_statistics 
         WHERE game_id = $1 
         ORDER BY student_id, max_unlocked_level DESC, created_at DESC`,
        [gameId]
      );

      return result.rows.map((row: any) => this.mapRowToStatistics(row));
    } catch (error) {
      console.error('Error al obtener progreso de todos los estudiantes:', error);
      throw error;
    }
  }

  async getGameStatistics(gameId: string): Promise<{
    totalStudents: number;
    averagePoints: number;
    averageAccuracy: number;
    completionRate: number;
  }> {
    try {
      const result = await this.db.query(
        `WITH student_max_points AS (
           SELECT student_id, MAX(total_points) as max_total_points
           FROM student_statistics 
           WHERE game_id = $1
           GROUP BY student_id
         )
         SELECT 
           COUNT(DISTINCT ss.student_id) as total_students,
           AVG(smp.max_total_points) as avg_points,
           AVG(ss.correct_answers::float / NULLIF(ss.total_questions, 0)) * 100 as avg_accuracy,
           (COUNT(CASE WHEN ss.is_completed = true THEN 1 END)::float / COUNT(*)) * 100 as completion_rate
         FROM student_statistics ss
         LEFT JOIN student_max_points smp ON ss.student_id = smp.student_id
         WHERE ss.game_id = $1`,
        [gameId]
      );

      const row = result.rows[0];
      return {
        totalStudents: parseInt(row.total_students) || 0,
        averagePoints: parseFloat(row.avg_points) || 0,
        averageAccuracy: parseFloat(row.avg_accuracy) || 0,
        completionRate: parseFloat(row.completion_rate) || 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del juego:', error);
      throw error;
    }
  }

  async getLastCompletedActivity(studentId: string, gameId: string): Promise<{ level: number; activity: number } | null> {
    try {
      const result = await this.db.query(
        `SELECT level, activity 
         FROM student_statistics 
         WHERE student_id = $1 AND game_id = $2 
         ORDER BY level DESC, activity DESC 
         LIMIT 1`,
        [studentId, gameId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        level: row.level,
        activity: row.activity
      };
    } catch (error) {
      console.error('Error al obtener última actividad completada:', error);
      throw error;
    }
  }

  async getDistinctCompletedActivities(studentId: string, gameId: string): Promise<number> {
    try {
      const result = await this.db.query(
        `SELECT COUNT(*) as distinct_count
         FROM (
           SELECT DISTINCT level, activity
           FROM student_statistics 
           WHERE student_id = $1 AND game_id = $2 AND is_completed = true
         ) as distinct_activities`,
        [studentId, gameId]
      );

      return parseInt(result.rows[0]?.distinct_count) || 0;
    } catch (error) {
      console.error('Error al obtener actividades distintas completadas:', error);
      throw error;
    }
  }

  private mapRowToStatistics(row: any): StudentStatistics {
    return new StudentStatistics(
      row.id,
      row.student_id,
      row.game_id,
      row.level,
      row.activity,
      row.points,
      row.total_points,
      row.attempts,
      row.is_completed,
      row.max_unlocked_level,
      new Date(row.created_at),
      new Date(row.updated_at),
      row.correct_answers,
      row.total_questions,
      row.completion_time
    );
  }
}
