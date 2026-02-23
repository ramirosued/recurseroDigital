import { StudentRepository } from '../infrastructure/StudentRepository';
import { CourseRepository } from '../infrastructure/CourseRepository';

export interface AssignCourseToStudentRequest {
    studentId: string;
    courseId: string;
}

export class AssignCourseToStudentUseCase {
    private studentRepository: StudentRepository;
    private courseRepository: CourseRepository;

    constructor(studentRepository: StudentRepository, courseRepository: CourseRepository) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    async execute(request: AssignCourseToStudentRequest): Promise<void> {
        const { studentId, courseId } = request;

        if (!studentId || !courseId) {
            throw new Error('studentId y courseId son requeridos');
        }

        const student = await this.studentRepository.findById(studentId);
        if (!student) {
            throw new Error('Estudiante no encontrado');
        }

        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw new Error('Curso no encontrado');
        }

        await this.studentRepository.assignCourseToStudent(studentId, courseId);
    }
}

