import { StudentStatistics } from '../../../src/core/models/StudentStatistics';

describe('StudentStatistics Model', () => {
    let statistics: StudentStatistics;

    beforeEach(() => {
        statistics = new StudentStatistics(
            'stat-1',
            'student-1',
            'game-1',
            1,
            1,
            100,
            100,
            1,
            true,
            1,
            new Date('2024-01-01'),
            new Date('2024-01-01'),
            10,
            10,
            30
        );
    });

    describe('Constructor', () => {
        it('should create statistics with all properties', () => {
            expect(statistics.id).toBe('stat-1');
            expect(statistics.studentId).toBe('student-1');
            expect(statistics.gameId).toBe('game-1');
            expect(statistics.level).toBe(1);
            expect(statistics.activity).toBe(1);
            expect(statistics.points).toBe(100);
            expect(statistics.totalPoints).toBe(100);
            expect(statistics.attempts).toBe(1);
            expect(statistics.isCompleted).toBe(true);
            expect(statistics.maxUnlockedLevel).toBe(1);
            expect(statistics.correctAnswers).toBe(10);
            expect(statistics.totalQuestions).toBe(10);
            expect(statistics.completionTime).toBe(30);
        });

        it('should create statistics without optional fields', () => {
            const stats = new StudentStatistics(
                'stat-2',
                'student-1',
                'game-1',
                1,
                1,
                50,
                50,
                1,
                false,
                1,
                new Date(),
                new Date()
            );

            expect(stats.correctAnswers).toBeUndefined();
            expect(stats.totalQuestions).toBeUndefined();
            expect(stats.completionTime).toBeUndefined();
        });
    });

    describe('getAccuracy', () => {
        it('should return correct accuracy when totalQuestions exists', () => {
            expect(statistics.getAccuracy()).toBe(1);
        });

        it('should return 0 when totalQuestions is 0', () => {
            const stats = new StudentStatistics(
                'stat-2',
                'student-1',
                'game-1',
                1,
                1,
                50,
                50,
                1,
                false,
                1,
                new Date(),
                new Date(),
                5,
                0
            );
            expect(stats.getAccuracy()).toBe(0);
        });

        it('should return 0 when totalQuestions is undefined', () => {
            const stats = new StudentStatistics(
                'stat-2',
                'student-1',
                'game-1',
                1,
                1,
                50,
                50,
                1,
                false,
                1,
                new Date(),
                new Date()
            );
            expect(stats.getAccuracy()).toBe(0);
        });

        it('should handle correctAnswers as undefined', () => {
            const stats = new StudentStatistics(
                'stat-2',
                'student-1',
                'game-1',
                1,
                1,
                50,
                50,
                1,
                false,
                1,
                new Date(),
                new Date(),
                undefined,
                10
            );
            expect(stats.getAccuracy()).toBe(0);
        });

        it('should calculate partial accuracy correctly', () => {
            const stats = new StudentStatistics(
                'stat-2',
                'student-1',
                'game-1',
                1,
                1,
                50,
                50,
                1,
                false,
                1,
                new Date(),
                new Date(),
                7,
                10
            );
            expect(stats.getAccuracy()).toBe(0.7);
        });
    });

    describe('getSuccessRate', () => {
        it('should return accuracy multiplied by 100', () => {
            expect(statistics.getSuccessRate()).toBe(100);
        });

        it('should return 0 when accuracy is 0', () => {
            const stats = new StudentStatistics(
                'stat-2',
                'student-1',
                'game-1',
                1,
                1,
                50,
                50,
                1,
                false,
                1,
                new Date(),
                new Date()
            );
            expect(stats.getSuccessRate()).toBe(0);
        });
    });

    describe('getAverageTimePerQuestion', () => {
        it('should calculate average time correctly', () => {
            expect(statistics.getAverageTimePerQuestion()).toBe(3);
        });

        it('should return 0 when completionTime is undefined', () => {
            const stats = new StudentStatistics(
                'stat-2',
                'student-1',
                'game-1',
                1,
                1,
                50,
                50,
                1,
                false,
                1,
                new Date(),
                new Date(),
                10,
                10
            );
            expect(stats.getAverageTimePerQuestion()).toBe(0);
        });

        it('should return 0 when totalQuestions is 0', () => {
            const stats = new StudentStatistics(
                'stat-2',
                'student-1',
                'game-1',
                1,
                1,
                50,
                50,
                1,
                false,
                1,
                new Date(),
                new Date(),
                5,
                0,
                30
            );
            expect(stats.getAverageTimePerQuestion()).toBe(0);
        });

        it('should return 0 when totalQuestions is undefined', () => {
            const stats = new StudentStatistics(
                'stat-2',
                'student-1',
                'game-1',
                1,
                1,
                50,
                50,
                1,
                false,
                1,
                new Date(),
                new Date(),
                undefined,
                undefined,
                30
            );
            expect(stats.getAverageTimePerQuestion()).toBe(0);
        });
    });

    describe('isLevelCompleted', () => {
        it('should return true when level is completed and level <= maxUnlockedLevel', () => {
            expect(statistics.isLevelCompleted()).toBe(true);
        });

        it('should return false when not completed', () => {
            const stats = new StudentStatistics(
                'stat-2',
                'student-1',
                'game-1',
                1,
                1,
                50,
                50,
                1,
                false,
                1,
                new Date(),
                new Date()
            );
            expect(stats.isLevelCompleted()).toBe(false);
        });

        it('should return false when level > maxUnlockedLevel', () => {
            const stats = new StudentStatistics(
                'stat-2',
                'student-1',
                'game-1',
                5,
                1,
                50,
                50,
                1,
                true,
                1,
                new Date(),
                new Date()
            );
            expect(stats.isLevelCompleted()).toBe(false);
        });
    });

    describe('updateProgress', () => {
        it('should update points, totalPoints, attempts and isCompleted', () => {
            const initialPoints = statistics.points;
            const initialTotalPoints = statistics.totalPoints;
            const initialAttempts = statistics.attempts;

            statistics.updateProgress(50, 1, true);

            expect(statistics.points).toBe(initialPoints + 50);
            expect(statistics.totalPoints).toBe(initialTotalPoints + 50);
            expect(statistics.attempts).toBe(initialAttempts + 1);
            expect(statistics.isCompleted).toBe(true);
            expect(statistics.updatedAt).toBeInstanceOf(Date);
        });

        it('should update with isCompleted defaulting to false', () => {
            statistics.updateProgress(25, 2);

            expect(statistics.points).toBe(125);
            expect(statistics.totalPoints).toBe(125);
            expect(statistics.attempts).toBe(3);
            expect(statistics.isCompleted).toBe(false);
        });
    });
});


