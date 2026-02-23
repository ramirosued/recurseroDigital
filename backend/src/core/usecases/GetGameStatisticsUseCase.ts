import { StudentStatisticsRepository } from '../infrastructure/StudentStatisticsRepository';

export interface GetGameStatisticsRequest {
    gameId: string;
}

export interface GameStatisticsResponse {
    gameId: string;
    totalStudents: number;
    averagePoints: number;
    averageAccuracy: number;
    completionRate: number;
    studentProgress: Array<{
        studentId: string;
        studentName: string;
        maxUnlockedLevel: number;
        totalPoints: number;
        completionRate: number;
        averageAccuracy: number;
        lastActivity?: Date;
    }>;
}

export class GetGameStatisticsUseCase {
    private statisticsRepository: StudentStatisticsRepository;

    constructor(statisticsRepository: StudentStatisticsRepository) {
        this.statisticsRepository = statisticsRepository;
    }

    async execute(request: GetGameStatisticsRequest): Promise<GameStatisticsResponse> {
        const gameStats = await this.statisticsRepository.getGameStatistics(request.gameId);
        
        const allStudentsProgress = await this.statisticsRepository.getAllStudentsProgress(request.gameId);

        const studentProgress = await Promise.all(
            allStudentsProgress.map(async (stat) => {
                const completionRate = await this.statisticsRepository.getStudentCompletionRate(
                    stat.studentId, 
                    request.gameId
                );
                const averageAccuracy = await this.statisticsRepository.getStudentAverageAccuracy(
                    stat.studentId, 
                    request.gameId
                );
                const totalPoints = await this.statisticsRepository.getStudentTotalPointsByGame(
                    stat.studentId, 
                    request.gameId
                );

                return {
                    studentId: stat.studentId,
                    studentName: `Estudiante ${stat.studentId}`, 
                    maxUnlockedLevel: stat.maxUnlockedLevel,
                    totalPoints,
                    completionRate,
                    averageAccuracy,
                    lastActivity: stat.updatedAt
                };
            })
        );

        return {
            gameId: request.gameId,
            totalStudents: gameStats.totalStudents,
            averagePoints: gameStats.averagePoints,
            averageAccuracy: gameStats.averageAccuracy,
            completionRate: gameStats.completionRate,
            studentProgress
        };
    }
}
