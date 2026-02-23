import { GetAllCourseGamesUseCase, GetAllCourseGamesRequest } from '../../../src/core/usecases/GetAllCourseGamesUseCase';
import { CourseRepository } from '../../../src/core/infrastructure/CourseRepository';
import { Course } from '../../../src/core/models/Course';
import { CourseGame } from '../../../src/core/models/CourseGame';
import { Game } from '../../../src/core/models/Game';

class MockCourseRepository implements CourseRepository {
    private courses: Course[] = [];
    private courseGames: Map<string, CourseGame[]> = new Map();

    async findByCourseName(courseName: string): Promise<Course | null> {
        return this.courses.find(c => c.name === courseName) || null;
    }

    async addCourse(courseData: Course): Promise<void> {
        this.courses.push(courseData);
    }

    async getAllCourses(): Promise<Course[]> {
        return [...this.courses];
    }

    async findById(id: string): Promise<Course | null> {
        return this.courses.find(c => c.id === id) || null;
    }

    async getEnabledGamesByCourseId(courseId: string): Promise<CourseGame[]> {
        const allGames = this.courseGames.get(courseId) || [];
        return allGames.filter(cg => cg.getIsEnabled());
    }

    async getAllGamesByCourseId(courseId: string): Promise<CourseGame[]> {
        const games = this.courseGames.get(courseId) || [];
        return games.sort((a, b) => a.getOrderIndex() - b.getOrderIndex());
    }

    async getAllGames(): Promise<Game[]> {
        return [];
    }

    async updateCourseGameStatus(courseGameId: string, isEnabled: boolean): Promise<void> {
        const games = this.courseGames.get(courseGameId.split('-')[0]) || [];
        const game = games.find(g => g.id === courseGameId);
        if (game) {
            const updatedGame = new CourseGame(
                game.id,
                game.getCourseId(),
                game.getGameId(),
                isEnabled,
                game.getOrderIndex(),
                game.getGame()
            );
            const courseId = game.getCourseId();
            const courseGames = this.courseGames.get(courseId) || [];
            const index = courseGames.findIndex(g => g.id === courseGameId);
            if (index !== -1) {
                courseGames[index] = updatedGame;
                this.courseGames.set(courseId, courseGames);
            }
        }
    }

    async addGameToCourse(courseGameId: string, courseId: string, gameId: string): Promise<void> {
    }

    async createCourse(name: string, teacherId?: string): Promise<Course> {
        const courseId = `course-${Date.now()}`;
        const course = new Course(courseId, name, teacherId || '', []);
        this.courses.push(course);
        return course;
    }

    async assignTeacherToCourse(teacherId: string, courseId: string): Promise<void> {
    }

    async getCoursesByTeacherId(teacherId: string): Promise<Course[]> {
        return this.courses.filter(c => c.teacher_id === teacherId);
    }

    async updateCourse(course: Course): Promise<void> {
        const index = this.courses.findIndex(c => c.id === course.id);
        if (index !== -1) {
            this.courses[index] = course;
        }
    }

    async deleteCourse(id: string): Promise<void> {
        this.courses = this.courses.filter(c => c.id !== id);
    }

    // Helper methods for testing
    addCourseGame(courseId: string, courseGame: CourseGame): void {
        if (!this.courseGames.has(courseId)) {
            this.courseGames.set(courseId, []);
        }
        this.courseGames.get(courseId)!.push(courseGame);
    }

    clearCourses(): void {
        this.courses = [];
        this.courseGames.clear();
    }
}

