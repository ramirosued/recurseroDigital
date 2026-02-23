import { TeacherRepository } from '../../src/core/infrastructure/TeacherRepository';
import { Teacher } from '../../src/core/models/Teacher';
import { User, UserRole } from '../../src/core/models/User';

export class MockTeacherRepository implements TeacherRepository {
    private teachers: Teacher[] = [];

    constructor(teachers: Teacher[] = []) {
        this.teachers = teachers;
    }

    async findByUserName(userName: string): Promise<Teacher | null> {
        const teacher = this.teachers.find(t => t.user.username === userName);
        return teacher || null;
    }

    async addTeacher(teacherData: Teacher): Promise<void> {
        this.teachers.push(teacherData);
    }

    async getAllTeachers(): Promise<Teacher[]> {
        return [...this.teachers];
    }

    async findById(id: string): Promise<Teacher | null> {
        const teacher = this.teachers.find(t => t.id === id);
        return teacher || null;
    }

    async updateTeacher(teacherData: Teacher): Promise<void> {
        const index = this.teachers.findIndex(t => t.id === teacherData.id);
        if (index !== -1) {
            this.teachers[index] = teacherData;
        }
    }

    async deleteTeacher(id: string): Promise<void> {
        const index = this.teachers.findIndex(t => t.id === id);
        if (index !== -1) {
            this.teachers.splice(index, 1);
        }
    }

    async enableTeacher(id: string): Promise<void> {
        const index = this.teachers.findIndex(t => t.id === id);
        if (index !== -1) {
            // Mock implementation
        }
    }

    clearTeachers(): void {
        this.teachers = [];
    }

    addTeacherEntity(teacher: Teacher): void {
        this.teachers.push(teacher);
    }
}


