import { UpdateCourseGameStatusUseCase, UpdateCourseGameStatusRequest } from '../../../src/core/usecases/UpdateCourseGameStatusUseCase';
import { CourseRepository } from '../../../src/core/infrastructure/CourseRepository';

class MockCourseRepository implements CourseRepository {
    private courseGameStatuses: Map<string, boolean> = new Map();

    async findByCourseName(): Promise<any> {
        return null;
    }

    async addCourse(): Promise<void> {
    }

    async getAllCourses(): Promise<any[]> {
        return [];
    }

    async findById(): Promise<any> {
        return null;
    }

    async getEnabledGamesByCourseId(): Promise<any[]> {
        return [];
    }

    async getAllGamesByCourseId(): Promise<any[]> {
        return [];
    }

    async getAllGames(): Promise<any[]> {
        return [];
    }

    async updateCourseGameStatus(courseGameId: string, isEnabled: boolean): Promise<void> {
        this.courseGameStatuses.set(courseGameId, isEnabled);
    }

    async addGameToCourse(): Promise<void> {
    }

    async createCourse(): Promise<any> {
        return { id: 'course-1', name: 'Test Course', teacher_id: '', students: [] };
    }

    async assignTeacherToCourse(): Promise<void> {
    }

    async getCoursesByTeacherId(): Promise<any[]> {
        return [];
    }

    async updateCourse(): Promise<void> {
    }

    async deleteCourse(): Promise<void> {
    }

    getCourseGameStatus(courseGameId: string): boolean | undefined {
        return this.courseGameStatuses.get(courseGameId);
    }

    clearStatuses(): void {
        this.courseGameStatuses.clear();
    }
}

describe('UpdateCourseGameStatusUseCase', () => {
    let updateCourseGameStatusUseCase: UpdateCourseGameStatusUseCase;
    let mockCourseRepository: MockCourseRepository;

    beforeEach(() => {
        mockCourseRepository = new MockCourseRepository();
        updateCourseGameStatusUseCase = new UpdateCourseGameStatusUseCase(mockCourseRepository);
    });

    afterEach(() => {
        mockCourseRepository.clearStatuses();
    });

    describe('When execute', () => {
        it('should enable course game successfully', async () => {
            const request: UpdateCourseGameStatusRequest = {
                courseGameId: 'course-game-123',
                isEnabled: true
            };

            await updateCourseGameStatusUseCase.execute(request);

            const status = mockCourseRepository.getCourseGameStatus('course-game-123');
            expect(status).toBe(true);
        });

        it('should disable course game successfully', async () => {
            const request: UpdateCourseGameStatusRequest = {
                courseGameId: 'course-game-123',
                isEnabled: false
            };

            await updateCourseGameStatusUseCase.execute(request);

            const status = mockCourseRepository.getCourseGameStatus('course-game-123');
            expect(status).toBe(false);
        });

        it('should throw error when courseGameId is empty', async () => {
            const request: UpdateCourseGameStatusRequest = {
                courseGameId: '',
                isEnabled: true
            };

            await expect(updateCourseGameStatusUseCase.execute(request))
                .rejects
                .toThrow('courseGameId es requerido');
        });

        it('should throw error when courseGameId is only whitespace', async () => {
            const request: UpdateCourseGameStatusRequest = {
                courseGameId: '   ',
                isEnabled: true
            };

            await expect(updateCourseGameStatusUseCase.execute(request))
                .rejects
                .toThrow('courseGameId es requerido');
        });

        it('should throw error when isEnabled is not a boolean', async () => {
            const request = {
                courseGameId: 'course-game-123',
                isEnabled: 'true' as any
            };

            await expect(updateCourseGameStatusUseCase.execute(request))
                .rejects
                .toThrow('isEnabled debe ser un valor booleano');
        });
    });
});

