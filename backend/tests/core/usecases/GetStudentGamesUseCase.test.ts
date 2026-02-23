import { GetStudentGamesUseCase, GetStudentGamesRequest } from '../../../src/core/usecases/GetStudentGamesUseCase';
import { MockStudentRepository } from '../../mocks/StudentRepository.mock';
import { MockCourseRepository } from '../../mocks/CourseRepository.mock';
import { StudentEntity } from '../../../src/infrastructure/entities/StudentEntity';
import { CourseGame } from '../../../src/core/models/CourseGame';
import { Game } from '../../../src/core/models/Game';
import { StudentNotFoundError } from '../../../src/core/models/exceptions/StudentNotFoundError';
import { StudentInvalidRequestError } from '../../../src/core/models/exceptions/StudentInvalidRequestError';

describe('GetStudentGamesUseCase', () => {
    let getStudentGamesUseCase: GetStudentGamesUseCase;
    let mockStudentRepository: MockStudentRepository;
    let mockCourseRepository: MockCourseRepository;

    beforeEach(() => {
        mockStudentRepository = new MockStudentRepository();
        mockCourseRepository = new MockCourseRepository();
        getStudentGamesUseCase = new GetStudentGamesUseCase(
            mockStudentRepository,
            mockCourseRepository
        );
    });

    afterEach(() => {
        mockStudentRepository.clearStudents();
        mockCourseRepository.clearCourses();
    });

    describe('When execute', () => {
        it('should return enabled games for student with course', async () => {
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

            const request: GetStudentGamesRequest = {
                studentId: 'student-1'
            };

            const result = await getStudentGamesUseCase.execute(request);

            expect(result.studentId).toBe('student-1');
            expect(result.courseId).toBe('course-1');
            expect(result.games.length).toBe(1);
            expect(result.games[0].gameId).toBe('game-1');
        });

        it('should return empty games array when student has no course', async () => {
            const entity = new StudentEntity(
                'student-1',
                'user-1',
                'student1',
                'hash',
                'Juan',
                'Pérez',
                '12345678',
                null
            );
            mockStudentRepository.addStudentEntity(entity);

            const request: GetStudentGamesRequest = {
                studentId: 'student-1'
            };

            const result = await getStudentGamesUseCase.execute(request);

            expect(result.studentId).toBe('student-1');
            expect(result.courseId).toBeNull();
            expect(result.games).toEqual([]);
        });

        it('should throw error when studentId is not provided', async () => {
            const request: GetStudentGamesRequest = {
                studentId: ''
            };

            await expect(getStudentGamesUseCase.execute(request))
                .rejects
                .toThrow(StudentInvalidRequestError);

            await expect(getStudentGamesUseCase.execute(request))
                .rejects
                .toThrow('studentId es requerido');
        });

        it('should throw error when request is null', async () => {
            await expect(getStudentGamesUseCase.execute(null as any))
                .rejects
                .toThrow(StudentInvalidRequestError);
        });

        it('should throw error when student does not exist', async () => {
            const request: GetStudentGamesRequest = {
                studentId: 'non-existent'
            };

            await expect(getStudentGamesUseCase.execute(request))
                .rejects
                .toThrow(StudentNotFoundError);
        });

        it('should return only enabled games', async () => {
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

            const game1 = new Game('game-1', 'Game 1', 'Desc', '/img.png', '/route');
            const game2 = new Game('game-2', 'Game 2', 'Desc', '/img.png', '/route');
            mockCourseRepository.addGame(game1);
            mockCourseRepository.addGame(game2);

            const courseGame1 = new CourseGame('cg-1', 'course-1', 'game-1', true, 0, game1);
            const courseGame2 = new CourseGame('cg-2', 'course-1', 'game-2', false, 1, game2);
            mockCourseRepository.addCourseGame(courseGame1);
            mockCourseRepository.addCourseGame(courseGame2);

            const request: GetStudentGamesRequest = {
                studentId: 'student-1'
            };

            const result = await getStudentGamesUseCase.execute(request);

            expect(result.games.length).toBe(1);
            expect(result.games[0].gameId).toBe('game-1');
        });
    });
});


