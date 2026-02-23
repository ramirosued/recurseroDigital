import { CourseRepository } from '../infrastructure/CourseRepository';

export interface UpdateCourseGameStatusRequest {
    courseGameId: string;
    isEnabled: boolean;
}

export class UpdateCourseGameStatusUseCase {
    private courseRepository: CourseRepository;

    constructor(courseRepository: CourseRepository) {
        this.courseRepository = courseRepository;
    }

    async execute(request: UpdateCourseGameStatusRequest): Promise<void> {
        if (!request.courseGameId || request.courseGameId.trim() === '') {
            throw new Error('courseGameId es requerido');
        }

        if (typeof request.isEnabled !== 'boolean') {
            throw new Error('isEnabled debe ser un valor booleano');
        }

        await this.courseRepository.updateCourseGameStatus(
            request.courseGameId,
            request.isEnabled
        );
    }
}

