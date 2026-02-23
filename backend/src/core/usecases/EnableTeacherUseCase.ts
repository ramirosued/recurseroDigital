import { TeacherRepository } from '../infrastructure/TeacherRepository';

export interface EnableTeacherRequest {
    teacherId: string;
}

export class EnableTeacherUseCase {
    private teacherRepository: TeacherRepository;

    constructor(teacherRepository: TeacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    async execute(request: EnableTeacherRequest): Promise<void> {
        await this.teacherRepository.enableTeacher(request.teacherId);
    }
}
