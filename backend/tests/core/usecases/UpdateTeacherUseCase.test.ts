import { UpdateTeacherUseCase, UpdateTeacherRequest } from '../../../src/core/usecases/UpdateTeacherUseCase';
import { MockTeacherRepository } from '../../mocks/TeacherRepository.mock';
import { MockStudentRepository } from '../../mocks/StudentRepository.mock';
import { MockAdminRepository } from '../../mocks/AdminRepository.mock';
import { MockCourseRepository } from '../../mocks/CourseRepository.mock';
import { MockPasswordEncoder } from '../../mocks/PasswordEncoder.mock';
import { Teacher } from '../../../src/core/models/Teacher';
import { User, UserRole } from '../../../src/core/models/User';
import { Course } from '../../../src/core/models/Course';

describe('UpdateTeacherUseCase', () => {
    let updateTeacherUseCase: UpdateTeacherUseCase;
    let mockTeacherRepository: MockTeacherRepository;
    let mockStudentRepository: MockStudentRepository;
    let mockAdminRepository: MockAdminRepository;
    let mockCourseRepository: MockCourseRepository;
    let mockPasswordEncoder: MockPasswordEncoder;

    beforeEach(() => {
        mockTeacherRepository = new MockTeacherRepository();
        mockStudentRepository = new MockStudentRepository();
        mockAdminRepository = new MockAdminRepository();
        mockCourseRepository = new MockCourseRepository();
        mockPasswordEncoder = new MockPasswordEncoder();

        updateTeacherUseCase = new UpdateTeacherUseCase(
            mockTeacherRepository,
            mockStudentRepository,
            mockAdminRepository,
            mockCourseRepository,
            mockPasswordEncoder
        );
    });

    afterEach(() => {
        mockTeacherRepository.clearTeachers();
        mockStudentRepository.clearStudents();
        mockAdminRepository.clearAdmins();
        mockCourseRepository.clearCourses();
        mockPasswordEncoder.clearPasswords();
    });

    describe('When execute', () => {
        it('should update teacher successfully', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const course1 = new Course('course-1', 'Matemáticas', '', []);
            const course2 = new Course('course-2', 'Lengua', '', []);
            await mockCourseRepository.addCourse(course1);
            await mockCourseRepository.addCourse(course2);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: 'Ana',
                surname: 'López',
                username: 'ana123',
                email: 'ana@example.com',
                password: null,
                courseIds: ['course-1', 'course-2']
            };

            const result = await updateTeacherUseCase.execute(request);

            expect(result.id).toBe('teacher-1');
            expect(result.username).toBe('ana123');
            expect(result.email).toBe('ana@example.com');
            expect(result.courseIds).toEqual(['course-1', 'course-2']);

            const updatedTeacher = await mockTeacherRepository.findById('teacher-1');
            expect(updatedTeacher?.name).toBe('Ana');
            expect(updatedTeacher?.surname).toBe('López');
        });

        it('should update password when provided', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: 'María',
                surname: 'García',
                username: 'teacher1',
                email: 'maria@example.com',
                password: 'newpassword123',
                courseIds: []
            };

            await updateTeacherUseCase.execute(request);

            const updatedTeacher = await mockTeacherRepository.findById('teacher-1');
            expect(updatedTeacher?.user.passwordHash).toBe('hashed_newpassword123');
        });

        it('should throw error when name is not provided', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: '',
                surname: 'García',
                username: 'teacher1',
                email: 'maria@example.com',
                password: null,
                courseIds: []
            };

            await expect(updateTeacherUseCase.execute(request))
                .rejects
                .toThrow('El nombre es requerido');
        });

        it('should throw error when surname is not provided', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: 'María',
                surname: '',
                username: 'teacher1',
                email: 'maria@example.com',
                password: null,
                courseIds: []
            };

            await expect(updateTeacherUseCase.execute(request))
                .rejects
                .toThrow('El apellido es requerido');
        });

        it('should throw error when username is not provided', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: 'María',
                surname: 'García',
                username: '',
                email: 'maria@example.com',
                password: null,
                courseIds: []
            };

            await expect(updateTeacherUseCase.execute(request))
                .rejects
                .toThrow('El username es requerido');
        });

        it('should throw error when email is not provided', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: 'María',
                surname: 'García',
                username: 'teacher1',
                email: '',
                password: null,
                courseIds: []
            };

            await expect(updateTeacherUseCase.execute(request))
                .rejects
                .toThrow('El email es requerido');
        });

        it('should throw error when email format is invalid', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: 'María',
                surname: 'García',
                username: 'teacher1',
                email: 'invalid-email',
                password: null,
                courseIds: []
            };

            await expect(updateTeacherUseCase.execute(request))
                .rejects
                .toThrow('El email no tiene un formato válido');
        });

        it('should throw error when password is too short', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: 'María',
                surname: 'García',
                username: 'teacher1',
                email: 'maria@example.com',
                password: '12345',
                courseIds: []
            };

            await expect(updateTeacherUseCase.execute(request))
                .rejects
                .toThrow('La contraseña debe tener al menos 6 caracteres');
        });

        it('should throw error when teacher does not exist', async () => {
            const request: UpdateTeacherRequest = {
                teacherId: 'non-existent',
                name: 'María',
                surname: 'García',
                username: 'teacher1',
                email: 'maria@example.com',
                password: null,
                courseIds: []
            };

            await expect(updateTeacherUseCase.execute(request))
                .rejects
                .toThrow('El docente no existe');
        });

        it('should throw error when username is already used by student', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const studentUser = new User('user-2', 'student1', 'hash', UserRole.STUDENT);
            mockStudentRepository.addUser(studentUser);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: 'María',
                surname: 'García',
                username: 'student1',
                email: 'maria@example.com',
                password: null,
                courseIds: []
            };

            await expect(updateTeacherUseCase.execute(request))
                .rejects
                .toThrow('El username ya está en uso por un estudiante');
        });

        it('should throw error when username is already used by another teacher', async () => {
            const user1 = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher1 = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user1);
            mockTeacherRepository.addTeacherEntity(teacher1);

            const user2 = new User('user-2', 'teacher2', 'hash', UserRole.TEACHER);
            const teacher2 = new Teacher('teacher-2', 'Ana', 'López', 'ana@example.com', user2);
            mockTeacherRepository.addTeacherEntity(teacher2);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: 'María',
                surname: 'García',
                username: 'teacher2',
                email: 'maria@example.com',
                password: null,
                courseIds: []
            };

            await expect(updateTeacherUseCase.execute(request))
                .rejects
                .toThrow('El username ya está en uso por otro docente');
        });

        it('should throw error when username is already used by admin', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const adminUser = new User('user-2', 'admin1', 'hash', UserRole.ADMIN);
            mockAdminRepository.addUser(adminUser);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: 'María',
                surname: 'García',
                username: 'admin1',
                email: 'maria@example.com',
                password: null,
                courseIds: []
            };

            await expect(updateTeacherUseCase.execute(request))
                .rejects
                .toThrow('El username ya está en uso por un administrador');
        });

        it('should throw error when course does not exist', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: 'María',
                surname: 'García',
                username: 'teacher1',
                email: 'maria@example.com',
                password: null,
                courseIds: ['non-existent']
            };

            await expect(updateTeacherUseCase.execute(request))
                .rejects
                .toThrow('El curso con ID non-existent no existe');
        });

        it('should assign courses to teacher', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const course = new Course('course-1', 'Matemáticas', '', []);
            await mockCourseRepository.addCourse(course);

            const request: UpdateTeacherRequest = {
                teacherId: 'teacher-1',
                name: 'María',
                surname: 'García',
                username: 'teacher1',
                email: 'maria@example.com',
                password: null,
                courseIds: ['course-1']
            };

            await updateTeacherUseCase.execute(request);

            const courses = await mockCourseRepository.getCoursesByTeacherId('teacher-1');
            expect(courses.length).toBeGreaterThanOrEqual(1);
        });
    });
});


