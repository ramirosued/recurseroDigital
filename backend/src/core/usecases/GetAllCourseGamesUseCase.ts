import { CourseRepository } from '../infrastructure/CourseRepository';
import { CourseGame } from '../models/CourseGame';

export interface GetAllCourseGamesRequest {
    courseId: string;
}

export interface GetAllCourseGamesResponse {
    courseId: string;
    games: CourseGame[];
}

export class GetAllCourseGamesUseCase {
    private courseRepository: CourseRepository;

    constructor(courseRepository: CourseRepository) {
        this.courseRepository = courseRepository;
    }

    async execute(request: GetAllCourseGamesRequest): Promise<GetAllCourseGamesResponse> {
        if (!request.courseId || request.courseId.trim() === '') {
            throw new Error('courseId es requerido');
        }

        const course = await this.courseRepository.findById(request.courseId);
        if (!course) {
            throw new Error('El curso no existe');
        }

        const games = await this.courseRepository.getAllGamesByCourseId(request.courseId);

        return {
            courseId: request.courseId,
            games
        };
    }
}

