import { CourseRepository } from '../infrastructure/CourseRepository';

export interface DeleteCourseRequest {
    courseId: string;
}

export class DeleteCourseUseCase {
    private courseRepository: CourseRepository;

    constructor(courseRepository: CourseRepository) {
        this.courseRepository = courseRepository;
    }

    async execute(request: DeleteCourseRequest): Promise<void> {
        // Verificar que el curso existe
        const existingCourse = await this.courseRepository.findById(request.courseId);
        if (!existingCourse) {
            throw new Error('El curso no existe');
        }

        // Eliminar el curso
        await this.courseRepository.deleteCourse(request.courseId);
    }
}

