import { CourseRepository } from '../infrastructure/CourseRepository';
import { Course } from '../models/Course';

export interface UpdateCourseRequest {
    courseId: string;
    name: string;
}

export interface UpdateCourseResponse {
    id: string;
    name: string;
    teacherId?: string;
}

export class UpdateCourseUseCase {
    private courseRepository: CourseRepository;

    constructor(courseRepository: CourseRepository) {
        this.courseRepository = courseRepository;
    }

    async execute(request: UpdateCourseRequest): Promise<UpdateCourseResponse> {
        if (!request.name || request.name.trim() === '') {
            throw new Error('El nombre del curso es requerido');
        }

        if (request.name.trim().length < 2) {
            throw new Error('El nombre del curso debe tener al menos 2 caracteres');
        }

        const existingCourse = await this.courseRepository.findById(request.courseId);
        if (!existingCourse) {
            throw new Error('El curso no existe');
        }

        const courseWithSameName = await this.courseRepository.findByCourseName(request.name.trim());
        if (courseWithSameName && courseWithSameName.id !== request.courseId) {
            throw new Error('Ya existe un curso con ese nombre');
        }

        const updatedCourse = new Course(
            existingCourse.id,
            request.name.trim(),
            existingCourse.teacher_id,
            existingCourse.students
        );

        await this.courseRepository.updateCourse(updatedCourse);

        return {
            id: updatedCourse.id,
            name: updatedCourse.name,
            teacherId: updatedCourse.teacher_id
        };
    }
}

