import { Student } from '../../../src/core/models/Student';
import { User, UserRole } from '../../../src/core/models/User';

describe('Student Model', () => {
    let user: User;
    let student: Student;

    beforeEach(() => {
        user = new User('user-1', 'student1', 'hashed_password', UserRole.STUDENT);
        student = new Student('student-1', 'Juan', 'Pérez', '12345678', 'course-1', user);
    });

    describe('Constructor', () => {
        it('should create a student with all properties', () => {
            expect(student.id).toBe('student-1');
            expect(student.name).toBe('Juan');
            expect(student.lastname).toBe('Pérez');
            expect(student.dni).toBe('12345678');
            expect(student.courseId).toBe('course-1');
            expect(student.user).toBe(user);
        });

        it('should create a student with null courseId', () => {
            const studentWithoutCourse = new Student('student-2', 'María', 'García', '87654321', null, user);
            expect(studentWithoutCourse.courseId).toBeNull();
        });
    });

    describe('getUsername', () => {
        it('should return the username from user', () => {
            expect(student.getUsername()).toBe('student1');
        });
    });

    describe('getPasswordHash', () => {
        it('should return the password hash from user', () => {
            expect(student.getPasswordHash()).toBe('hashed_password');
        });
    });

    describe('getRole', () => {
        it('should return the role from user', () => {
            expect(student.getRole()).toBe(UserRole.STUDENT);
        });
    });

    describe('getCourseId', () => {
        it('should return the course id when assigned', () => {
            expect(student.getCourseId()).toBe('course-1');
        });

        it('should return null when no course is assigned', () => {
            const studentWithoutCourse = new Student('student-2', 'María', 'García', '87654321', null, user);
            expect(studentWithoutCourse.getCourseId()).toBeNull();
        });
    });
});


