
export class StudentEntity {
    id: string;
    userId: string;
    username: string;
    passwordHash: string;
    name: string;
    lastname: string;
    dni: string;
    courseId: string | null;

    constructor(
        id: string,
        userId: string,
        username: string,
        passwordHash: string,
        name: string,
        lastname: string,
        dni: string,
        courseId: string | null = null
    ) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.lastname = lastname;
        this.dni = dni;
        this.username = username;
        this.passwordHash = passwordHash;
        this.courseId = courseId;
    }
}
