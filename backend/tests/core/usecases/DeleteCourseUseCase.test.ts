import { DeleteCourseUseCase, DeleteCourseRequest } from '../../../src/core/usecases/DeleteCourseUseCase';
import { MockCourseRepository } from '../../mocks/CourseRepository.mock';
import { Course } from '../../../src/core/models/Course';

describe('DeleteCourseUseCase', () => {
    let deleteCourseUseCase: DeleteCourseUseCase;
    let mockCourseRepository: MockCourseRepository;

    beforeEach(() => {
        mockCourseRepository = new MockCourseRepository();
        deleteCourseUseCase = new DeleteCourseUseCase(mockCourseRepository);
    });

    afterEach(() => {
        mockCourseRepository.clearCourses();
    });

    describe('When execute', () => {
        it('should delete course successfully', async () => {
            const course = new Course('course-1', 'Matemáticas', 'teacher-1', []);
            await mockCourseRepository.addCourse(course);

            const request: DeleteCourseRequest = {
                courseId: 'course-1'
            };

            await deleteCourseUseCase.execute(request);

            const deletedCourse = await mockCourseRepository.findById('course-1');
            expect(deletedCourse).toBeNull();
        });

        it('should throw error when course does not exist', async () => {
            const request: DeleteCourseRequest = {
                courseId: 'non-existent'
            };

            await expect(deleteCourseUseCase.execute(request))
                .rejects
                .toThrow('El curso no existe');
        });
    });
});


