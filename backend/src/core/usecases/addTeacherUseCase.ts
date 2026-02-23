import { TeacherRepository } from '../infrastructure/TeacherRepository';
import { PasswordEncoder } from '../infrastructure/PasswordEncoder';
import { IdGenerator } from '../infrastructure/IdGenerator';
import { TeacherInvalidRequestError } from '../models/exceptions/TeacherInvalidRequestError';
import { Teacher } from '../models/Teacher';
import { TeacherAlreadyExistsError } from '../models/exceptions/TeacherAlreadyExistsError';
import { User, UserRole } from '../models/User';

export interface AddTeacherRequest {
    name: string;
    surname: string;
    email: string;
    username: string;
    password: string;
}

function validateTeacherRequest(request: AddTeacherRequest) {
    if (!request.name) {
        throw new TeacherInvalidRequestError('El nombre del docente es obligatorio');
    }
    if (!request.surname) {
        throw new TeacherInvalidRequestError('El apellido del docente es obligatorio');
    }
    if (!request.email) {
        throw new TeacherInvalidRequestError('El email del docente es obligatorio');
    }
    if (!request.username) {
        throw new TeacherInvalidRequestError('El nombre de usuario es obligatorio');
    }
    if (!request.password) {
        throw new TeacherInvalidRequestError('La contraseña del docente es obligatoria');
    }
    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
        throw new TeacherInvalidRequestError('El email no tiene un formato válido');
    }
}

async function validateUserAlreadyExists(username: string, email: string, teacherRepository: TeacherRepository) {
    const teacher = await teacherRepository.findByUserName(username);
    if (teacher) {
        throw new TeacherAlreadyExistsError('El nombre de usuario ya existe');
    }
    // También verificar si el email ya existe (necesitamos un método findByEmail o verificar en getAllTeachers)
    // Por ahora solo validamos username
}

export class AddTeacherUseCase {
    private teacherRepository: TeacherRepository;
    private passwordEncoder: PasswordEncoder;
    private idGenerator: IdGenerator;

    constructor(
        teacherRepository: TeacherRepository,
        passwordEncoder: PasswordEncoder,
        idGenerator: IdGenerator
    ) {
        this.teacherRepository = teacherRepository;
        this.passwordEncoder = passwordEncoder;
        this.idGenerator = idGenerator;
    }

    async execute(request: AddTeacherRequest): Promise<void> {
        validateTeacherRequest(request);
        await validateUserAlreadyExists(request.username, request.email, this.teacherRepository);
        const hashedPassword = await this.passwordEncoder.encode(request.password);
        const teacherId = this.idGenerator.generate();
        const userId = this.idGenerator.generate();
        
        const user = new User(
            userId,
            request.username,
            hashedPassword,
            UserRole.TEACHER
        );
        
        const teacher = new Teacher(
            teacherId,
            request.name,
            request.surname,
            request.email,
            user
        );

        await this.teacherRepository.addTeacher(teacher);
    }
}