describe('GetAllCourseGamesUseCase', () => {
    let getAllCourseGamesUseCase: GetAllCourseGamesUseCase;
    let mockCourseRepository: MockCourseRepository;

    beforeEach(() => {
        mockCourseRepository = new MockCourseRepository();
        getAllCourseGamesUseCase = new GetAllCourseGamesUseCase(mockCourseRepository);
    });

    afterEach(() => {
        mockCourseRepository.clearCourses();
    });

    describe('When execute', () => {
        it('should return all games for a course successfully', async () => {
            const course = await mockCourseRepository.createCourse('3º A');
            const game1 = new Game('game-1', 'Juego 1', 'Descripción 1', 'image1.jpg', '/route1', 1, true);
            const game2 = new Game('game-2', 'Juego 2', 'Descripción 2', 'image2.jpg', '/route2', 2, true);
            
            const courseGame1 = new CourseGame('cg-1', course.id, 'game-1', true, 0, game1);
            const courseGame2 = new CourseGame('cg-2', course.id, 'game-2', false, 1, game2);
            
            mockCourseRepository.addCourseGame(course.id, courseGame1);
            mockCourseRepository.addCourseGame(course.id, courseGame2);

            const request: GetAllCourseGamesRequest = {
                courseId: course.id
            };

            const result = await getAllCourseGamesUseCase.execute(request);

            expect(result.courseId).toBe(course.id);
            expect(result.games).toHaveLength(2);
            expect(result.games[0].getGameId()).toBe('game-1');
            expect(result.games[1].getGameId()).toBe('game-2');
        });

        it('should return empty array when course has no games', async () => {
            const course = await mockCourseRepository.createCourse('3º A');

            const request: GetAllCourseGamesRequest = {
                courseId: course.id
            };

            const result = await getAllCourseGamesUseCase.execute(request);

            expect(result.courseId).toBe(course.id);
            expect(result.games).toEqual([]);
        });

        it('should return both enabled and disabled games', async () => {
            const course = await mockCourseRepository.createCourse('3º A');
            const game1 = new Game('game-1', 'Juego 1', 'Descripción 1', 'image1.jpg', '/route1', 1, true);
            const game2 = new Game('game-2', 'Juego 2', 'Descripción 2', 'image2.jpg', '/route2', 2, true);
            
            const courseGame1 = new CourseGame('cg-1', course.id, 'game-1', true, 0, game1);
            const courseGame2 = new CourseGame('cg-2', course.id, 'game-2', false, 1, game2);
            
            mockCourseRepository.addCourseGame(course.id, courseGame1);
            mockCourseRepository.addCourseGame(course.id, courseGame2);

            const request: GetAllCourseGamesRequest = {
                courseId: course.id
            };

            const result = await getAllCourseGamesUseCase.execute(request);

            expect(result.games).toHaveLength(2);
            expect(result.games[0].getIsEnabled()).toBe(true);
            expect(result.games[1].getIsEnabled()).toBe(false);
        });

        it('should throw error when courseId is empty', async () => {
            const request: GetAllCourseGamesRequest = {
                courseId: ''
            };

            await expect(getAllCourseGamesUseCase.execute(request))
                .rejects
                .toThrow('courseId es requerido');
        });

        it('should throw error when courseId is only whitespace', async () => {
            const request: GetAllCourseGamesRequest = {
                courseId: '   '
            };

            await expect(getAllCourseGamesUseCase.execute(request))
                .rejects
                .toThrow('courseId es requerido');
        });

        it('should throw error when course does not exist', async () => {
            const request: GetAllCourseGamesRequest = {
                courseId: 'non-existent-course'
            };

            await expect(getAllCourseGamesUseCase.execute(request))
                .rejects
                .toThrow('El curso no existe');
        });

        it('should return games ordered by orderIndex', async () => {
            const course = await mockCourseRepository.createCourse('3º A');
            const game1 = new Game('game-1', 'Juego 1', 'Descripción 1', 'image1.jpg', '/route1', 1, true);
            const game2 = new Game('game-2', 'Juego 2', 'Descripción 2', 'image2.jpg', '/route2', 2, true);
            const game3 = new Game('game-3', 'Juego 3', 'Descripción 3', 'image3.jpg', '/route3', 3, true);
            
            const courseGame1 = new CourseGame('cg-1', course.id, 'game-1', true, 2, game1);
            const courseGame2 = new CourseGame('cg-2', course.id, 'game-2', true, 0, game2);
            const courseGame3 = new CourseGame('cg-3', course.id, 'game-3', true, 1, game3);
            
            mockCourseRepository.addCourseGame(course.id, courseGame1);
            mockCourseRepository.addCourseGame(course.id, courseGame2);
            mockCourseRepository.addCourseGame(course.id, courseGame3);

            const request: GetAllCourseGamesRequest = {
                courseId: course.id
            };

            const result = await getAllCourseGamesUseCase.execute(request);

            expect(result.games).toHaveLength(3);
            expect(result.games[0].getOrderIndex()).toBe(0);
            expect(result.games[1].getOrderIndex()).toBe(1);
            expect(result.games[2].getOrderIndex()).toBe(2);
        });
    });
});

