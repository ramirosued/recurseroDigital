import { AssignCourseToStudentUseCase, AssignCourseToStudentRequest } from '../../../src/core/usecases/AssignCourseToStudentUseCase';
import { MockStudentRepository } from '../../mocks/StudentRepository.mock';
import { MockCourseRepository } from '../../mocks/CourseRepository.mock';
import { StudentEntity } from '../../../src/infrastructure/entities/StudentEntity';
import { Course } from '../../../src/core/models/Course';

describe('AssignCourseToStudentUseCase', () => {
    let assignCourseToStudentUseCase: AssignCourseToStudentUseCase;
    let mockStudentRepository: MockStudentRepository;
    let mockCourseRepository: MockCourseRepository;

    beforeEach(() => {
        mockStudentRepository = new MockStudentRepository();
        mockCourseRepository = new MockCourseRepository();
        assignCourseToStudentUseCase = new AssignCourseToStudentUseCase(
            mockStudentRepository,
            mockCourseRepository
        );
    });

    afterEach(() => {
        mockStudentRepository.clearStudents();
        mockCourseRepository.clearCourses();
    });

    describe('When execute', () => {
        it('should assign course to student successfully', async () => {
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

            const course = new Course('course-1', 'Matemáticas', 'teacher-1', []);
            await mockCourseRepository.addCourse(course);

            const request: AssignCourseToStudentRequest = {
                studentId: 'student-1',
                courseId: 'course-1'
            };

            await assignCourseToStudentUseCase.execute(request);

            const student = await mockStudentRepository.findById('student-1');
            expect(student?.courseId).toBe('course-1');
        });

        it('should throw error when studentId is not provided', async () => {
            const request: AssignCourseToStudentRequest = {
                studentId: '',
                courseId: 'course-1'
            };

            await expect(assignCourseToStudentUseCase.execute(request))
                .rejects
                .toThrow('studentId y courseId son requeridos');
        });

        it('should throw error when courseId is not provided', async () => {
            const request: AssignCourseToStudentRequest = {
                studentId: 'student-1',
                courseId: ''
            };

            await expect(assignCourseToStudentUseCase.execute(request))
                .rejects
                .toThrow('studentId y courseId son requeridos');
        });

        it('should throw error when student does not exist', async () => {
            const course = new Course('course-1', 'Matemáticas', 'teacher-1', []);
            await mockCourseRepository.addCourse(course);

            const request: AssignCourseToStudentRequest = {
                studentId: 'non-existent',
                courseId: 'course-1'
            };

            await expect(assignCourseToStudentUseCase.execute(request))
                .rejects
                .toThrow('Estudiante no encontrado');
        });

        it('should throw error when course does not exist', async () => {
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

            const request: AssignCourseToStudentRequest = {
                studentId: 'student-1',
                courseId: 'non-existent'
            };

            await expect(assignCourseToStudentUseCase.execute(request))
                .rejects
                .toThrow('Curso no encontrado');
        });
    });
});


