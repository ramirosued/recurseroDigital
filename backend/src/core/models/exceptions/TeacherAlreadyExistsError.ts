export class TeacherAlreadyExistsError extends Error {
    constructor(message: string = 'El nombre de usuario ya existe') {
        super(message);
        this.name = 'TeacherAlreadyExistsError';
    }
}

