import { CourseRepository } from '../infrastructure/CourseRepository';
import { TeacherRepository } from '../infrastructure/TeacherRepository';

export interface AssignTeacherToCoursesRequest {
    teacherId: string;
    courseIds: string[];
}

export class AssignTeacherToCoursesUseCase {
    private courseRepository: CourseRepository;
    private teacherRepository: TeacherRepository;

    constructor(courseRepository: CourseRepository, teacherRepository: TeacherRepository) {
        this.courseRepository = courseRepository;
        this.teacherRepository = teacherRepository;
    }

    async execute(request: AssignTeacherToCoursesRequest): Promise<void> {
        const { teacherId, courseIds } = request;

        if (!teacherId) {
            throw new Error('Teacher ID es requerido');
        }
        if (!courseIds || courseIds.length === 0) {
            throw new Error('CourseId es requerido');
        }

        const teacher = await this.teacherRepository.findById(teacherId);
        if (!teacher) {
            throw new Error('Profesor no encontrado');
        }

        for (const courseId of courseIds) {
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                throw new Error(`Curso con ID ${courseId} no encontrado`);
            }
        }

        for (const courseId of courseIds) {
            await this.courseRepository.assignTeacherToCourse(teacherId, courseId);
        }
    }
}