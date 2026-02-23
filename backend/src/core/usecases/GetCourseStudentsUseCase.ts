import { StudentRepository } from '../infrastructure/StudentRepository';
import { StudentStatisticsRepository } from '../infrastructure/StudentStatisticsRepository';
import { StudentStatisticsAggregator } from '../services/StudentStatisticsAggregator';
import { CourseRepository } from '../infrastructure/CourseRepository';
import { GameLevelRepository } from '../infrastructure/GameLevelRepository';
import { StudentProgressCalculator } from '../services/StudentProgressCalculator';

interface StudentDetails {
    id: string;
    name: string;
    lastname: string;
    userName: string;
    enrollmentDate: string | null;
    totalGamesPlayed: number;
    averageScore: number;
    lastActivity: string | null;
    progressByGame: Record<string, {
        completed: number;
        totalTime: number;
        averageScore: number;
        totalAttempts: number;
    }>;
}

interface GetCourseStudentsRequest {
    courseId: string;
}

interface GetCourseStudentsResponse {
    courseId: string;
    students: StudentDetails[];
}

export class GetCourseStudentsUseCase {
    private statisticsAggregator: StudentStatisticsAggregator;
    private progressCalculator: StudentProgressCalculator;

    constructor(
        private studentRepository: StudentRepository,
        private statisticsRepository: StudentStatisticsRepository,
        private courseRepository: CourseRepository,
        private gameLevelRepository: GameLevelRepository
    ) {
        this.statisticsAggregator = new StudentStatisticsAggregator();
        this.progressCalculator = new StudentProgressCalculator(
            statisticsRepository,
            gameLevelRepository
        );
    }

    async execute(request: GetCourseStudentsRequest): Promise<GetCourseStudentsResponse> {
        const { courseId } = request;

        const courseStudents = await this.studentRepository.getStudentsByCourseId(courseId);
        const allCourseGames = await this.courseRepository.getAllGamesByCourseId(courseId);
        const courseGameIds = allCourseGames.map(courseGame => courseGame.getGameId());

        const studentsWithDetails = await Promise.all(
            courseStudents.map(student => this.buildStudentDetails(student, courseGameIds))
        );

        return {
            courseId,
            students: studentsWithDetails
        };
    }

    private async buildStudentDetails(student: any, courseGameIds: string[]): Promise<StudentDetails> {
        const enrollmentDate = await this.getFormattedEnrollmentDate(student.id);
        const statistics = await this.statisticsRepository.findByStudent(student.id);
        const aggregatedStats = this.statisticsAggregator.aggregate(statistics);

        const completeProgressByGame = await this.buildCompleteProgressByGame(
            student.id,
            courseGameIds,
            aggregatedStats.progressByGame
        );

        return {
            id: student.id,
            name: student.name,
            lastname: student.lastname,
            userName: student.getUsername(),
            enrollmentDate,
            totalGamesPlayed: aggregatedStats.totalGamesPlayed,
            averageScore: aggregatedStats.averageScore,
            lastActivity: aggregatedStats.lastActivity,
            progressByGame: completeProgressByGame
        };
    }

    private async buildCompleteProgressByGame(
        studentId: string,
        courseGameIds: string[],
        existingProgressByGame: Record<string, { completed: number; totalTime: number; averageScore: number; totalAttempts: number }>
    ): Promise<Record<string, { completed: number; totalTime: number; averageScore: number; totalAttempts: number }>> {
        const completeProgress: Record<string, { completed: number; totalTime: number; averageScore: number; totalAttempts: number }> = {};

        for (const gameId of courseGameIds) {
            const normalizedGameId = this.normalizeGameId(gameId);
            
            let gameProgress: { completed: number; totalTime: number; averageScore: number; totalAttempts: number };
            
            if (existingProgressByGame[normalizedGameId]) {
                gameProgress = { ...existingProgressByGame[normalizedGameId] };
            } else {
                gameProgress = {
                    completed: 0,
                    totalTime: 0,
                    averageScore: 0,
                    totalAttempts: 0
                };
            }

            const progressPercentage = await this.calculateProgressPercentage(studentId, gameId);
            gameProgress.averageScore = Math.round(progressPercentage);

            completeProgress[normalizedGameId] = gameProgress;
        }

        return completeProgress;
    }

    private async calculateProgressPercentage(studentId: string, gameId: string): Promise<number> {
        const progress = await this.progressCalculator.calculateStudentProgress(studentId, gameId);
        return progress.percentage;
    }

    private normalizeGameId(gameId: string): string {
        return gameId.startsWith('game-') ? gameId.replace('game-', '') : gameId;
    }

    private async getFormattedEnrollmentDate(studentId: string): Promise<string | null> {
        const enrollmentDate = await this.studentRepository.getEnrollmentDate(studentId);
        return enrollmentDate ? enrollmentDate.toISOString().split('T')[0] : null;
    }
}

