import { StudentProgressCalculator } from '../../../src/core/services/StudentProgressCalculator';
import { MockStudentStatisticsRepository } from '../../mocks/StudentStatisticsRepository.mock';
import { MockGameLevelRepository } from '../../mocks/GameLevelRepository.mock';
import { GameLevel, GameLevelConfig } from '../../../src/core/models/GameLevel';
import { StudentStatistics } from '../../../src/core/models/StudentStatistics';

describe('StudentProgressCalculator', () => {
    let calculator: StudentProgressCalculator;
    let statisticsRepository: MockStudentStatisticsRepository;
    let gameLevelRepository: MockGameLevelRepository;

    beforeEach(() => {
        statisticsRepository = new MockStudentStatisticsRepository();
        gameLevelRepository = new MockGameLevelRepository();
        calculator = new StudentProgressCalculator(statisticsRepository, gameLevelRepository);
    });

    describe('calculateStudentProgress', () => {
        it('should return zero progress when no activities completed', async () => {
            const progress = await calculator.calculateStudentProgress('student-1', 'game-1');

            expect(progress.percentage).toBe(0);
            expect(progress.absoluteActivityNumber).toBe(0);
            expect(progress.totalActivities).toBe(0);
            expect(progress.lastActivity).toBeNull();
        });

        it('should return zero progress when totalActivities is 0', async () => {
            const date = new Date();
            statisticsRepository.addStatistics(
                new StudentStatistics('stat-1', 'student-1', 'game-1', 1, 1, 100, 100, 1, true, 1, date, date)
            );

            const progress = await calculator.calculateStudentProgress('student-1', 'game-1');

            expect(progress.percentage).toBe(0);
            expect(progress.absoluteActivityNumber).toBe(0);
            expect(progress.totalActivities).toBe(0);
            expect(progress.lastActivity).not.toBeNull();
        });

        it('should calculate progress correctly for single level', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-1', 1, 'Level 1', 'Desc', 'Easy', 5, config);
            gameLevelRepository.addGameLevel(level);

            const date = new Date();
            statisticsRepository.addStatistics(
                new StudentStatistics('stat-1', 'student-1', 'game-1', 1, 3, 100, 100, 1, true, 1, date, date)
            );

            const progress = await calculator.calculateStudentProgress('student-1', 'game-1');

            expect(progress.totalActivities).toBe(5);
            expect(progress.absoluteActivityNumber).toBe(3);
            expect(progress.percentage).toBe(60);
            expect(progress.lastActivity).toEqual({ level: 1, activity: 3 });
        });

        it('should calculate progress correctly for multiple levels', async () => {
            const config1: GameLevelConfig = { min: 1, max: 50 };
            const config2: GameLevelConfig = { min: 51, max: 100 };
            const level1 = new GameLevel('level-1', 'game-1', 1, 'Level 1', 'Desc', 'Easy', 5, config1);
            const level2 = new GameLevel('level-2', 'game-1', 2, 'Level 2', 'Desc', 'Medium', 3, config2);
            gameLevelRepository.addGameLevel(level1);
            gameLevelRepository.addGameLevel(level2);

            const date = new Date();
            statisticsRepository.addStatistics(
                new StudentStatistics('stat-1', 'student-1', 'game-1', 2, 2, 100, 100, 1, true, 2, date, date)
            );

            const progress = await calculator.calculateStudentProgress('student-1', 'game-1');

            expect(progress.totalActivities).toBe(8);
            expect(progress.absoluteActivityNumber).toBe(7);
            expect(progress.percentage).toBe(87.5);
        });

        it('should cap percentage at 100', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-1', 1, 'Level 1', 'Desc', 'Easy', 5, config);
            gameLevelRepository.addGameLevel(level);

            const date = new Date();
            statisticsRepository.addStatistics(
                new StudentStatistics('stat-1', 'student-1', 'game-1', 1, 10, 100, 100, 1, true, 1, date, date)
            );

            const progress = await calculator.calculateStudentProgress('student-1', 'game-1');

            expect(progress.percentage).toBeLessThanOrEqual(100);
        });

        it('should handle errors gracefully when getTotalActivitiesCount fails', async () => {
            const date = new Date();
            statisticsRepository.addStatistics(
                new StudentStatistics('stat-1', 'student-1', 'game-1', 1, 3, 100, 100, 1, true, 1, date, date)
            );

            const originalMethod = gameLevelRepository.getTotalActivitiesCount.bind(gameLevelRepository);
            gameLevelRepository.getTotalActivitiesCount = async () => {
                throw new Error('DB Error');
            };

            const progress = await calculator.calculateStudentProgress('student-1', 'game-1');

            expect(progress.percentage).toBe(0);
            expect(progress.absoluteActivityNumber).toBe(3);
            expect(progress.totalActivities).toBe(0);

            gameLevelRepository.getTotalActivitiesCount = originalMethod;
        });
    });

    describe('calculateAbsoluteActivityNumber', () => {
        it('should calculate absolute activity number correctly', async () => {
            const config1: GameLevelConfig = { min: 1, max: 50 };
            const config2: GameLevelConfig = { min: 51, max: 100 };
            const level1 = new GameLevel('level-1', 'game-1', 1, 'Level 1', 'Desc', 'Easy', 5, config1);
            const level2 = new GameLevel('level-2', 'game-1', 2, 'Level 2', 'Desc', 'Medium', 3, config2);
            gameLevelRepository.addGameLevel(level1);
            gameLevelRepository.addGameLevel(level2);

            const result = await calculator.calculateAbsoluteActivityNumber('game-1', { level: 2, activity: 2 });

            expect(result).toBe(7);
        });

        it('should handle errors and return activity number', async () => {
            const originalMethod = gameLevelRepository.findByGameId.bind(gameLevelRepository);
            gameLevelRepository.findByGameId = async () => {
                throw new Error('DB Error');
            };

            const result = await calculator.calculateAbsoluteActivityNumber('game-1', { level: 2, activity: 5 });

            expect(result).toBe(5);

            gameLevelRepository.findByGameId = originalMethod;
        });
    });

    describe('calculateMaxUnlockedLevel', () => {
        it('should return 1 when no activities completed', async () => {
            const result = await calculator.calculateMaxUnlockedLevel('student-1', 'game-1');
            expect(result).toBe(1);
        });

        it('should return last completed level when activity < activitiesCount', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-1', 1, 'Level 1', 'Desc', 'Easy', 5, config);
            gameLevelRepository.addGameLevel(level);

            const date = new Date();
            statisticsRepository.addStatistics(
                new StudentStatistics('stat-1', 'student-1', 'game-1', 1, 3, 100, 100, 1, true, 1, date, date)
            );

            const result = await calculator.calculateMaxUnlockedLevel('student-1', 'game-1');
            expect(result).toBe(1);
        });

        it('should unlock next level when activity >= activitiesCount', async () => {
            const config1: GameLevelConfig = { min: 1, max: 50 };
            const config2: GameLevelConfig = { min: 51, max: 100 };
            const level1 = new GameLevel('level-1', 'game-1', 1, 'Level 1', 'Desc', 'Easy', 5, config1);
            const level2 = new GameLevel('level-2', 'game-1', 2, 'Level 2', 'Desc', 'Medium', 3, config2);
            gameLevelRepository.addGameLevel(level1);
            gameLevelRepository.addGameLevel(level2);

            const date = new Date();
            statisticsRepository.addStatistics(
                new StudentStatistics('stat-1', 'student-1', 'game-1', 1, 5, 100, 100, 1, true, 1, date, date)
            );

            const result = await calculator.calculateMaxUnlockedLevel('student-1', 'game-1');
            expect(result).toBe(2);
        });

        it('should return level + 1 when no next level exists', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-1', 1, 'Level 1', 'Desc', 'Easy', 5, config);
            gameLevelRepository.addGameLevel(level);

            const date = new Date();
            statisticsRepository.addStatistics(
                new StudentStatistics('stat-1', 'student-1', 'game-1', 1, 5, 100, 100, 1, true, 1, date, date)
            );

            const result = await calculator.calculateMaxUnlockedLevel('student-1', 'game-1');
            expect(result).toBe(2);
        });

        it('should handle empty levels array', async () => {
            const date = new Date();
            statisticsRepository.addStatistics(
                new StudentStatistics('stat-1', 'student-1', 'game-1', 3, 2, 100, 100, 1, true, 3, date, date)
            );

            const result = await calculator.calculateMaxUnlockedLevel('student-1', 'game-1');
            expect(result).toBe(3);
        });

        it('should handle level not found', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-1', 1, 'Level 1', 'Desc', 'Easy', 5, config);
            gameLevelRepository.addGameLevel(level);

            const date = new Date();
            statisticsRepository.addStatistics(
                new StudentStatistics('stat-1', 'student-1', 'game-1', 5, 2, 100, 100, 1, true, 5, date, date)
            );

            const result = await calculator.calculateMaxUnlockedLevel('student-1', 'game-1');
            expect(result).toBe(5);
        });

        it('should handle errors gracefully when findByGameId fails', async () => {
            const date = new Date();
            statisticsRepository.addStatistics(
                new StudentStatistics('stat-1', 'student-1', 'game-1', 2, 3, 100, 100, 1, true, 2, date, date)
            );

            const originalMethod = gameLevelRepository.findByGameId.bind(gameLevelRepository);
            gameLevelRepository.findByGameId = async () => {
                throw new Error('DB Error');
            };

            const result = await calculator.calculateMaxUnlockedLevel('student-1', 'game-1');
            expect(result).toBe(2);

            gameLevelRepository.findByGameId = originalMethod;
        });
    });
});

