import { AddStudentUseCase, AddStudentRequest } from "../../../src/core/usecases/addStudentUseCase";
import { MockStudentRepository } from '../../mocks/StudentRepository.mock';
import { MockPasswordEncoder } from '../../mocks/PasswordEncoder.mock';
import { MockIdGenerator } from '../../mocks/IdGenerator.mock';
import {StudentInvalidRequestError} from "../../../src/core/models/exceptions/StudentInvalidRequestError";
import {StudentAlreadyExistsError} from "../../../src/core/models/exceptions/StudentAlreadyExistsError";
import { UserRole } from "../../../src/core/models/User";

describe('AddStudentUseCase', () => {
    let addStudentUseCase: AddStudentUseCase;
    let mockStudentRepository: MockStudentRepository;
    let mockPasswordEncoder: MockPasswordEncoder;
    let mockIdGenerator: MockIdGenerator;

    beforeEach(() => {
        mockStudentRepository = new MockStudentRepository();
        mockPasswordEncoder = new MockPasswordEncoder();
        mockIdGenerator = new MockIdGenerator();
        
        addStudentUseCase = new AddStudentUseCase(
            mockStudentRepository,
            mockPasswordEncoder,
            mockIdGenerator
        );
    });

    afterEach(() => {
        mockStudentRepository.clearStudents();
        mockPasswordEncoder.clearPasswords();
        mockIdGenerator.reset();
    });

    describe('When execute', () => {
        it('should add student successfully', async () => {
            const request: AddStudentRequest = {
                name: 'Juan',
                lastName: 'Pérez',
                username: 'pepito123',
                dni: '12345678',
                password: 'password123'
            };

            await addStudentUseCase.execute(request);

            const allStudents = await mockStudentRepository.getAllStudents();
            expect(allStudents).toHaveLength(1);
            
            const createdStudent = allStudents[0];
            expect(createdStudent).toBeDefined();
            expect(createdStudent.user.username).toBe(request.username);
            expect(createdStudent.name).toBe(request.name);
            expect(createdStudent.lastname).toBe(request.lastName);
            expect(createdStudent.dni).toBe(request.dni);
            expect(createdStudent.user.role).toBe(UserRole.STUDENT);
        });

        it('should throw error when username is no received', async () => {
            const request: AddStudentRequest = {
                name: 'Juan',
                lastName: 'Pérez',
                dni: '12345678',
                username: '',
                password: 'password123'
            };

            await expect(addStudentUseCase.execute(request))
                .rejects
                .toThrow(StudentInvalidRequestError);
            
            await expect(addStudentUseCase.execute(request))
                .rejects
                .toThrow('El nombre de usuario es obligatorio');
        });

        it('should throw error when student name is no received', async () => {
            const request: AddStudentRequest = {
                name: '',
                lastName: 'Pérez',
                dni: '12345678',
                username: 'pepito123',
                password: 'password123'
            };

            await expect(addStudentUseCase.execute(request))
                .rejects
                .toThrow(StudentInvalidRequestError);
            
            await expect(addStudentUseCase.execute(request))
                .rejects
                .toThrow('El nombre del estudiante es obligatorio');
        });

        it('should throw error when student lastname is no received', async () => {
            const request: AddStudentRequest = {
                name: 'pepito',
                lastName: '',
                dni: '12345678',
                username: 'pepito123',
                password: 'password123'
            };

            await expect(addStudentUseCase.execute(request))
                .rejects
                .toThrow(StudentInvalidRequestError);
            
            await expect(addStudentUseCase.execute(request))
                .rejects
                .toThrow('El apellido del estudiante es obligatorio');
        });

        it('should throw error when student dni is no received', async () => {
            const request: AddStudentRequest = {
                name: 'pepito',
                lastName: 'Perez',
                dni: '',
                username: 'pepito123',
                password: 'password123'
            };

            await expect(addStudentUseCase.execute(request))
                .rejects
                .toThrow(StudentInvalidRequestError);
            
            await expect(addStudentUseCase.execute(request))
                .rejects
                .toThrow('El DNI del estudiante es obligatorio');
        });

        it('should throw error when student password is no received', async () => {
            const request: AddStudentRequest = {
                name: 'pepito',
                lastName: 'Perez',
                dni: '56738093',
                username: 'pepito123',
                password: ''
            };

            await expect(addStudentUseCase.execute(request))
                .rejects
                .toThrow(StudentInvalidRequestError);
            
            await expect(addStudentUseCase.execute(request))
                .rejects
                .toThrow('La contraseña del estudiante es obligatoria');
        });

        it('should throw error when student with same username already exists', async () => {
            const request: AddStudentRequest = {
                name: 'Juan',
                lastName: 'Pérez',
                username: 'pepito123',
                dni: '12345678',
                password: 'password123'
            }
            await addStudentUseCase.execute(request);

            await expect(addStudentUseCase.execute(request))
                .rejects
                .toThrow(StudentAlreadyExistsError);
            
            await expect(addStudentUseCase.execute(request))
                .rejects
                .toThrow('El nombre de usuario ya existe');
        })
    });
});