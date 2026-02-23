import { Admin } from '../../../src/core/models/Admin';
import { User, UserRole } from '../../../src/core/models/User';

describe('Admin Model', () => {
    let user: User;
    let admin: Admin;

    beforeEach(() => {
        user = new User('user-1', 'admin1', 'hashed_password', UserRole.ADMIN);
        admin = new Admin('admin-1', 'user-1', 1, ['all'], user);
    });

    describe('Constructor', () => {
        it('should create an admin with all properties', () => {
            expect(admin.id).toBe('admin-1');
            expect(admin.nivelAcceso).toBe(1);
            expect(admin.permisos).toEqual(['all']);
            expect(admin.user).toBe(user);
        });

        it('should create an admin with multiple permissions', () => {
            const adminWithPermissions = new Admin('admin-2', 'user-2', 2, ['read', 'write', 'delete'], user);
            expect(adminWithPermissions.permisos).toEqual(['read', 'write', 'delete']);
        });
    });

    describe('getUsername', () => {
        it('should return the username from user', () => {
            expect(admin.getUsername()).toBe('admin1');
        });
    });

    describe('getPasswordHash', () => {
        it('should return the password hash from user', () => {
            expect(admin.getPasswordHash()).toBe('hashed_password');
        });
    });

    describe('getRole', () => {
        it('should return the role from user', () => {
            expect(admin.getRole()).toBe(UserRole.ADMIN);
        });
    });
});


