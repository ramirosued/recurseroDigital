import { AssignTeacherToCoursesUseCase, AssignTeacherToCoursesRequest } from '../../../src/core/usecases/AssignTeacherToCourseUseCase';
import { MockTeacherRepository } from '../../mocks/TeacherRepository.mock';
import { MockCourseRepository } from '../../mocks/CourseRepository.mock';
import { Teacher } from '../../../src/core/models/Teacher';
import { User, UserRole } from '../../../src/core/models/User';
import { Course } from '../../../src/core/models/Course';

describe('AssignTeacherToCoursesUseCase', () => {
    let assignTeacherToCoursesUseCase: AssignTeacherToCoursesUseCase;
    let mockTeacherRepository: MockTeacherRepository;
    let mockCourseRepository: MockCourseRepository;

    beforeEach(() => {
        mockTeacherRepository = new MockTeacherRepository();
        mockCourseRepository = new MockCourseRepository();
        assignTeacherToCoursesUseCase = new AssignTeacherToCoursesUseCase(
            mockCourseRepository,
            mockTeacherRepository
        );
    });

    afterEach(() => {
        mockTeacherRepository.clearTeachers();
        mockCourseRepository.clearCourses();
    });

    describe('When execute', () => {
        it('should assign teacher to courses successfully', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const course1 = new Course('course-1', 'Matemáticas', '', []);
            const course2 = new Course('course-2', 'Lengua', '', []);
            await mockCourseRepository.addCourse(course1);
            await mockCourseRepository.addCourse(course2);

            const request: AssignTeacherToCoursesRequest = {
                teacherId: 'teacher-1',
                courseIds: ['course-1', 'course-2']
            };

            await assignTeacherToCoursesUseCase.execute(request);

            const courses = await mockCourseRepository.getCoursesByTeacherId('teacher-1');
            expect(courses.length).toBeGreaterThanOrEqual(2);
        });

        it('should throw error when teacherId is not provided', async () => {
            const request: AssignTeacherToCoursesRequest = {
                teacherId: '',
                courseIds: ['course-1']
            };

            await expect(assignTeacherToCoursesUseCase.execute(request))
                .rejects
                .toThrow('Teacher ID es requerido');
        });

        it('should throw error when courseIds is empty', async () => {
            const request: AssignTeacherToCoursesRequest = {
                teacherId: 'teacher-1',
                courseIds: []
            };

            await expect(assignTeacherToCoursesUseCase.execute(request))
                .rejects
                .toThrow('CourseId es requerido');
        });

        it('should throw error when teacher does not exist', async () => {
            const course = new Course('course-1', 'Matemáticas', '', []);
            await mockCourseRepository.addCourse(course);

            const request: AssignTeacherToCoursesRequest = {
                teacherId: 'non-existent',
                courseIds: ['course-1']
            };

            await expect(assignTeacherToCoursesUseCase.execute(request))
                .rejects
                .toThrow('Profesor no encontrado');
        });

        it('should throw error when course does not exist', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const request: AssignTeacherToCoursesRequest = {
                teacherId: 'teacher-1',
                courseIds: ['non-existent']
            };

            await expect(assignTeacherToCoursesUseCase.execute(request))
                .rejects
                .toThrow('Curso con ID non-existent no encontrado');
        });
    });
});


