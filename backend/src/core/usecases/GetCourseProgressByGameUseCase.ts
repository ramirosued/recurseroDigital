import { StudentRepository } from '../infrastructure/StudentRepository';
import { StudentStatisticsRepository } from '../infrastructure/StudentStatisticsRepository';
import { GameLevelRepository } from '../infrastructure/GameLevelRepository';
import { CourseRepository } from '../infrastructure/CourseRepository';
import { Student } from '../models/Student';
import { StudentProgressCalculator } from '../services/StudentProgressCalculator';

export interface GetCourseProgressByGameRequest {
    courseId: string;
}

export interface GameProgressData {
    gameId: string;
    averageProgress: number;
    totalStudents: number;
    studentsWithProgress: number;
}

export interface CourseProgressByGameResponse {
    courseId: string;
    totalStudents: number;
    progressByGame: GameProgressData[];
}

export class GetCourseProgressByGameUseCase {
    private progressCalculator: StudentProgressCalculator;

    constructor(
        private studentRepository: StudentRepository,
        private statisticsRepository: StudentStatisticsRepository,
        private gameLevelRepository: GameLevelRepository,
        private courseRepository: CourseRepository
    ) {
        this.progressCalculator = new StudentProgressCalculator(
            statisticsRepository,
            gameLevelRepository
        );
    }

    async execute(request: GetCourseProgressByGameRequest): Promise<CourseProgressByGameResponse> {
        const { courseId } = request;

        if (!courseId) {
            throw new Error('courseId es requerido');
        }

        const courseStudents = await this.getCourseStudents(courseId);
        const totalStudents = courseStudents.length;

        const allCourseGames = await this.getAllCourseGames(courseId);
        
        if (allCourseGames.length === 0) {
            return this.createEmptyResponse(courseId, totalStudents);
        }

        const gameIds = allCourseGames.map(courseGame => courseGame.getGameId());
        const progressByGame = await this.calculateProgressForAllGames(
            gameIds,
            courseStudents,
            totalStudents
        );

        return {
            courseId,
            totalStudents,
            progressByGame
        };
    }

    private async getCourseStudents(courseId: string): Promise<Student[]> {
        try {
            return await this.studentRepository.getStudentsByCourseId(courseId);
        } catch (error) {
            console.error('Error al obtener estudiantes del curso:', error);
            throw new Error('Error al obtener estudiantes del curso');
        }
    }

    private async getAllCourseGames(courseId: string) {
        try {
            return await this.courseRepository.getAllGamesByCourseId(courseId);
        } catch (error) {
            console.error('Error al obtener juegos del curso:', error);
            throw new Error('Error al obtener juegos del curso');
        }
    }

    private async calculateProgressForAllGames(
        gameIds: string[],
        courseStudents: Student[],
        totalStudents: number
    ): Promise<GameProgressData[]> {
        return Promise.all(
            gameIds.map(gameId => this.calculateGameProgress(gameId, courseStudents, totalStudents))
        );
    }

    private async calculateGameProgress(
        gameId: string,
        courseStudents: Student[],
        totalStudents: number
    ): Promise<GameProgressData> {
        const normalizedGameId = this.normalizeGameId(gameId);
        const totalActivities = await this.gameLevelRepository.getTotalActivitiesCount(gameId);

        if (totalActivities === 0) {
            return this.createEmptyGameProgress(normalizedGameId, totalStudents);
        }

        const { studentProgresses, studentsWithProgress } = await this.calculateAllStudentsProgress(
            courseStudents,
            gameId
        );

        const averageProgress = this.calculateAverageProgress(studentProgresses);

        return {
            gameId: normalizedGameId,
            averageProgress,
            totalStudents,
            studentsWithProgress
        };
    }

    private async calculateAllStudentsProgress(
        courseStudents: Student[],
        gameId: string
    ): Promise<{ studentProgresses: number[]; studentsWithProgress: number }> {
        const studentProgresses: number[] = [];
        let studentsWithProgress = 0;

        for (const student of courseStudents) {
            try {
                const progress = await this.calculateStudentProgress(student.id, gameId);
                studentProgresses.push(progress);
                
                if (progress > 0) {
                    studentsWithProgress++;
                }
            } catch (error) {
                console.warn(`Error al calcular progreso para estudiante ${student.id} y juego ${gameId}:`, error);
                studentProgresses.push(0);
            }
        }

        return { studentProgresses, studentsWithProgress };
    }

    private async calculateStudentProgress(
        studentId: string,
        gameId: string
    ): Promise<number> {
        const progress = await this.progressCalculator.calculateStudentProgress(studentId, gameId);
        return progress.percentage;
    }

    private calculateAverageProgress(progresses: number[]): number {
        if (progresses.length === 0) {
            return 0;
        }

        const sum = progresses.reduce((a, b) => a + b, 0);
        return Math.round(sum / progresses.length);
    }

    private createEmptyResponse(courseId: string, totalStudents: number): CourseProgressByGameResponse {
        return {
            courseId,
            totalStudents,
            progressByGame: []
        };
    }

    private createEmptyGameProgress(gameId: string, totalStudents: number): GameProgressData {
        return {
            gameId,
            averageProgress: 0,
            totalStudents,
            studentsWithProgress: 0
        };
    }

    private normalizeGameId(gameId: string): string {
        return gameId.startsWith('game-') ? gameId.replace('game-', '') : gameId;
    }
}

