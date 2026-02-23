import { StudentStatisticsAggregator } from '../../../src/core/services/StudentStatisticsAggregator';
import { StudentStatistics } from '../../../src/core/models/StudentStatistics';

describe('StudentStatisticsAggregator', () => {
    let aggregator: StudentStatisticsAggregator;

    beforeEach(() => {
        aggregator = new StudentStatisticsAggregator();
    });

    describe('aggregate', () => {
        it('should return zero values for empty statistics array', () => {
            const result = aggregator.aggregate([]);

            expect(result.totalGamesPlayed).toBe(0);
            expect(result.averageScore).toBe(0);
            expect(result.lastActivity).toBeNull();
            expect(result.progressByGame).toEqual({});
        });

        it('should calculate correct aggregated stats for single game', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true, 10, 10, 30)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.totalGamesPlayed).toBe(1);
            expect(result.averageScore).toBe(100);
            expect(result.lastActivity).toBeTruthy();
            expect(result.progressByGame['ordenamiento']).toBeDefined();
            expect(result.progressByGame['ordenamiento'].completed).toBe(1);
        });

        it('should calculate correct aggregated stats for multiple games', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true, 10, 10, 30),
                createStatistic('2', 'student1', 'game-escritura', 1, 1, 80, 80, 1, true, 8, 10, 25),
                createStatistic('3', 'student1', 'game-descomposicion', 1, 1, 90, 90, 1, true, 9, 10, 20)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.totalGamesPlayed).toBe(3);
            expect(result.averageScore).toBe(90); // (100 + 80 + 90) / 3 = 90
        });
    });

    describe('calculateTotalGamesPlayed', () => {
        it('should count unique games correctly', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true),
                createStatistic('2', 'student1', 'game-ordenamiento', 1, 2, 100, 100, 1, true),
                createStatistic('3', 'student1', 'game-escritura', 1, 1, 80, 80, 1, true)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.totalGamesPlayed).toBe(2);
        });

        it('should return 0 for empty array', () => {
            const result = aggregator.aggregate([]);
            expect(result.totalGamesPlayed).toBe(0);
        });
    });

    describe('calculateAverageScore', () => {
        it('should calculate average score correctly', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true, 10, 10, 30),
                createStatistic('2', 'student1', 'game-ordenamiento', 1, 2, 100, 100, 1, true, 8, 10, 25),
                createStatistic('3', 'student1', 'game-ordenamiento', 1, 3, 100, 100, 1, true, 9, 10, 20)
            ];

            const result = aggregator.aggregate(stats);

            // (100% + 80% + 90%) / 3 = 90%
            expect(result.averageScore).toBe(90);
        });

        it('should return 0 when no valid questions exist', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.averageScore).toBe(0);
        });

        it('should ignore statistics without valid questions', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true, 10, 10, 30),
                createStatistic('2', 'student1', 'game-ordenamiento', 1, 2, 100, 100, 1, true), // sin preguntas
                createStatistic('3', 'student1', 'game-ordenamiento', 1, 3, 100, 100, 1, true, 8, 10, 25)
            ];

            const result = aggregator.aggregate(stats);

            // Solo cuenta las dos con preguntas válidas: (100% + 80%) / 2 = 90%
            expect(result.averageScore).toBe(90);
        });

        it('should round average score correctly', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true, 10, 10, 30),
                createStatistic('2', 'student1', 'game-ordenamiento', 1, 2, 100, 100, 1, true, 7, 10, 25),
                createStatistic('3', 'student1', 'game-ordenamiento', 1, 3, 100, 100, 1, true, 8, 10, 20)
            ];

            const result = aggregator.aggregate(stats);

            // (100% + 70% + 80%) / 3 = 83.33% -> redondeado a 83
            expect(result.averageScore).toBe(83);
        });
    });

    describe('getLastActivity', () => {
        it('should return null for empty statistics', () => {
            const result = aggregator.aggregate([]);
            expect(result.lastActivity).toBeNull();
        });

        it('should return the most recent activity date', () => {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            const stats = [
                createStatisticWithDate('1', 'student1', 'game-ordenamiento', yesterday),
                createStatisticWithDate('2', 'student1', 'game-escritura', tomorrow),
                createStatisticWithDate('3', 'student1', 'game-descomposicion', now)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.lastActivity).toBe(tomorrow.toISOString());
        });
    });

    describe('calculateProgressByGame', () => {
        it('should group statistics by game', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true, 10, 10, 30),
                createStatistic('2', 'student1', 'game-ordenamiento', 1, 2, 100, 100, 1, true, 8, 10, 25),
                createStatistic('3', 'student1', 'game-escritura', 1, 1, 80, 80, 1, true, 9, 10, 20)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.progressByGame['ordenamiento']).toBeDefined();
            expect(result.progressByGame['escritura']).toBeDefined();
            expect(result.progressByGame['ordenamiento'].completed).toBe(2);
            expect(result.progressByGame['escritura'].completed).toBe(1);
        });

        it('should calculate total time correctly', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true, 10, 10, 30),
                createStatistic('2', 'student1', 'game-ordenamiento', 1, 2, 100, 100, 1, true, 8, 10, 25),
                createStatistic('3', 'student1', 'game-ordenamiento', 1, 3, 100, 100, 1, true, 9, 10, 20)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.progressByGame['ordenamiento'].totalTime).toBe(75); // 30 + 25 + 20
        });

        it('should calculate average score per game correctly', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true, 10, 10, 30),
                createStatistic('2', 'student1', 'game-ordenamiento', 1, 2, 100, 100, 1, true, 8, 10, 25)
            ];

            const result = aggregator.aggregate(stats);

            // (100% + 80%) / 2 = 90%
            expect(result.progressByGame['ordenamiento'].averageScore).toBe(90);
        });

        it('should count only completed activities', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true, 10, 10, 30),
                createStatistic('2', 'student1', 'game-ordenamiento', 1, 2, 100, 100, 1, false, 8, 10, 25),
                createStatistic('3', 'student1', 'game-ordenamiento', 1, 3, 100, 100, 1, true, 9, 10, 20)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.progressByGame['ordenamiento'].completed).toBe(2);
        });
    });

    describe('normalizeGameId', () => {
        it('should remove "game-" prefix from game IDs', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.progressByGame['ordenamiento']).toBeDefined();
            expect(result.progressByGame['game-ordenamiento']).toBeUndefined();
        });

        it('should handle game IDs without prefix', () => {
            const stats = [
                createStatistic('1', 'student1', 'ordenamiento', 1, 1, 100, 100, 1, true)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.progressByGame['ordenamiento']).toBeDefined();
        });

        it('should normalize multiple games correctly', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true),
                createStatistic('2', 'student1', 'game-escritura', 1, 1, 80, 80, 1, true),
                createStatistic('3', 'student1', 'descomposicion', 1, 1, 90, 90, 1, true)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.progressByGame['ordenamiento']).toBeDefined();
            expect(result.progressByGame['escritura']).toBeDefined();
            expect(result.progressByGame['descomposicion']).toBeDefined();
        });
    });

    describe('edge cases', () => {
        it('should handle statistics with zero completion time', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true, 10, 10, 0)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.progressByGame['ordenamiento'].totalTime).toBe(0);
        });

        it('should handle statistics with undefined completion time', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true, 10, 10)
            ];

            const result = aggregator.aggregate(stats);

            expect(result.progressByGame['ordenamiento'].totalTime).toBe(0);
        });

        it('should handle mixed valid and invalid question data', () => {
            const stats = [
                createStatistic('1', 'student1', 'game-ordenamiento', 1, 1, 100, 100, 1, true, 10, 10, 30),
                createStatistic('2', 'student1', 'game-ordenamiento', 1, 2, 100, 100, 1, true, 0, 0, 25), 
                createStatistic('3', 'student1', 'game-ordenamiento', 1, 3, 100, 100, 1, true, undefined, 10, 20) 
            ];

            const result = aggregator.aggregate(stats);

            expect(result.averageScore).toBe(100); 
        });
    });
});


function createStatistic(
    id: string,
    studentId: string,
    gameId: string,
    level: number,
    activity: number,
    points: number,
    totalPoints: number,
    attempts: number,
    isCompleted: boolean,
    correctAnswers?: number,
    totalQuestions?: number,
    completionTime?: number
): StudentStatistics {
    return new StudentStatistics(
        id,
        studentId,
        gameId,
        level,
        activity,
        points,
        totalPoints,
        attempts,
        isCompleted,
        level,
        new Date(),
        new Date(),
        correctAnswers,
        totalQuestions,
        completionTime
    );
}

function createStatisticWithDate(
    id: string,
    studentId: string,
    gameId: string,
    createdAt: Date
): StudentStatistics {
    return new StudentStatistics(
        id,
        studentId,
        gameId,
        1,
        1,
        100,
        100,
        1,
        true,
        1,
        createdAt,
        createdAt
    );
}

