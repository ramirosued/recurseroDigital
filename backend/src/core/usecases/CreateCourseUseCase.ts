import { CourseRepository } from '../infrastructure/CourseRepository';
import { Course } from '../models/Course';

export interface CreateCourseRequest {
    name: string;
    teacherId?: string;
}

export interface CreateCourseResponse {
    id: string;
    name: string;
    teacherId?: string;
}

export class CreateCourseUseCase {
    private courseRepository: CourseRepository;

    constructor(
        courseRepository: CourseRepository
    ) {
        this.courseRepository = courseRepository;
    }

    async execute(request: CreateCourseRequest): Promise<CreateCourseResponse> {
        if (!request.name || request.name.trim() === '') {
            throw new Error('El nombre del curso es requerido');
        }

        const existingCourse = await this.courseRepository.findByCourseName(request.name.trim());
        if (existingCourse) {
            throw new Error('Ya existe un curso con ese nombre');
        }

        const course = await this.courseRepository.createCourse(
            request.name.trim(),
            request.teacherId
        );

        return {
            id: course.id,
            name: course.name,
            teacherId: course.teacher_id
        };
    }
}
