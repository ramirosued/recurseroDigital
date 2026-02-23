import { UpdateStudentUseCase, UpdateStudentRequest } from '../../../src/core/usecases/UpdateStudentUseCase';
import { MockStudentRepository } from '../../mocks/StudentRepository.mock';
import { MockTeacherRepository } from '../../mocks/TeacherRepository.mock';
import { MockAdminRepository } from '../../mocks/AdminRepository.mock';
import { MockPasswordEncoder } from '../../mocks/PasswordEncoder.mock';
import { StudentEntity } from '../../../src/infrastructure/entities/StudentEntity';
import { User, UserRole } from '../../../src/core/models/User';
import { Teacher } from '../../../src/core/models/Teacher';

describe('UpdateStudentUseCase', () => {
    let updateStudentUseCase: UpdateStudentUseCase;
    let mockStudentRepository: MockStudentRepository;
    let mockTeacherRepository: MockTeacherRepository;
    let mockAdminRepository: MockAdminRepository;
    let mockPasswordEncoder: MockPasswordEncoder;

    beforeEach(() => {
        mockStudentRepository = new MockStudentRepository();
        mockTeacherRepository = new MockTeacherRepository();
        mockAdminRepository = new MockAdminRepository();
        mockPasswordEncoder = new MockPasswordEncoder();

        updateStudentUseCase = new UpdateStudentUseCase(
            mockStudentRepository,
            mockTeacherRepository,
            mockAdminRepository,
            mockPasswordEncoder
        );
    });

    afterEach(() => {
        mockStudentRepository.clearStudents();
        mockTeacherRepository.clearTeachers();
        mockAdminRepository.clearAdmins();
        mockPasswordEncoder.clearPasswords();
    });

    describe('When execute', () => {
        it('should update student successfully', async () => {
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

            const request: UpdateStudentRequest = {
                studentId: 'student-1',
                name: 'María',
                lastname: 'García',
                username: 'maria123',
                password: null,
                courseId: 'course-2'
            };

            const result = await updateStudentUseCase.execute(request);

            expect(result.id).toBe('student-1');
            expect(result.name).toBe('María');
            expect(result.lastname).toBe('García');
            expect(result.username).toBe('maria123');
            expect(result.courseId).toBe('course-2');
        });

        it('should update password when provided', async () => {
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

            const request: UpdateStudentRequest = {
                studentId: 'student-1',
                name: 'Juan',
                lastname: 'Pérez',
                username: 'student1',
                password: 'newpassword123',
                courseId: null
            };

            await updateStudentUseCase.execute(request);

            const updatedStudent = await mockStudentRepository.findById('student-1');
            expect(updatedStudent?.user.passwordHash).toBe('hashed_newpassword123');
        });

        it('should throw error when name is not provided', async () => {
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

            const request: UpdateStudentRequest = {
                studentId: 'student-1',
                name: '',
                lastname: 'Pérez',
                username: 'student1',
                password: null,
                courseId: null
            };

            await expect(updateStudentUseCase.execute(request))
                .rejects
                .toThrow('El nombre es requerido');
        });

        it('should throw error when lastname is not provided', async () => {
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

            const request: UpdateStudentRequest = {
                studentId: 'student-1',
                name: 'Juan',
                lastname: '',
                username: 'student1',
                password: null,
                courseId: null
            };

            await expect(updateStudentUseCase.execute(request))
                .rejects
                .toThrow('El apellido es requerido');
        });

        it('should throw error when username is not provided', async () => {
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

            const request: UpdateStudentRequest = {
                studentId: 'student-1',
                name: 'Juan',
                lastname: 'Pérez',
                username: '',
                password: null,
                courseId: null
            };

            await expect(updateStudentUseCase.execute(request))
                .rejects
                .toThrow('El username es requerido');
        });

        it('should throw error when student does not exist', async () => {
            const request: UpdateStudentRequest = {
                studentId: 'non-existent',
                name: 'Juan',
                lastname: 'Pérez',
                username: 'student1',
                password: null,
                courseId: null
            };

            await expect(updateStudentUseCase.execute(request))
                .rejects
                .toThrow('El estudiante no existe');
        });

        it('should throw error when username is already used by another student', async () => {
            const entity1 = new StudentEntity(
                'student-1',
                'user-1',
                'student1',
                'hash',
                'Juan',
                'Pérez',
                '12345678',
                null
            );
            const entity2 = new StudentEntity(
                'student-2',
                'user-2',
                'student2',
                'hash',
                'María',
                'García',
                '87654321',
                null
            );
            mockStudentRepository.addStudentEntity(entity1);
            mockStudentRepository.addStudentEntity(entity2);

            const request: UpdateStudentRequest = {
                studentId: 'student-1',
                name: 'Juan',
                lastname: 'Pérez',
                username: 'student2',
                password: null,
                courseId: null
            };

            await expect(updateStudentUseCase.execute(request))
                .rejects
                .toThrow('El username ya está en uso por otro estudiante');
        });

        it('should throw error when username is already used by teacher', async () => {
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

            const teacherUser = new User('user-2', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher(
                'teacher-1',
                'María',
                'García',
                'maria@example.com',
                teacherUser
            );
            mockTeacherRepository.addTeacherEntity(teacher);

            const request: UpdateStudentRequest = {
                studentId: 'student-1',
                name: 'Juan',
                lastname: 'Pérez',
                username: 'teacher1',
                password: null,
                courseId: null
            };

            await expect(updateStudentUseCase.execute(request))
                .rejects
                .toThrow('El username ya está en uso por un docente');
        });

        it('should throw error when username is already used by admin', async () => {
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

            const adminUser = new User('user-2', 'admin1', 'hash', UserRole.ADMIN);
            mockAdminRepository.addUser(adminUser);

            const request: UpdateStudentRequest = {
                studentId: 'student-1',
                name: 'Juan',
                lastname: 'Pérez',
                username: 'admin1',
                password: null,
                courseId: null
            };

            await expect(updateStudentUseCase.execute(request))
                .rejects
                .toThrow('El username ya está en uso por un administrador');
        });

        it('should throw error when password is too short', async () => {
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

            const request: UpdateStudentRequest = {
                studentId: 'student-1',
                name: 'Juan',
                lastname: 'Pérez',
                username: 'student1',
                password: '12345',
                courseId: null
            };

            await expect(updateStudentUseCase.execute(request))
                .rejects
                .toThrow('La contraseña debe tener al menos 6 caracteres');
        });
    });
});

