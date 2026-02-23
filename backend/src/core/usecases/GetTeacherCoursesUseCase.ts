import { TeacherRepository } from '../infrastructure/TeacherRepository';
import { CourseRepository } from '../infrastructure/CourseRepository';
import { Course } from '../models/Course';
import { TeacherNotFoundError } from '../models/exceptions/TeacherNotFoundError';
import { TeacherInvalidRequestError } from '../models/exceptions/TeacherInvalidRequestError';

export interface GetTeacherCoursesRequest {
  teacherId: string;
}

export class GetTeacherCoursesUseCase {
  private teacherRepository: TeacherRepository;
  private courseRepository: CourseRepository;

  constructor(
    teacherRepository: TeacherRepository,
    courseRepository: CourseRepository
  ) {
    this.teacherRepository = teacherRepository;
    this.courseRepository = courseRepository;
  }

  async execute(request: GetTeacherCoursesRequest): Promise<Course[]> {
    if (!request || !request.teacherId) {
      throw new TeacherInvalidRequestError('teacherId es requerido');
    }

    const teacher = await this.teacherRepository.findById(request.teacherId);
    if (!teacher) {
      throw new TeacherNotFoundError();
    }

    return this.courseRepository.getCoursesByTeacherId(teacher.id);
  }
}

