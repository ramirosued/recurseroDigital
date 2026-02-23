import { StudentStatistics } from '../models/StudentStatistics';

export interface AggregatedStudentStats {
    totalGamesPlayed: number;
    averageScore: number;
    lastActivity: string | null;
    progressByGame: Record<string, GameProgress>;
}

export interface GameProgress {
    completed: number;
    totalTime: number;
    averageScore: number;
    totalAttempts: number;
}

export class StudentStatisticsAggregator {
    aggregate(statistics: StudentStatistics[]): AggregatedStudentStats {
        return {
            totalGamesPlayed: this.calculateTotalGamesPlayed(statistics),
            averageScore: this.calculateAverageScore(statistics),
            lastActivity: this.getLastActivity(statistics),
            progressByGame: this.calculateProgressByGame(statistics)
        };
    }

    private calculateTotalGamesPlayed(statistics: StudentStatistics[]): number {
        const uniqueGames = new Set(statistics.map(stat => stat.gameId));
        return uniqueGames.size;
    }

    private calculateAverageScore(statistics: StudentStatistics[]): number {
        let totalAccuracy = 0;
        let accuracyCount = 0;

        statistics.forEach(stat => {
            if (this.hasValidQuestions(stat)) {
                const accuracy = (stat.correctAnswers! / stat.totalQuestions!) * 100;
                totalAccuracy += accuracy;
                accuracyCount++;
            }
        });

        return accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0;
    }

    private getLastActivity(statistics: StudentStatistics[]): string | null {
        if (statistics.length === 0) {
            return null;
        }

        const latestStat = statistics.reduce((latest, current) => {
            return current.createdAt > latest.createdAt ? current : latest;
        });

        return latestStat.createdAt.toISOString();
    }

    private calculateProgressByGame(statistics: StudentStatistics[]): Record<string, GameProgress> {
        const gameStatsMap = new Map<string, { completed: number; totalTime: number; scores: number[]; totalAttempts: number }>();

        statistics.forEach(stat => {
            const gameId = this.normalizeGameId(stat.gameId);
            
            if (!gameStatsMap.has(gameId)) {
                gameStatsMap.set(gameId, { completed: 0, totalTime: 0, scores: [], totalAttempts: 0 });
            }

            const gameStats = gameStatsMap.get(gameId)!;
            
            if (stat.isCompleted) {
                if (gameId === 'calculos' && stat.totalQuestions !== undefined && stat.totalQuestions > 0) {
                    gameStats.completed += stat.totalQuestions;
                } else {
                    gameStats.completed++;
                }
            }

            if (stat.completionTime) {
                gameStats.totalTime += stat.completionTime;
            }

            gameStats.totalAttempts += stat.attempts;

            if (this.hasValidQuestions(stat)) {
                const score = (stat.correctAnswers! / stat.totalQuestions!) * 100;
                gameStats.scores.push(score);
            }
        });

        return this.mapToGameProgress(gameStatsMap);
    }

    private mapToGameProgress(gameStatsMap: Map<string, { completed: number; totalTime: number; scores: number[]; totalAttempts: number }>): Record<string, GameProgress> {
        const progressByGame: Record<string, GameProgress> = {};

        gameStatsMap.forEach((stats, gameId) => {
            const avgScore = stats.scores.length > 0
                ? Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length)
                : 0;

            progressByGame[gameId] = {
                completed: stats.completed,
                totalTime: stats.totalTime,
                averageScore: avgScore,
                totalAttempts: stats.totalAttempts
            };
        });

        return progressByGame;
    }

    private normalizeGameId(gameId: string): string {
        return gameId.startsWith('game-') ? gameId.replace('game-', '') : gameId;
    }

    private hasValidQuestions(stat: StudentStatistics): boolean {
        return stat.totalQuestions !== undefined && 
               stat.totalQuestions > 0 && 
               stat.correctAnswers !== undefined;
    }
}

