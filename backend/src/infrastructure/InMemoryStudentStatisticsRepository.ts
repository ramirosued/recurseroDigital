import { StudentStatisticsRepository } from '../core/infrastructure/StudentStatisticsRepository';
import { StudentStatistics } from '../core/models/StudentStatistics';

export class InMemoryStudentStatisticsRepository implements StudentStatisticsRepository {
  private statistics: StudentStatistics[] = [];

  async saveStatistics(statistics: StudentStatistics): Promise<void> {
    this.statistics.push(statistics);
  }

  async findById(id: string): Promise<StudentStatistics | null> {
    return this.statistics.find(stat => stat.id === id) || null;
  }

  async updateStatistics(statistics: StudentStatistics): Promise<void> {
    const index = this.statistics.findIndex(stat => stat.id === statistics.id);
    if (index !== -1) {
      this.statistics[index] = statistics;
    }
  }

  async deleteStatistics(id: string): Promise<void> {
    const index = this.statistics.findIndex(stat => stat.id === id);
    if (index !== -1) {
      this.statistics.splice(index, 1);
    }
  }

  async findByStudentAndGame(studentId: string, gameId: string): Promise<StudentStatistics[]> {
    return this.statistics.filter(stat => 
      stat.studentId === studentId && stat.gameId === gameId
    );
  }

  async findByStudent(studentId: string): Promise<StudentStatistics[]> {
    return this.statistics.filter(stat => stat.studentId === studentId);
  }

  async findByGame(gameId: string): Promise<StudentStatistics[]> {
    return this.statistics.filter(stat => stat.gameId === gameId);
  }

  async findStudentProgress(studentId: string, gameId: string): Promise<StudentStatistics | null> {
    const studentStats = this.statistics.filter(stat => 
      stat.studentId === studentId && stat.gameId === gameId
    );
    
    if (studentStats.length === 0) return null;
    
    return studentStats.reduce((latest, current) => 
      current.maxUnlockedLevel > latest.maxUnlockedLevel ? current : latest
    );
  }

  async findLatestStatistics(studentId: string, gameId: string): Promise<StudentStatistics | null> {
    const studentStats = this.statistics.filter(stat => 
      stat.studentId === studentId && stat.gameId === gameId
    );
    
    if (studentStats.length === 0) return null;
    
    return studentStats.reduce((latest, current) => 
      current.createdAt > latest.createdAt ? current : latest
    );
  }

  async findStatisticsByLevel(studentId: string, gameId: string, level: number): Promise<StudentStatistics[]> {
    return this.statistics.filter(stat => 
      stat.studentId === studentId && 
      stat.gameId === gameId && 
      stat.level === level
    );
  }

  async getStudentTotalPoints(studentId: string): Promise<number> {
    return this.statistics
      .filter(stat => stat.studentId === studentId)
      .reduce((total, stat) => total + stat.points, 0);
  }

  async getStudentTotalPointsByGame(studentId: string, gameId: string): Promise<number> {
    return this.statistics
      .filter(stat => stat.studentId === studentId && stat.gameId === gameId)
      .reduce((total, stat) => total + stat.points, 0);
  }

  async getStudentCompletionRate(studentId: string, gameId: string): Promise<number> {
    const studentStats = this.statistics.filter(stat => 
      stat.studentId === studentId && stat.gameId === gameId
    );
    
    if (studentStats.length === 0) return 0;
    
    const completed = studentStats.filter(stat => stat.isCompleted).length;
    return (completed / studentStats.length) * 100;
  }

  async getStudentAverageAccuracy(studentId: string, gameId: string): Promise<number> {
    const studentStats = this.statistics.filter(stat => 
      stat.studentId === studentId && 
      stat.gameId === gameId && 
      stat.totalQuestions && stat.totalQuestions > 0
    );
    
    if (studentStats.length === 0) return 0;
    
    const totalAccuracy = studentStats.reduce((sum, stat) => {
      const accuracy = (stat.correctAnswers || 0) / stat.totalQuestions!;
      return sum + accuracy;
    }, 0);
    
    return (totalAccuracy / studentStats.length) * 100;
  }

