import { EnableStudentUseCase, EnableStudentRequest } from '../../../src/core/usecases/EnableStudentUseCase';
import { MockStudentRepository } from '../../mocks/StudentRepository.mock';
import { StudentEntity } from '../../../src/infrastructure/entities/StudentEntity';

describe('EnableStudentUseCase', () => {
    let enableStudentUseCase: EnableStudentUseCase;
    let mockStudentRepository: MockStudentRepository;

    beforeEach(() => {
        mockStudentRepository = new MockStudentRepository();
        enableStudentUseCase = new EnableStudentUseCase(mockStudentRepository);
    });

    afterEach(() => {
        mockStudentRepository.clearStudents();
    });

    describe('When execute', () => {
        it('should enable student successfully', async () => {
            const entity = new StudentEntity(
                'student-1',
                'user-1',
                'student1',
                'hash',
                'Juan',
                'Pérez',
                '12345678',
                'course-1'
            );
            mockStudentRepository.addStudentEntity(entity);

            const request: EnableStudentRequest = {
                studentId: 'student-1'
            };

            await enableStudentUseCase.execute(request);

            const student = await mockStudentRepository.findById('student-1');
            expect(student).toBeDefined();
        });
    });
});


