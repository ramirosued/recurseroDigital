import { User, UserRole } from './User';

export class Admin {
    id: string;
    nivelAcceso: number;
    permisos: string[];
    user: User;

    constructor(
        id: string,
        userId: string,
        nivelAcceso: number,
        permisos: string[],
        user: User
    ) {
        this.id = id;
        this.nivelAcceso = nivelAcceso;
        this.permisos = permisos;
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
