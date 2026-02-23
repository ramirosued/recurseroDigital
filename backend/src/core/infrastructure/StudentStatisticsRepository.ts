import { StudentStatistics } from "../models/StudentStatistics";

export interface StudentStatisticsRepository {
    saveStatistics(statistics: StudentStatistics): Promise<void>;
    findById(id: string): Promise<StudentStatistics | null>;
    updateStatistics(statistics: StudentStatistics): Promise<void>;
    deleteStatistics(id: string): Promise<void>;
    findByStudentAndGame(studentId: string, gameId: string): Promise<StudentStatistics[]>;
    findByStudent(studentId: string): Promise<StudentStatistics[]>;
    findByGame(gameId: string): Promise<StudentStatistics[]>;
    findStudentProgress(studentId: string, gameId: string): Promise<StudentStatistics | null>;
    findLatestStatistics(studentId: string, gameId: string): Promise<StudentStatistics | null>;
    findStatisticsByLevel(studentId: string, gameId: string, level: number): Promise<StudentStatistics[]>;
    getStudentTotalPoints(studentId: string): Promise<number>;
    getStudentTotalPointsByGame(studentId: string, gameId: string): Promise<number>;
    getStudentCompletionRate(studentId: string, gameId: string): Promise<number>;
    getStudentAverageAccuracy(studentId: string, gameId: string): Promise<number>;
    getAllStudentsProgress(gameId: string): Promise<StudentStatistics[]>;
    getGameStatistics(gameId: string): Promise<{
        totalStudents: number;
        averagePoints: number;
        averageAccuracy: number;
        completionRate: number;
    }>;
    getLastCompletedActivity(studentId: string, gameId: string): Promise<{ level: number; activity: number } | null>;
    getDistinctCompletedActivities(studentId: string, gameId: string): Promise<number>;
}
