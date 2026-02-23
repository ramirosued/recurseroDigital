import { DeleteStudentUseCase, DeleteStudentRequest } from '../../../src/core/usecases/DeleteStudentUseCase';
import { MockStudentRepository } from '../../mocks/StudentRepository.mock';
import { Student } from '../../../src/core/models/Student';
import { User, UserRole } from '../../../src/core/models/User';
import { StudentEntity } from '../../../src/infrastructure/entities/StudentEntity';

describe('DeleteStudentUseCase', () => {
    let deleteStudentUseCase: DeleteStudentUseCase;
    let mockStudentRepository: MockStudentRepository;

    beforeEach(() => {
        mockStudentRepository = new MockStudentRepository();
        deleteStudentUseCase = new DeleteStudentUseCase(mockStudentRepository);
    });

    afterEach(() => {
        mockStudentRepository.clearStudents();
    });

    describe('When execute', () => {
        it('should delete student successfully', async () => {
            const user = new User('user-1', 'student1', 'hash', UserRole.STUDENT);
            const student = new Student('student-1', 'Juan', 'Pérez', '12345678', 'course-1', user);
            const entity = new StudentEntity(
                student.id,
                user.id,
                user.username,
                user.passwordHash,
                student.name,
                student.lastname,
                student.dni,
                student.courseId
            );
            mockStudentRepository.addStudentEntity(entity);

            const request: DeleteStudentRequest = {
                studentId: 'student-1'
            };

            await deleteStudentUseCase.execute(request);

            const deletedStudent = await mockStudentRepository.findById('student-1');
            expect(deletedStudent).toBeNull();
        });

        it('should handle deletion of non-existent student', async () => {
            const request: DeleteStudentRequest = {
                studentId: 'non-existent'
            };

            await expect(deleteStudentUseCase.execute(request))
                .rejects
                .toThrow('Estudiante no encontrado');
        });
    });
});


