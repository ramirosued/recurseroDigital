import { StudentRepository } from '../core/infrastructure/StudentRepository';
import { StudentEntity } from './entities/StudentEntity';
import {Student} from "../core/models/Student";
import {User, UserRole} from "../core/models/User";

export class InMemoryStudentRepository implements StudentRepository {
  private students: StudentEntity[] = [];

  constructor() {
    this.students = [
        new StudentEntity(
            '1',
            '1', // user_id
            'nico@gmail.com',
            '$2b$10$T9xOluqoDwlRMZ/LeIdsL.MUagpZUkBOtq.ZR95Bp98tbYCr/yKr6', // hash de 'Recursero2025!'
            'Nicolás',
            'García',
            '12345678'
        )
    ];
  }

  async findByUserName(userName: string): Promise<Student | null> {
    const student = this.students.find(u => u.username === userName);
    if(student) {
        const user = new User(
            student.userId,
            student.username,
            student.passwordHash,
            UserRole.STUDENT
        );
        return new Student(
            student.id,
            student.name,
            student.lastname,
            student.dni,
            student.courseId,
            user
        );
    }
    return null;
  }

  async addStudent(studentData: Student): Promise<void> {
    const studentEntity = new StudentEntity(
      studentData.id,
      studentData.user.id,
      studentData.user.username,
      studentData.user.passwordHash,
      studentData.name,
      studentData.lastname,
      studentData.dni,
      studentData.courseId
    );
    this.students.push(studentEntity);
  }

  async getAllStudents(): Promise<Student[]> {
    return this.students.map(student => {
      const user = new User(
        student.userId,
        student.username,
        student.passwordHash,
        UserRole.STUDENT
      );
      return new Student(
        student.id,
        student.name,
        student.lastname,
        student.dni,
        student.courseId,
        user
      );
    });
  }

  async findById(id: string): Promise<Student | null> {
    const student = this.students.find(s => s.id === id);
    if (student) {
      const user = new User(
        student.userId,
        student.username,
        student.passwordHash,
        UserRole.STUDENT
      );
      return new Student(
        student.id,
        student.name,
        student.lastname,
        student.dni,
        student.courseId,
        user
      );
    }
    return null;
  }

  async updateStudent(studentData: Student): Promise<void> {
    const index = this.students.findIndex(s => s.id === studentData.id);
    if (index !== -1) {
      this.students[index] = new StudentEntity(
        studentData.id,
        studentData.user.id,
        studentData.user.username,
        studentData.user.passwordHash,
        studentData.name,
        studentData.lastname,
        studentData.dni,
        studentData.courseId
      );
    }
  }

  async deleteStudent(id: string): Promise<void> {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Estudiante no encontrado');
    }

  }

  async enableStudent(id: string): Promise<void> {
    // En memoria, simplemente verificamos que existe
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Estudiante no encontrado');
    }
  }

  async clearStudents(): Promise<void> {
    this.students = [];
  }

  async assignCourseToStudent(studentId: string, courseId: string): Promise<void> {
    const index = this.students.findIndex(s => s.id === studentId);
    if (index === -1) {
      throw new Error('Estudiante no encontrado');
    }
    const current = this.students[index];
    this.students[index] = new StudentEntity(
      current.id,
      current.userId,
      current.username,
      current.passwordHash,
      current.name,
      current.lastname,
      current.dni,
      courseId
    );
  }

  async getEnrollmentDate(studentId: string): Promise<Date | null> {
    const student = this.students.find(s => s.id === studentId);
    return student ? new Date() : null;
  }

  async getStudentsByCourseId(courseId: string): Promise<Student[]> {
    const filteredStudents = this.students.filter(s => s.courseId === courseId);
    return filteredStudents.map(student => {
      const user = new User(student.userId, student.username, student.passwordHash, UserRole.STUDENT);
      return new Student(
        student.id,
        student.name,
        student.lastname,
        student.dni,
        student.courseId,
        user
      );
    });
  }
}
