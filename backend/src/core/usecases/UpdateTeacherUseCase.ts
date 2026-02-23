import { TeacherRepository } from '../infrastructure/TeacherRepository';
import { StudentRepository } from '../infrastructure/StudentRepository';
import { AdminRepository } from '../infrastructure/AdminRepository';
import { CourseRepository } from '../infrastructure/CourseRepository';
import { PasswordEncoder } from '../infrastructure/PasswordEncoder';
import { Teacher } from '../models/Teacher';
import { User, UserRole } from '../models/User';

export interface UpdateTeacherRequest {
    teacherId: string;
    name: string;
    surname: string;
    username: string;
    email: string;
    password?: string | null;
    courseIds: string[];
}

export interface UpdateTeacherResponse {
    id: string;
    username: string;
    email: string;
    courseIds: string[];
}

export class UpdateTeacherUseCase {
    private teacherRepository: TeacherRepository;
    private studentRepository: StudentRepository;
    private adminRepository: AdminRepository;
    private courseRepository: CourseRepository;
    private passwordEncoder: PasswordEncoder;

    constructor(
        teacherRepository: TeacherRepository,
        studentRepository: StudentRepository,
        adminRepository: AdminRepository,
        courseRepository: CourseRepository,
        passwordEncoder: PasswordEncoder
    ) {
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.adminRepository = adminRepository;
        this.courseRepository = courseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    async execute(request: UpdateTeacherRequest): Promise<UpdateTeacherResponse> {
        if (!request.name || request.name.trim() === '') {
            throw new Error('El nombre es requerido');
        }

        if (!request.surname || request.surname.trim() === '') {
            throw new Error('El apellido es requerido');
        }

        if (!request.username || request.username.trim() === '') {
            throw new Error('El username es requerido');
        }

        if (!request.email || request.email.trim() === '') {
            throw new Error('El email es requerido');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email.trim())) {
            throw new Error('El email no tiene un formato válido');
        }

        if (request.password && request.password.trim() !== '' && request.password.trim().length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        const existingTeacher = await this.teacherRepository.findById(request.teacherId);
        if (!existingTeacher) {
            throw new Error('El docente no existe');
        }

        const studentWithUsername = await this.studentRepository.findByUserName(request.username.trim());
        if (studentWithUsername) {
            throw new Error('El username ya está en uso por un estudiante');
        }

        const teacherWithUsername = await this.teacherRepository.findByUserName(request.username.trim());
        if (teacherWithUsername && teacherWithUsername.id !== request.teacherId) {
            throw new Error('El username ya está en uso por otro docente');
        }

        const adminWithUsername = await this.adminRepository.findByUserName(request.username.trim());
        if (adminWithUsername) {
            throw new Error('El username ya está en uso por un administrador');
        }

        for (const courseId of request.courseIds) {
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                throw new Error(`El curso con ID ${courseId} no existe`);
            }
        }

        let passwordHash = existingTeacher.user.passwordHash;
        if (request.password && request.password.trim() !== '') {
            passwordHash = await this.passwordEncoder.encode(request.password.trim());
        }

        const updatedUser = new User(
            existingTeacher.user.id,
            request.username.trim(),
            passwordHash,
            UserRole.TEACHER
        );

        const updatedTeacher = new Teacher(
            existingTeacher.id,
            request.name.trim(),
            request.surname.trim(),
            request.email.trim(),
            updatedUser
        );

        await this.teacherRepository.updateTeacher(updatedTeacher);

        const currentCourses = await this.courseRepository.getCoursesByTeacherId(request.teacherId);
        const currentCourseIds = currentCourses.map(c => c.id);
        
        const coursesToUnassign = currentCourseIds.filter(id => !request.courseIds.includes(id));
        for (const courseId of coursesToUnassign) {
            await this.courseRepository.assignTeacherToCourse('', courseId);
        }
        
        const coursesToAssign = request.courseIds.filter(id => !currentCourseIds.includes(id));
        for (const courseId of coursesToAssign) {
            await this.courseRepository.assignTeacherToCourse(request.teacherId, courseId);
        }

        return {
            id: updatedTeacher.id,
            username: updatedTeacher.user.username,
            email: updatedTeacher.email,
            courseIds: request.courseIds
        };
    }
}

