import { StudentRepository } from '../infrastructure/StudentRepository';

export interface DeleteStudentRequest {
    studentId: string;
}

export class DeleteStudentUseCase {
    private studentRepository: StudentRepository;

    constructor(studentRepository: StudentRepository) {
        this.studentRepository = studentRepository;
    }

    async execute(request: DeleteStudentRequest): Promise<void> {
        await this.studentRepository.deleteStudent(request.studentId);
    }
}

