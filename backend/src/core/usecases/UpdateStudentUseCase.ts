import { StudentRepository } from '../infrastructure/StudentRepository';
import { TeacherRepository } from '../infrastructure/TeacherRepository';
import { AdminRepository } from '../infrastructure/AdminRepository';
import { PasswordEncoder } from '../infrastructure/PasswordEncoder';
import { Student } from '../models/Student';
import { User, UserRole } from '../models/User';

export interface UpdateStudentRequest {
    studentId: string;
    name: string;
    lastname: string;
    username: string;
    password?: string | null;
    courseId?: string | null;
}

export interface UpdateStudentResponse {
    id: string;
    name: string;
    lastname: string;
    username: string;
    courseId: string | null;
}

export class UpdateStudentUseCase {
    private studentRepository: StudentRepository;
    private teacherRepository: TeacherRepository;
    private adminRepository: AdminRepository;
    private passwordEncoder: PasswordEncoder;

    constructor(
        studentRepository: StudentRepository,
        teacherRepository: TeacherRepository,
        adminRepository: AdminRepository,
        passwordEncoder: PasswordEncoder
    ) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    async execute(request: UpdateStudentRequest): Promise<UpdateStudentResponse> {
        if (!request.name || request.name.trim() === '') {
            throw new Error('El nombre es requerido');
        }

        if (!request.lastname || request.lastname.trim() === '') {
            throw new Error('El apellido es requerido');
        }

        if (!request.username || request.username.trim() === '') {
            throw new Error('El username es requerido');
        }

        const existingStudent = await this.studentRepository.findById(request.studentId);
        if (!existingStudent) {
            throw new Error('El estudiante no existe');
        }

        const studentWithUsername = await this.studentRepository.findByUserName(request.username.trim());
        if (studentWithUsername && studentWithUsername.id !== request.studentId) {
            throw new Error('El username ya está en uso por otro estudiante');
        }

        const teacherWithUsername = await this.teacherRepository.findByUserName(request.username.trim());
        if (teacherWithUsername) {
            throw new Error('El username ya está en uso por un docente');
        }

        const adminWithUsername = await this.adminRepository.findByUserName(request.username.trim());
        if (adminWithUsername) {
            throw new Error('El username ya está en uso por un administrador');
        }

        let passwordHash = existingStudent.user.passwordHash;
        if (request.password && request.password.trim() !== '') {
            if (request.password.trim().length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }
            passwordHash = await this.passwordEncoder.encode(request.password.trim());
        }

        const updatedUser = new User(
            existingStudent.user.id,
            request.username.trim(),
            passwordHash,
            UserRole.STUDENT
        );

        const updatedStudent = new Student(
            existingStudent.id,
            request.name.trim(),
            request.lastname.trim(),
            existingStudent.dni,
            request.courseId || null,
            updatedUser
        );

        await this.studentRepository.updateStudent(updatedStudent);

        return {
            id: updatedStudent.id,
            name: updatedStudent.name,
            lastname: updatedStudent.lastname,
            username: updatedStudent.user.username,
            courseId: updatedStudent.courseId
        };
    }
}

