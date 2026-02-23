import { EnableTeacherUseCase, EnableTeacherRequest } from '../../../src/core/usecases/EnableTeacherUseCase';
import { MockTeacherRepository } from '../../mocks/TeacherRepository.mock';
import { Teacher } from '../../../src/core/models/Teacher';
import { User, UserRole } from '../../../src/core/models/User';

describe('EnableTeacherUseCase', () => {
    let enableTeacherUseCase: EnableTeacherUseCase;
    let mockTeacherRepository: MockTeacherRepository;

    beforeEach(() => {
        mockTeacherRepository = new MockTeacherRepository();
        enableTeacherUseCase = new EnableTeacherUseCase(mockTeacherRepository);
    });

    afterEach(() => {
        mockTeacherRepository.clearTeachers();
    });

    describe('When execute', () => {
        it('should enable teacher successfully', async () => {
            const user = new User('user-1', 'teacher1', 'hash', UserRole.TEACHER);
            const teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
            mockTeacherRepository.addTeacherEntity(teacher);

            const request: EnableTeacherRequest = {
                teacherId: 'teacher-1'
            };

            await enableTeacherUseCase.execute(request);

            const enabledTeacher = await mockTeacherRepository.findById('teacher-1');
            expect(enabledTeacher).toBeDefined();
        });
    });
});


