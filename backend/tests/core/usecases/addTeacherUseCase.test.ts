import { AddTeacherUseCase, AddTeacherRequest } from '../../../src/core/usecases/addTeacherUseCase';
import { MockTeacherRepository } from '../../mocks/TeacherRepository.mock';
import { MockPasswordEncoder } from '../../mocks/PasswordEncoder.mock';
import { MockIdGenerator } from '../../mocks/IdGenerator.mock';
import { TeacherInvalidRequestError } from '../../../src/core/models/exceptions/TeacherInvalidRequestError';
import { TeacherAlreadyExistsError } from '../../../src/core/models/exceptions/TeacherAlreadyExistsError';
import { UserRole } from '../../../src/core/models/User';

describe('AddTeacherUseCase', () => {
    let addTeacherUseCase: AddTeacherUseCase;
    let mockTeacherRepository: MockTeacherRepository;
    let mockPasswordEncoder: MockPasswordEncoder;
    let mockIdGenerator: MockIdGenerator;

    beforeEach(() => {
        mockTeacherRepository = new MockTeacherRepository();
        mockPasswordEncoder = new MockPasswordEncoder();
        mockIdGenerator = new MockIdGenerator();

        addTeacherUseCase = new AddTeacherUseCase(
            mockTeacherRepository,
            mockPasswordEncoder,
            mockIdGenerator
        );
    });

    afterEach(() => {
        mockTeacherRepository.clearTeachers();
        mockPasswordEncoder.clearPasswords();
        mockIdGenerator.reset();
    });

    describe('When execute', () => {
        it('should add teacher successfully', async () => {
            const request: AddTeacherRequest = {
                name: 'María',
                surname: 'García',
                email: 'maria@example.com',
                username: 'maria123',
                password: 'password123'
            };

            await addTeacherUseCase.execute(request);

            const allTeachers = await mockTeacherRepository.getAllTeachers();
            expect(allTeachers).toHaveLength(1);

            const createdTeacher = allTeachers[0];
            expect(createdTeacher).toBeDefined();
            expect(createdTeacher.user.username).toBe(request.username);
            expect(createdTeacher.name).toBe(request.name);
            expect(createdTeacher.surname).toBe(request.surname);
            expect(createdTeacher.email).toBe(request.email);
            expect(createdTeacher.user.role).toBe(UserRole.TEACHER);
        });

        it('should throw error when name is not received', async () => {
            const request: AddTeacherRequest = {
                name: '',
                surname: 'García',
                email: 'maria@example.com',
                username: 'maria123',
                password: 'password123'
            };

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow(TeacherInvalidRequestError);

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow('El nombre del docente es obligatorio');
        });

        it('should throw error when surname is not received', async () => {
            const request: AddTeacherRequest = {
                name: 'María',
                surname: '',
                email: 'maria@example.com',
                username: 'maria123',
                password: 'password123'
            };

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow(TeacherInvalidRequestError);

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow('El apellido del docente es obligatorio');
        });

        it('should throw error when email is not received', async () => {
            const request: AddTeacherRequest = {
                name: 'María',
                surname: 'García',
                email: '',
                username: 'maria123',
                password: 'password123'
            };

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow(TeacherInvalidRequestError);

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow('El email del docente es obligatorio');
        });

        it('should throw error when email format is invalid', async () => {
            const request: AddTeacherRequest = {
                name: 'María',
                surname: 'García',
                email: 'invalid-email',
                username: 'maria123',
                password: 'password123'
            };

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow(TeacherInvalidRequestError);

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow('El email no tiene un formato válido');
        });

        it('should throw error when username is not received', async () => {
            const request: AddTeacherRequest = {
                name: 'María',
                surname: 'García',
                email: 'maria@example.com',
                username: '',
                password: 'password123'
            };

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow(TeacherInvalidRequestError);

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow('El nombre de usuario es obligatorio');
        });

        it('should throw error when password is not received', async () => {
            const request: AddTeacherRequest = {
                name: 'María',
                surname: 'García',
                email: 'maria@example.com',
                username: 'maria123',
                password: ''
            };

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow(TeacherInvalidRequestError);

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow('La contraseña del docente es obligatoria');
        });

        it('should throw error when teacher with same username already exists', async () => {
            const request: AddTeacherRequest = {
                name: 'María',
                surname: 'García',
                email: 'maria@example.com',
                username: 'maria123',
                password: 'password123'
            };
            await addTeacherUseCase.execute(request);

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow(TeacherAlreadyExistsError);

            await expect(addTeacherUseCase.execute(request))
                .rejects
                .toThrow('El nombre de usuario ya existe');
        });
    });
});


