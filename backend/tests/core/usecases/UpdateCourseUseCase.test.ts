import { UpdateCourseUseCase, UpdateCourseRequest } from '../../../src/core/usecases/UpdateCourseUseCase';
import { MockCourseRepository } from '../../mocks/CourseRepository.mock';
import { Course } from '../../../src/core/models/Course';

describe('UpdateCourseUseCase', () => {
    let updateCourseUseCase: UpdateCourseUseCase;
    let mockCourseRepository: MockCourseRepository;

    beforeEach(() => {
        mockCourseRepository = new MockCourseRepository();
        updateCourseUseCase = new UpdateCourseUseCase(mockCourseRepository);
    });

    afterEach(() => {
        mockCourseRepository.clearCourses();
    });

    describe('When execute', () => {
        it('should update course successfully', async () => {
            const course = new Course('course-1', 'Matemáticas', 'teacher-1', []);
            await mockCourseRepository.addCourse(course);

            const request: UpdateCourseRequest = {
                courseId: 'course-1',
                name: 'Matemáticas Avanzadas'
            };

            const result = await updateCourseUseCase.execute(request);

            expect(result.id).toBe('course-1');
            expect(result.name).toBe('Matemáticas Avanzadas');
            expect(result.teacherId).toBe('teacher-1');

            const updatedCourse = await mockCourseRepository.findById('course-1');
            expect(updatedCourse?.name).toBe('Matemáticas Avanzadas');
        });

        it('should throw error when name is not provided', async () => {
            const course = new Course('course-1', 'Matemáticas', 'teacher-1', []);
            await mockCourseRepository.addCourse(course);

            const request: UpdateCourseRequest = {
                courseId: 'course-1',
                name: ''
            };

            await expect(updateCourseUseCase.execute(request))
                .rejects
                .toThrow('El nombre del curso es requerido');
        });

        it('should throw error when name has less than 2 characters', async () => {
            const course = new Course('course-1', 'Matemáticas', 'teacher-1', []);
            await mockCourseRepository.addCourse(course);

            const request: UpdateCourseRequest = {
                courseId: 'course-1',
                name: 'A'
            };

            await expect(updateCourseUseCase.execute(request))
                .rejects
                .toThrow('El nombre del curso debe tener al menos 2 caracteres');
        });

        it('should throw error when course does not exist', async () => {
            const request: UpdateCourseRequest = {
                courseId: 'non-existent',
                name: 'Nuevo Nombre'
            };

            await expect(updateCourseUseCase.execute(request))
                .rejects
                .toThrow('El curso no existe');
        });

        it('should throw error when course name already exists', async () => {
            const course1 = new Course('course-1', 'Matemáticas', 'teacher-1', []);
            const course2 = new Course('course-2', 'Lengua', 'teacher-1', []);
            await mockCourseRepository.addCourse(course1);
            await mockCourseRepository.addCourse(course2);

            const request: UpdateCourseRequest = {
                courseId: 'course-1',
                name: 'Lengua'
            };

            await expect(updateCourseUseCase.execute(request))
                .rejects
                .toThrow('Ya existe un curso con ese nombre');
        });

        it('should trim whitespace from name', async () => {
            const course = new Course('course-1', 'Matemáticas', 'teacher-1', []);
            await mockCourseRepository.addCourse(course);

            const request: UpdateCourseRequest = {
                courseId: 'course-1',
                name: '  Matemáticas Avanzadas  '
            };

            const result = await updateCourseUseCase.execute(request);

            expect(result.name).toBe('Matemáticas Avanzadas');
        });
    });
});


