import { StudentRepository } from '../infrastructure/StudentRepository';

export interface EnableStudentRequest {
    studentId: string;
}

export class EnableStudentUseCase {
    private studentRepository: StudentRepository;

    constructor(studentRepository: StudentRepository) {
        this.studentRepository = studentRepository;
    }

    async execute(request: EnableStudentRequest): Promise<void> {
        await this.studentRepository.enableStudent(request.studentId);
    }
}
