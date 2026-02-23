import { User, UserRole } from '../../../src/core/models/User';

describe('User Model', () => {
    describe('Constructor', () => {
        it('should create a user with all properties', () => {
            const user = new User('1', 'testuser', 'hashed_password', UserRole.STUDENT);

            expect(user.id).toBe('1');
            expect(user.username).toBe('testuser');
            expect(user.passwordHash).toBe('hashed_password');
            expect(user.role).toBe(UserRole.STUDENT);
        });

        it('should create user with STUDENT role', () => {
            const user = new User('1', 'student', 'hash', UserRole.STUDENT);
            expect(user.role).toBe(UserRole.STUDENT);
        });

        it('should create user with TEACHER role', () => {
            const user = new User('2', 'teacher', 'hash', UserRole.TEACHER);
            expect(user.role).toBe(UserRole.TEACHER);
        });

        it('should create user with ADMIN role', () => {
            const user = new User('3', 'admin', 'hash', UserRole.ADMIN);
            expect(user.role).toBe(UserRole.ADMIN);
        });
    });

    describe('UserRole enum', () => {
        it('should have correct enum values', () => {
            expect(UserRole.STUDENT).toBe('STUDENT');
            expect(UserRole.TEACHER).toBe('TEACHER');
            expect(UserRole.ADMIN).toBe('ADMIN');
        });
    });
});


