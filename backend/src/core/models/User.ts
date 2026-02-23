export enum UserRole {
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER',
    ADMIN = 'ADMIN'
}

export class User {
    id: string;
    username: string;
    role: UserRole;
    passwordHash: string;

    constructor(id: string, username: string, passwordHash: string, role: UserRole) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.passwordHash = passwordHash;
    }
}