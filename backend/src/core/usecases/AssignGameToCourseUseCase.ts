import { CourseRepository } from '../infrastructure/CourseRepository';
import { IdGenerator } from '../infrastructure/IdGenerator';

export interface AssignGameToCourseRequest {
    courseId: string;
    gameId: string;
}

export class AssignGameToCourseUseCase {
    private courseRepository: CourseRepository;
    private idGenerator: IdGenerator;

    constructor(
        courseRepository: CourseRepository,
        idGenerator: IdGenerator
    ) {
        this.courseRepository = courseRepository;
        this.idGenerator = idGenerator;
    }

    async execute(request: AssignGameToCourseRequest): Promise<void> {
        if (!request.courseId || !request.gameId) {
            throw new Error('courseId y gameId son requeridos');
        }
        
        const courseGameId = this.idGenerator.generate();
        await this.courseRepository.addGameToCourse(courseGameId, request.courseId, request.gameId);
    }
}


