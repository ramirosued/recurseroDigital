import { TeacherRepository } from '../core/infrastructure/TeacherRepository';
import { Teacher } from '../core/models/Teacher';
import { User, UserRole } from '../core/models/User';

export class InMemoryTeacherRepository implements TeacherRepository {
  private teachers: Teacher[] = [];

  constructor() {
    // Usuario de prueba: teacher con password abcd1234
    const teacherUser = new User(
      '1',
      'Mariana@gmail.com',
      '$2b$10$pxoWnWCOR5f5tWmjLemzSuyeDzx3R8NFv4n80.F.Onh7hYKWMFYni',
      UserRole.TEACHER
    );
    const teacher = new Teacher('1', 'Mariana', 'García', 'Mariana@gmail.com', teacherUser);
    this.teachers = [teacher];
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
    // Baja lógica: no se implementa en memoria ya que no hay columna enable
    const index = this.teachers.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Profesor no encontrado');
    }
    // En memoria, simplemente removemos (comportamiento legacy para tests)
    // En producción se usará PostgreSQL con baja lógica
  }

  async enableTeacher(id: string): Promise<void> {
    // En memoria, simplemente verificamos que existe
    const index = this.teachers.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Profesor no encontrado');
    }
    // En memoria no hay columna enable, por lo que no hacemos nada adicional
  }

  async clearTeachers(): Promise<void> {
    this.teachers = [];
  }
}
