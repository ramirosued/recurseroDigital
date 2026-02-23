import { Teacher } from '../../../src/core/models/Teacher';
import { User, UserRole } from '../../../src/core/models/User';

describe('Teacher Model', () => {
    let user: User;
    let teacher: Teacher;

    beforeEach(() => {
        user = new User('user-1', 'teacher1', 'hashed_password', UserRole.TEACHER);
        teacher = new Teacher('teacher-1', 'María', 'García', 'maria@example.com', user);
    });

    describe('Constructor', () => {
        it('should create a teacher with all properties', () => {
            expect(teacher.id).toBe('teacher-1');
            expect(teacher.name).toBe('María');
            expect(teacher.surname).toBe('García');
            expect(teacher.email).toBe('maria@example.com');
            expect(teacher.user).toBe(user);
        });
    });

    describe('getUsername', () => {
        it('should return the username from user', () => {
            expect(teacher.getUsername()).toBe('teacher1');
        });
    });

    describe('getPasswordHash', () => {
        it('should return the password hash from user', () => {
            expect(teacher.getPasswordHash()).toBe('hashed_password');
        });
    });

    describe('getRole', () => {
        it('should return the role from user', () => {
            expect(teacher.getRole()).toBe(UserRole.TEACHER);
        });
    });
});


