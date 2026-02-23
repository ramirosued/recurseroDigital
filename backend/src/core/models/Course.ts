import { Student } from './Student';

export class Course {
    id: string;
    name: string;
    teacher_id: string;
    students: Student[];

    constructor(id: string, name: string, teacher_id: string, students: Student[]) {
        this.id = id;
        this.name= name;
        this.teacher_id= teacher_id;
        this.students= students;
    }
}
