import { AssignGameToCourseUseCase, AssignGameToCourseRequest } from "../../../src/core/usecases/AssignGameToCourseUseCase";
import { CourseRepository } from "../../../src/core/infrastructure/CourseRepository";
import { IdGenerator } from "../../../src/core/infrastructure/IdGenerator";

class MockCourseRepository implements CourseRepository {
    private courseGames: { [courseId: string]: Set<string> } = {};

    async findByCourseName(courseName: string): Promise<any> {
        return null;
    }

    async addCourse(courseData: any): Promise<void> {
        // Mock implementation
    }

    async getAllCourses(): Promise<any[]> {
        return [];
    }

    async findById(id: string): Promise<any> {
        return null;
    }

    async getEnabledGamesByCourseId(courseId: string): Promise<any[]> {
        return [];
    }

    async getAllGamesByCourseId(courseId: string): Promise<any[]> {
        return [];
    }

    async getAllGames(): Promise<any[]> {
        return [];
    }

    async updateCourseGameStatus(courseGameId: string, isEnabled: boolean): Promise<void> {
    }

    async addGameToCourse(courseGameId: string, courseId: string, gameId: string): Promise<void> {
        if (!this.courseGames[courseId]) {
            this.courseGames[courseId] = new Set<string>();
        }
        this.courseGames[courseId].add(gameId);
    }

    async createCourse(name: string, teacherId?: string): Promise<any> {
        return { id: 'mock-id', name, teacher_id: teacherId || '', students: [] };
    }

    getCourseGames(courseId: string): string[] {
        return Array.from(this.courseGames[courseId] || []);
    }

    clearCourseGames(): void {
        this.courseGames = {};
    }

    async assignTeacherToCourse(teacherId: string, courseId: string): Promise<void> {
        // Mock implementation - no hace nada en el mock
    }

    async getCoursesByTeacherId(teacherId: string): Promise<any[]> {
        return [];
    }

    async updateCourse(course: any): Promise<void> {
        // Mock implementation - no hace nada en el mock
    }

    async deleteCourse(id: string): Promise<void> {
        // Mock implementation - no hace nada en el mock
    }
}

class MockIdGenerator implements IdGenerator {
    private counter = 0;

    generate(): string {
        return `mock-id-${++this.counter}`;
    }

    reset(): void {
        this.counter = 0;
    }
}

describe('AssignGameToCourseUseCase', () => {
    let assignGameToCourseUseCase: AssignGameToCourseUseCase;
    let mockCourseRepository: MockCourseRepository;
    let mockIdGenerator: MockIdGenerator;

    beforeEach(() => {
        mockCourseRepository = new MockCourseRepository();
        mockIdGenerator = new MockIdGenerator();
        
        assignGameToCourseUseCase = new AssignGameToCourseUseCase(
            mockCourseRepository,
            mockIdGenerator
        );
    });

    afterEach(() => {
        mockCourseRepository.clearCourseGames();
        mockIdGenerator.reset();
    });

    describe('When execute', () => {
        it('should assign game to course successfully', async () => {
            const request: AssignGameToCourseRequest = {
                courseId: 'course-123',
                gameId: 'game-456'
            };

            await assignGameToCourseUseCase.execute(request);

            const courseGames = mockCourseRepository.getCourseGames('course-123');
            expect(courseGames).toHaveLength(1);
            expect(courseGames[0]).toBe('game-456');
        });

        it('should throw error when courseId is missing', async () => {
            const request: AssignGameToCourseRequest = {
                courseId: '',
                gameId: 'game-456'
            };

            await expect(assignGameToCourseUseCase.execute(request))
                .rejects
                .toThrow('courseId y gameId son requeridos');
        });

        it('should throw error when gameId is missing', async () => {
            const request: AssignGameToCourseRequest = {
                courseId: 'course-123',
                gameId: ''
            };

            await expect(assignGameToCourseUseCase.execute(request))
                .rejects
                .toThrow('courseId y gameId son requeridos');
        });

        it('should generate unique courseGameId for each assignment', async () => {
            const request1: AssignGameToCourseRequest = {
                courseId: 'course-123',
                gameId: 'game-456'
            };

            const request2: AssignGameToCourseRequest = {
                courseId: 'course-123',
                gameId: 'game-789'
            };

            await assignGameToCourseUseCase.execute(request1);
            await assignGameToCourseUseCase.execute(request2);

            const courseGames = mockCourseRepository.getCourseGames('course-123');
            expect(courseGames).toHaveLength(2);
            expect(courseGames).toContain('game-456');
            expect(courseGames).toContain('game-789');
        });
    });
});
