import { User, UserRole } from './User';

export class Teacher {
    id: string;
    name: string;
    surname: string;
    email: string;
    user: User;

    constructor(
        id: string,
        name: string,
        surname: string,
        email: string,
        user: User
    ) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.user = user;
    }

    getUsername(): string {
        return this.user.username;
    }

    getPasswordHash(): string {
        return this.user.passwordHash;
    }

    getRole(): UserRole {
        return this.user.role;
    }
}