  async getAllStudentsProgress(gameId: string): Promise<StudentStatistics[]> {
    const gameStats = this.statistics.filter(stat => stat.gameId === gameId);
    const uniqueStudents = new Set(gameStats.map(stat => stat.studentId));
    
    return Array.from(uniqueStudents).map(studentId => {
      const studentGameStats = gameStats.filter(stat => stat.studentId === studentId);
      return studentGameStats.reduce((latest, current) => 
        current.maxUnlockedLevel > latest.maxUnlockedLevel ? current : latest
      );
    });
  }

  async getGameStatistics(gameId: string): Promise<{
    totalStudents: number;
    averagePoints: number;
    averageAccuracy: number;
    completionRate: number;
  }> {
    const gameStats = this.statistics.filter(stat => stat.gameId === gameId);
    
    if (gameStats.length === 0) {
      return {
        totalStudents: 0,
        averagePoints: 0,
        averageAccuracy: 0,
        completionRate: 0
      };
    }
    
    const uniqueStudents = new Set(gameStats.map(stat => stat.studentId));
    const totalStudents = uniqueStudents.size;
    
    // Calcular el promedio de puntos totales por estudiante
    const studentTotalPoints = Array.from(uniqueStudents).map(studentId => {
      return gameStats
        .filter(stat => stat.studentId === studentId)
        .reduce((max, stat) => Math.max(max, stat.totalPoints), 0);
    });
    const averagePoints = studentTotalPoints.reduce((sum, points) => sum + points, 0) / totalStudents;
    
    const statsWithQuestions = gameStats.filter(stat => 
      stat.totalQuestions && stat.totalQuestions > 0
    );
    
    const averageAccuracy = statsWithQuestions.length > 0
      ? statsWithQuestions.reduce((sum, stat) => {
          const accuracy = (stat.correctAnswers || 0) / stat.totalQuestions!;
          return sum + accuracy;
        }, 0) / statsWithQuestions.length * 100
      : 0;
    
    const completedStats = gameStats.filter(stat => stat.isCompleted);
    const completionRate = (completedStats.length / gameStats.length) * 100;
    
    return {
      totalStudents,
      averagePoints,
      averageAccuracy,
      completionRate
    };
  }

  async clearStatistics(): Promise<void> {
    this.statistics = [];
  }

  async getLastCompletedActivity(studentId: string, gameId: string): Promise<{ level: number; activity: number } | null> {
    const studentStats = this.statistics.filter(stat => 
      stat.studentId === studentId && stat.gameId === gameId
    );
    
    if (studentStats.length === 0) {
      return null;
    }

    // Ordenar por level DESC, activity DESC y tomar el primero
    const sorted = studentStats.sort((a, b) => {
      if (b.level !== a.level) {
        return b.level - a.level;
      }
      return b.activity - a.activity;
    });

    const lastStat = sorted[0];
    return {
      level: lastStat.level,
      activity: lastStat.activity
    };
  }

  async getDistinctCompletedActivities(studentId: string, gameId: string): Promise<number> {
    const completedStats = this.statistics.filter(stat => 
      stat.studentId === studentId && 
      stat.gameId === gameId && 
      stat.isCompleted === true
    );
    
    // Usar Set para contar actividades distintas (level, activity)
    const distinctActivities = new Set<string>();
    completedStats.forEach(stat => {
      const key = `${stat.level}-${stat.activity}`;
      distinctActivities.add(key);
    });
    
    return distinctActivities.size;
  }

  getAllStatistics(): StudentStatistics[] {
    return [...this.statistics];
  }

  addStatistics(statistics: StudentStatistics): void {
    this.statistics.push(statistics);
  }
}

