import {Student} from "../models/Student";

export interface StudentRepository {
    findByUserName(userName: string): Promise<Student | null>;
    addStudent(studentData: Student): Promise<void>;
    getAllStudents(): Promise<Student[]>;
    findById(id: string): Promise<Student | null>;
    updateStudent(studentData: Student): Promise<void>;
    deleteStudent(id: string): Promise<void>; 
    enableStudent(id: string): Promise<void>; 
    assignCourseToStudent(studentId: string, courseId: string): Promise<void>;
    getEnrollmentDate(studentId: string): Promise<Date | null>;
    getStudentsByCourseId(courseId: string): Promise<Student[]>;
}