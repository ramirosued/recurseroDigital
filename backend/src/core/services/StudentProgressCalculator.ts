import { StudentStatisticsRepository } from '../infrastructure/StudentStatisticsRepository';
import { GameLevelRepository } from '../infrastructure/GameLevelRepository';

export interface StudentProgress {
    percentage: number;
    absoluteActivityNumber: number;
    totalActivities: number;
    lastActivity: { level: number; activity: number } | null;
}

export class StudentProgressCalculator {
    constructor(
        private statisticsRepository: StudentStatisticsRepository,
        private gameLevelRepository: GameLevelRepository
    ) {}

    async calculateStudentProgress(
        studentId: string,
        gameId: string
    ): Promise<StudentProgress> {
        const normalizedGameId = this.normalizeGameId(gameId);
        const isCalculosGame = normalizedGameId === 'calculos';

        if (isCalculosGame) {
            return this.calculateCalculosProgress(studentId, gameId);
        }

        const lastActivity = await this.statisticsRepository.getLastCompletedActivity(
            studentId,
            gameId
        );

        if (!lastActivity) {
            return {
                percentage: 0,
                absoluteActivityNumber: 0,
                totalActivities: 0,
                lastActivity: null
            };
        }

        try {
            const totalActivities = await this.gameLevelRepository.getTotalActivitiesCount(gameId);

            if (totalActivities === 0) {
                return {
                    percentage: 0,
                    absoluteActivityNumber: 0,
                    totalActivities: 0,
                    lastActivity
                };
            }

            const absoluteActivityNumber = await this.calculateAbsoluteActivityNumber(
                gameId,
                lastActivity
            );

            const percentage = (absoluteActivityNumber / totalActivities) * 100;

            return {
                percentage: Math.min(percentage, 100),
                absoluteActivityNumber,
                totalActivities,
                lastActivity
            };
        } catch (error) {
            console.warn(`Error al calcular progreso para juego ${gameId}, usando progreso por defecto:`, error);
            return {
                percentage: 0,
                absoluteActivityNumber: lastActivity.activity,
                totalActivities: 0,
                lastActivity
            };
        }
    }

    private async calculateCalculosProgress(
        studentId: string,
        gameId: string
    ): Promise<StudentProgress> {
        try {
            const totalActivities = await this.gameLevelRepository.getTotalActivitiesCount(gameId);

            if (totalActivities === 0) {
                return {
                    percentage: 0,
                    absoluteActivityNumber: 0,
                    totalActivities: 0,
                    lastActivity: null
                };
            }

            const distinctCompletedActivities = await this.statisticsRepository.getDistinctCompletedActivities(
                studentId,
                gameId
            );

            const percentage = (distinctCompletedActivities / totalActivities) * 100;

            const lastActivity = await this.statisticsRepository.getLastCompletedActivity(
                studentId,
                gameId
            );

            return {
                percentage: Math.min(percentage, 100),
                absoluteActivityNumber: distinctCompletedActivities,
                totalActivities,
                lastActivity
            };
        } catch (error) {
            console.warn(`Error al calcular progreso para juego de cálculos ${gameId}:`, error);
            const lastActivity = await this.statisticsRepository.getLastCompletedActivity(
                studentId,
                gameId
            );
            return {
                percentage: 0,
                absoluteActivityNumber: 0,
                totalActivities: 0,
                lastActivity
            };
        }
    }

    private normalizeGameId(gameId: string): string {
        return gameId.startsWith('game-') ? gameId.replace('game-', '') : gameId;
    }

    async calculateAbsoluteActivityNumber(
        gameId: string,
        lastActivity: { level: number; activity: number }
    ): Promise<number> {
        try {
            const levels = await this.gameLevelRepository.findByGameId(gameId);
            const sortedLevels = levels.sort((a, b) => a.getLevel() - b.getLevel());

            let absoluteActivityNumber = 0;

            for (const level of sortedLevels) {
                if (level.getLevel() < lastActivity.level) {
                    absoluteActivityNumber += level.getActivitiesCount();
                } else if (level.getLevel() === lastActivity.level) {
                    absoluteActivityNumber += lastActivity.activity;
                    break;
                }
            }

            return absoluteActivityNumber;
        } catch (error) {
            console.warn(`Error al calcular número absoluto de actividad para juego ${gameId}:`, error);
            return lastActivity.activity;
        }
    }

    async calculateMaxUnlockedLevel(
        studentId: string,
        gameId: string
    ): Promise<number> {
        const lastCompletedActivity = await this.statisticsRepository.getLastCompletedActivity(
            studentId,
            gameId
        );

        if (!lastCompletedActivity) {
            return 1;
        }

        try {
            const gameLevels = await this.gameLevelRepository.findByGameId(gameId);
            const sortedLevels = gameLevels.sort((a, b) => a.getLevel() - b.getLevel());

            if (sortedLevels.length === 0) {
                return lastCompletedActivity.level;
            }

            const lastLevel = sortedLevels.find(level => level.getLevel() === lastCompletedActivity.level);

            if (!lastLevel) {
                return lastCompletedActivity.level;
            }

            if (lastCompletedActivity.activity >= lastLevel.getActivitiesCount()) {
                const nextLevel = sortedLevels.find(level => level.getLevel() === lastCompletedActivity.level + 1);
                return nextLevel ? nextLevel.getLevel() : lastCompletedActivity.level + 1;
            }

            return lastCompletedActivity.level;
        } catch (error) {
            console.warn(`Error al calcular maxUnlockedLevel para juego ${gameId}, usando nivel de última actividad completada:`, error);
            return lastCompletedActivity.level;
        }
    }
}

