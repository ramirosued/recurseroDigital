import { DeleteTeacherUseCase, DeleteTeacherRequest } from '../../../src/core/usecases/DeleteTeacherUseCase';
import { MockTeacherRepository } from '../../mocks/TeacherRepository.mock';
import { Teacher } from '../../../src/core/models/Teacher';
import { User, UserRole } from '../../../src/core/models/User';

describe('DeleteTeacherUseCase', () => {
    let deleteTeacherUseCase: DeleteTeacherUseCase;
    let mockTeacherRepository: MockTeacherRepository;

    beforeEach(() => {
        mockTeacherRepository = new MockTeacherRepository();
        deleteTeacherUseCase = new DeleteTeacherUseCase(mockTeacherRepository);
    });

    afterEach(() => {
        mockTeacherRepository.clearTeachers();
    });

    describe('When execute', () => {
        it('should delete teacher successfully', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const request: DeleteTeacherRequest = {
                teacherId: 'teacher-1'
            };

            await deleteTeacherUseCase.execute(request);

            const deletedTeacher = await mockTeacherRepository.findById('teacher-1');
            expect(deletedTeacher).toBeNull();
        });

        it('should handle deletion gracefully when teacher does not exist', async () => {
            const request: DeleteTeacherRequest = {
                teacherId: 'non-existent'
            };

            await deleteTeacherUseCase.execute(request);

            const teacher = await mockTeacherRepository.findById('non-existent');
            expect(teacher).toBeNull();
        });
    });
});


