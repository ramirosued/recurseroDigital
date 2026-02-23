import { GetCourseProgressByGameUseCase, GetCourseProgressByGameRequest } from '../../../src/core/usecases/GetCourseProgressByGameUseCase';
import { MockStudentRepository } from '../../mocks/StudentRepository.mock';
import { MockStudentStatisticsRepository } from '../../mocks/StudentStatisticsRepository.mock';
import { MockGameLevelRepository } from '../../mocks/GameLevelRepository.mock';
import { MockCourseRepository } from '../../mocks/CourseRepository.mock';
import { StudentEntity } from '../../../src/infrastructure/entities/StudentEntity';
import { CourseGame } from '../../../src/core/models/CourseGame';
import { Game } from '../../../src/core/models/Game';
import { GameLevel, GameLevelConfig } from '../../../src/core/models/GameLevel';
import { StudentStatistics } from '../../../src/core/models/StudentStatistics';

describe('GetCourseProgressByGameUseCase', () => {
    let getCourseProgressByGameUseCase: GetCourseProgressByGameUseCase;
    let mockStudentRepository: MockStudentRepository;
    let mockStatisticsRepository: MockStudentStatisticsRepository;
    let mockGameLevelRepository: MockGameLevelRepository;
    let mockCourseRepository: MockCourseRepository;

    beforeEach(() => {
        mockStudentRepository = new MockStudentRepository();
        mockStatisticsRepository = new MockStudentStatisticsRepository();
        mockGameLevelRepository = new MockGameLevelRepository();
        mockCourseRepository = new MockCourseRepository();

        getCourseProgressByGameUseCase = new GetCourseProgressByGameUseCase(
            mockStudentRepository,
            mockStatisticsRepository,
            mockGameLevelRepository,
            mockCourseRepository
        );
    });

    afterEach(() => {
        mockStudentRepository.clearStudents();
        mockStatisticsRepository.clearStatistics();
        mockGameLevelRepository.clearGameLevels();
        mockCourseRepository.clearCourses();
    });

    describe('When execute', () => {
        it('should return empty response when course has no games', async () => {
            const entity = new StudentEntity(
                'student-1',
                'user-1',
                'student1',
                'hash',
                'Juan',
                'Pérez',
                '12345678',
                'course-1'
            );
            mockStudentRepository.addStudentEntity(entity);

            const request: GetCourseProgressByGameRequest = {
                courseId: 'course-1'
            };

            const result = await getCourseProgressByGameUseCase.execute(request);

            expect(result.courseId).toBe('course-1');
            expect(result.totalStudents).toBe(1);
            expect(result.progressByGame).toEqual([]);
        });

        it('should return empty response when courseId is not provided', async () => {
            const request: GetCourseProgressByGameRequest = {
                courseId: ''
            };

            await expect(getCourseProgressByGameUseCase.execute(request))
                .rejects
                .toThrow('courseId es requerido');
        });

        it('should calculate progress correctly for students with activities', async () => {
            const entity1 = new StudentEntity(
                'student-1',
                'user-1',
                'student1',
                'hash',
                'Juan',
                'Pérez',
                '12345678',
                'course-1'
            );
            const entity2 = new StudentEntity(
                'student-2',
                'user-2',
                'student2',
                'hash',
                'María',
                'García',
                '87654321',
                'course-1'
            );
            mockStudentRepository.addStudentEntity(entity1);
            mockStudentRepository.addStudentEntity(entity2);

            const game = new Game('game-ordenamiento', 'Ordenamiento', 'Desc', '/img.png', '/route');
            mockCourseRepository.addGame(game);

            const courseGame = new CourseGame('cg-1', 'course-1', 'game-ordenamiento', true, 0, game);
            mockCourseRepository.addCourseGame(courseGame);

            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-ordenamiento', 1, 'Level 1', 'Desc', 'Easy', 5, config);
            mockGameLevelRepository.addGameLevel(level);

            const date = new Date();
            const stats1 = new StudentStatistics(
                'stat-1',
                'student-1',
                'game-ordenamiento',
                1,
                3,
                100,
                100,
                1,
                true,
                1,
                date,
                date
            );
            const stats2 = new StudentStatistics(
                'stat-2',
                'student-2',
                'game-ordenamiento',
                1,
                4,
                100,
                100,
                1,
                true,
                1,
                date,
                date
            );
            mockStatisticsRepository.addStatistics(stats1);
            mockStatisticsRepository.addStatistics(stats2);

            const request: GetCourseProgressByGameRequest = {
                courseId: 'course-1'
            };

            const result = await getCourseProgressByGameUseCase.execute(request);

            expect(result.courseId).toBe('course-1');
            expect(result.totalStudents).toBe(2);
            expect(result.progressByGame.length).toBe(1);
            expect(result.progressByGame[0].gameId).toBe('ordenamiento');
            expect(result.progressByGame[0].averageProgress).toBeGreaterThan(0);
            expect(result.progressByGame[0].studentsWithProgress).toBe(2);
        });

        it('should handle game with no activities', async () => {
            const entity = new StudentEntity(
                'student-1',
                'user-1',
                'student1',
                'hash',
                'Juan',
                'Pérez',
                '12345678',
                'course-1'
            );
            mockStudentRepository.addStudentEntity(entity);

            const game = new Game('game-1', 'Ordenamiento', 'Desc', '/img.png', '/route');
            mockCourseRepository.addGame(game);

            const courseGame = new CourseGame('cg-1', 'course-1', 'game-1', true, 0, game);
            mockCourseRepository.addCourseGame(courseGame);

            const request: GetCourseProgressByGameRequest = {
                courseId: 'course-1'
            };

            const result = await getCourseProgressByGameUseCase.execute(request);

            expect(result.progressByGame.length).toBe(1);
            expect(result.progressByGame[0].averageProgress).toBe(0);
            expect(result.progressByGame[0].studentsWithProgress).toBe(0);
        });

        it('should normalize game IDs correctly', async () => {
            const entity = new StudentEntity(
                'student-1',
                'user-1',
                'student1',
                'hash',
                'Juan',
                'Pérez',
                '12345678',
                'course-1'
            );
            mockStudentRepository.addStudentEntity(entity);

            const game = new Game('game-1', 'Ordenamiento', 'Desc', '/img.png', '/route');
            mockCourseRepository.addGame(game);

            const courseGame = new CourseGame('cg-1', 'course-1', 'game-ordenamiento', true, 0, game);
            mockCourseRepository.addCourseGame(courseGame);

            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-ordenamiento', 1, 'Level 1', 'Desc', 'Easy', 5, config);
            mockGameLevelRepository.addGameLevel(level);

            const date = new Date();
            const stats = new StudentStatistics(
                'stat-1',
                'student-1',
                'game-ordenamiento',
                1,
                2,
                100,
                100,
                1,
                true,
                1,
                date,
                date
            );
            mockStatisticsRepository.addStatistics(stats);

            const request: GetCourseProgressByGameRequest = {
                courseId: 'course-1'
            };

            const result = await getCourseProgressByGameUseCase.execute(request);

            expect(result.progressByGame[0].gameId).toBe('ordenamiento');
        });
    });
});

