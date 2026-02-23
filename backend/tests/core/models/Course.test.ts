import { Course } from '../../../src/core/models/Course';
import { Student } from '../../../src/core/models/Student';
import { User, UserRole } from '../../../src/core/models/User';

describe('Course Model', () => {
    let students: Student[];
    let course: Course;

    beforeEach(() => {
        const user1 = new User('user-1', 'student1', 'hash1', UserRole.STUDENT);
        const user2 = new User('user-2', 'student2', 'hash2', UserRole.STUDENT);
        const student1 = new Student('student-1', 'Juan', 'Pérez', '12345678', 'course-1', user1);
        const student2 = new Student('student-2', 'María', 'García', '87654321', 'course-1', user2);
        students = [student1, student2];
        course = new Course('course-1', 'Matemáticas', 'teacher-1', students);
    });

    describe('Constructor', () => {
        it('should create a course with all properties', () => {
            expect(course.id).toBe('course-1');
            expect(course.name).toBe('Matemáticas');
            expect(course.teacher_id).toBe('teacher-1');
            expect(course.students).toEqual(students);
            expect(course.students.length).toBe(2);
        });

        it('should create a course with empty students array', () => {
            const emptyCourse = new Course('course-2', 'Lengua', 'teacher-1', []);
            expect(emptyCourse.students).toEqual([]);
        });
    });
});


