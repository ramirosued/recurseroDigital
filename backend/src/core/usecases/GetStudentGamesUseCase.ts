import { StudentRepository } from '../infrastructure/StudentRepository';
import { CourseRepository } from '../infrastructure/CourseRepository';
import { CourseGame } from '../models/CourseGame';
import { StudentNotFoundError } from '../models/exceptions/StudentNotFoundError';
import { StudentInvalidRequestError } from '../models/exceptions/StudentInvalidRequestError';

export interface GetStudentGamesRequest {
    studentId: string;
}

export interface StudentGamesResponse {
    studentId: string;
    courseId: string | null;
    games: CourseGame[];
}

export class GetStudentGamesUseCase {
    private studentRepository: StudentRepository;
    private courseRepository: CourseRepository;

    constructor(
        studentRepository: StudentRepository,
        courseRepository: CourseRepository
    ) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    async execute(request: GetStudentGamesRequest): Promise<StudentGamesResponse> {
        if (!request || !request.studentId) {
            throw new StudentInvalidRequestError('studentId es requerido');
        }

        const student = await this.studentRepository.findById(request.studentId);
        if (!student) {
            throw new StudentNotFoundError();
        }

        const courseId = student.getCourseId();
        if (!courseId) {
            return {
                studentId: student.id,
                courseId: null,
                games: []
            };
        }

        const enabledGames = await this.courseRepository.getEnabledGamesByCourseId(courseId);

        return {
            studentId: student.id,
            courseId: courseId,
            games: enabledGames
        };
    }
}
