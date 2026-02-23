import { StudentStatisticsRepository } from '../infrastructure/StudentStatisticsRepository';
import { GameLevelRepository } from '../infrastructure/GameLevelRepository';
import { StudentStatistics } from '../models/StudentStatistics';
import { StudentProgressCalculator } from '../services/StudentProgressCalculator';

export interface GetStudentProgressRequest {
    studentId: string;
    gameId?: string; 
}

export interface StudentProgressResponse {
    studentId: string;
    gameProgress: {
        gameId: string;
        maxUnlockedLevel: number;
        totalPoints: number;
        completionRate: number;
        averageAccuracy: number;
        lastActivity?: Date;
        statistics: StudentStatistics[];
    }[];
    totalPoints: number;
    totalGamesPlayed: number;
}

export class GetStudentProgressUseCase {
    private statisticsRepository: StudentStatisticsRepository;
    private progressCalculator: StudentProgressCalculator;

    constructor(
        statisticsRepository: StudentStatisticsRepository,
        gameLevelRepository: GameLevelRepository
    ) {
        this.statisticsRepository = statisticsRepository;
        this.progressCalculator = new StudentProgressCalculator(
            statisticsRepository,
            gameLevelRepository
        );
    }

    async execute(request: GetStudentProgressRequest): Promise<StudentProgressResponse> {
        let statistics: StudentStatistics[];

        if (request.gameId) {
            statistics = await this.statisticsRepository.findByStudentAndGame(
                request.studentId, 
                request.gameId
            );
        } else {
            statistics = await this.statisticsRepository.findByStudent(request.studentId);
        }

        const gameGroups = new Map<string, StudentStatistics[]>();
        statistics.forEach(stat => {
            if (!gameGroups.has(stat.gameId)) {
                gameGroups.set(stat.gameId, []);
            }
            gameGroups.get(stat.gameId)!.push(stat);
        });

        const gameProgress = await Promise.all(
            Array.from(gameGroups.entries()).map(async ([gameId, gameStats]) => {
                const maxUnlockedLevel = await this.progressCalculator.calculateMaxUnlockedLevel(
                    request.studentId,
                    gameId
                );

                const totalPoints = gameStats.reduce((sum, stat) => sum + stat.points, 0);
                const completionRate = await this.statisticsRepository.getStudentCompletionRate(
                    request.studentId, 
                    gameId
                );
                const averageAccuracy = await this.statisticsRepository.getStudentAverageAccuracy(
                    request.studentId, 
                    gameId
                );

                const lastActivity = gameStats.reduce((latest, current) => 
                    current.createdAt > latest.createdAt ? current : latest
                ).createdAt;

                return {
                    gameId,
                    maxUnlockedLevel,
                    totalPoints,
                    completionRate,
                    averageAccuracy,
                    lastActivity,
                    statistics: gameStats
                };
            })
        );

        let totalPoints: number;
        if (request.gameId) {
            totalPoints = gameProgress.length > 0 ? gameProgress[0].totalPoints : 0;
        } else {
            totalPoints = await this.statisticsRepository.getStudentTotalPoints(request.studentId);
        }
        const totalGamesPlayed = gameGroups.size;

        return {
            studentId: request.studentId,
            gameProgress,
            totalPoints,
            totalGamesPlayed
        };
    }
}
