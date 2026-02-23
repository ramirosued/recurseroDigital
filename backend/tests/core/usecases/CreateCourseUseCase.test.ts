import { CreateCourseUseCase, CreateCourseRequest } from '../../../src/core/usecases/CreateCourseUseCase';
import { CourseRepository } from '../../../src/core/infrastructure/CourseRepository';
import { Course } from '../../../src/core/models/Course';
import { Game } from '../../../src/core/models/Game';

class MockCourseRepository implements CourseRepository {
    private courses: Course[] = [];
    private games: Game[] = [];
    private courseGames: { courseId: string; gameId: string; isEnabled: boolean }[] = [];

    constructor() {
        this.games = [
            new Game('game-1', 'Juego 1', 'Descripción 1', 'image1.jpg', '/route1', 1, true),
            new Game('game-2', 'Juego 2', 'Descripción 2', 'image2.jpg', '/route2', 2, true),
            new Game('game-3', 'Juego 3', 'Descripción 3', 'image3.jpg', '/route3', 3, true)
        ];
    }

    async findByCourseName(courseName: string): Promise<Course | null> {
        return this.courses.find(c => c.name === courseName) || null;
    }

    async addCourse(courseData: Course): Promise<void> {
        this.courses.push(courseData);
        for (let i = 0; i < this.games.length; i++) {
            const courseGameId = `course_game_${courseData.id}_${i}`;
            await this.addGameToCourse(courseGameId, courseData.id, this.games[i].id);
        }
    }

    async getAllCourses(): Promise<Course[]> {
        return [...this.courses];
    }

    async findById(id: string): Promise<Course | null> {
        return this.courses.find(c => c.id === id) || null;
    }

    async getEnabledGamesByCourseId(courseId: string): Promise<any[]> {
        return [];
    }

    async getAllGamesByCourseId(courseId: string): Promise<any[]> {
        return [];
    }

    async getAllGames(): Promise<Game[]> {
        return [...this.games];
    }

    async updateCourseGameStatus(courseGameId: string, isEnabled: boolean): Promise<void> {
        const courseGame = this.courseGames.find(cg => cg.courseId === courseGameId || cg.gameId === courseGameId);
        if (courseGame) {
            courseGame.isEnabled = isEnabled;
        }
    }

    async addGameToCourse(courseGameId: string, courseId: string, gameId: string): Promise<void> {
        this.courseGames.push({ courseId, gameId, isEnabled: false });
    }

    async createCourse(name: string, teacherId?: string): Promise<Course> {
        const courseId = `course-${Date.now()}`;
        const course = new Course(courseId, name, teacherId || '', []);

        for (let i = 0; i < this.games.length; i++) {
            const courseGameId = `course_game_${courseId}_${i}`;
            await this.addGameToCourse(courseGameId, courseId, this.games[i].id);
        }

        this.courses.push(course);
        return course;
    }

    async assignTeacherToCourse(teacherId: string, courseId: string): Promise<void> {
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
            course.teacher_id = teacherId;
        }
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

    getCourseGames(courseId: string): { courseId: string; gameId: string; isEnabled: boolean }[] {
        return this.courseGames.filter(cg => cg.courseId === courseId);
    }

    clearCourses(): void {
        this.courses = [];
        this.courseGames = [];
    }
}

describe('CreateCourseUseCase', () => {
    let createCourseUseCase: CreateCourseUseCase;
    let mockCourseRepository: MockCourseRepository;

    beforeEach(() => {
        mockCourseRepository = new MockCourseRepository();
        
        createCourseUseCase = new CreateCourseUseCase(
            mockCourseRepository
        );
    });

    afterEach(() => {
        mockCourseRepository.clearCourses();
    });

    describe('When execute', () => {
        it('should create course successfully', async () => {
            const request: CreateCourseRequest = {
                name: '3º A'
            };

            const result = await createCourseUseCase.execute(request);

            expect(result.name).toBe('3º A');
            expect(result.id).toBeDefined();
            expect(result.teacherId).toBe('');
        });

        it('should create course with teacherId', async () => {
            const request: CreateCourseRequest = {
                name: '3º B',
                teacherId: 'teacher-123'
            };

            const result = await createCourseUseCase.execute(request);

            expect(result.name).toBe('3º B');
            expect(result.teacherId).toBe('teacher-123');
        });

        it('should throw error when name is empty', async () => {
            const request: CreateCourseRequest = {
                name: ''
            };

            await expect(createCourseUseCase.execute(request))
                .rejects
                .toThrow('El nombre del curso es requerido');
        });

        it('should throw error when name is only whitespace', async () => {
            const request: CreateCourseRequest = {
                name: '   '
            };

            await expect(createCourseUseCase.execute(request))
                .rejects
                .toThrow('El nombre del curso es requerido');
        });

        it('should throw error when course name already exists', async () => {
            const request: CreateCourseRequest = {
                name: '3º A'
            };

            await createCourseUseCase.execute(request);

            await expect(createCourseUseCase.execute(request))
                .rejects
                .toThrow('Ya existe un curso con ese nombre');
        });

        it('should trim course name', async () => {
            const request: CreateCourseRequest = {
                name: '  3º A  '
            };

            const result = await createCourseUseCase.execute(request);

            expect(result.name).toBe('3º A');
        });
    });

    describe('Course-Game relationship', () => {
        it('should create course games entries for all existing games when course is created', async () => {
            const request: CreateCourseRequest = {
                name: '3º A'
            };

            const result = await createCourseUseCase.execute(request);

            const courseGames = mockCourseRepository.getCourseGames(result.id);
            expect(courseGames.length).toBeGreaterThan(0);
            expect(courseGames.every(cg => cg.isEnabled === false)).toBe(true);
        });
    });
});

