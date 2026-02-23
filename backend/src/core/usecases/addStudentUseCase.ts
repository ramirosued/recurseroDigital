
import { StudentRepository } from '../infrastructure/StudentRepository';
import { PasswordEncoder } from '../infrastructure/PasswordEncoder';
import { IdGenerator } from '../infrastructure/IdGenerator';
import {StudentInvalidRequestError} from "../models/exceptions/StudentInvalidRequestError";
import {Student} from "../models/Student";
import {StudentAlreadyExistsError} from "../models/exceptions/StudentAlreadyExistsError";
import {User, UserRole} from "../models/User";

export interface AddStudentRequest {
    name: string;
    lastName: string;
    username: string;
    password: string;
    dni: string;
}

function validateStudentRequest(request: AddStudentRequest) {
    if(!request.name) {
        throw new StudentInvalidRequestError('El nombre del estudiante es obligatorio');
    }
    if(!request.lastName) {
        throw new StudentInvalidRequestError('El apellido del estudiante es obligatorio');
    }
    if(!request.username) {
        throw new StudentInvalidRequestError('El nombre de usuario es obligatorio');
    }
    if(!request.password) {
        throw new StudentInvalidRequestError('La contraseña del estudiante es obligatoria');
    }
    if(!request.dni) {
        throw new StudentInvalidRequestError('El DNI del estudiante es obligatorio');
    }
}

async function validateUserAlreadyExists(username: string, studentRepository: StudentRepository) {
    const student = await studentRepository.findByUserName(username)
    if(student) {
        throw new StudentAlreadyExistsError('El nombre de usuario ya existe');
    }
}

export class AddStudentUseCase {
    private studentRepository: StudentRepository;
    private passwordEncoder: PasswordEncoder;
    private idGenerator: IdGenerator;

    constructor(
        studentRepository: StudentRepository,
        passwordEncoder: PasswordEncoder,
        idGenerator: IdGenerator
    ) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.idGenerator = idGenerator;
    }

    async execute(request: AddStudentRequest): Promise<void> {
        validateStudentRequest(request);
        await validateUserAlreadyExists(request.username, this.studentRepository);
        const hashedPassword = await this.passwordEncoder.encode(request.password);
        const studentId = this.idGenerator.generate();
        const userId = this.idGenerator.generate();
        
        const user = new User(
            userId,
            request.username,
            hashedPassword,
            UserRole.STUDENT
        );
        
        const student = new Student(
            studentId,
            request.name,
            request.lastName,
            request.dni,
            null,
            user
        )

        await this.studentRepository.addStudent(student);
    }
}