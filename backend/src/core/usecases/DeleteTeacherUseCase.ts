import { TeacherRepository } from '../infrastructure/TeacherRepository';

export interface DeleteTeacherRequest {
    teacherId: string;
}

export class DeleteTeacherUseCase {
    private teacherRepository: TeacherRepository;

    constructor(teacherRepository: TeacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    async execute(request: DeleteTeacherRequest): Promise<void> {
        await this.teacherRepository.deleteTeacher(request.teacherId);
    }
}

