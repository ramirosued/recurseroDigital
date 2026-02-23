import { CourseRepository } from '../core/infrastructure/CourseRepository';
import { Course } from '../core/models/Course';
import { CourseGame } from '../core/models/CourseGame';
import { Game } from '../core/models/Game';

export class InMemoryCourseRepository implements CourseRepository {
  private courses: Course[] = [];
  private courseGames: { [courseId: string]: Set<string> } = {};

  constructor() {
  }

  async findByCourseName(courseName: string): Promise<Course | null> {
    const course = this.courses.find(c => c.name === courseName);
    return course || null;
  }

  async addCourse(user: Course): Promise<void> {
    this.courses.push(user);
  }

  async getAllCourses(): Promise<Course[]> {
    return [...this.courses];
  }

  async clearCourses(): Promise<void> {
    this.courses = [];
  }

  async findById(id: string): Promise<Course | null> {
    const course = this.courses.find(c => c.id === id);
    return course || null;
  }

  async getEnabledGamesByCourseId(courseId: string): Promise<CourseGame[]> {
    return [];
  }

  async getAllGamesByCourseId(courseId: string): Promise<CourseGame[]> {
    return [];
  }

  async getAllGames(): Promise<Game[]> {
    return [];
  }

  async addGameToCourse(courseGameId: string, courseId: string, gameId: string): Promise<void> {
    if (!this.courseGames[courseId]) {
      this.courseGames[courseId] = new Set<string>();
    }
    this.courseGames[courseId].add(gameId);
  }

  async updateCourseGameStatus(courseGameId: string, isEnabled: boolean): Promise<void> {
  }


  async createCourse(name: string, teacherId?: string): Promise<Course> {
    const courseId = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const course = new Course(courseId, name, teacherId || '', []);
    this.courses.push(course);

    return course;
  }

  async assignTeacherToCourse(teacherId: string, courseId: string): Promise<void> {
    const courseIndex = this.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) {
      throw new Error('Curso no encontrado');
    }
    
    this.courses[courseIndex].teacher_id = teacherId;
  }
  
  async getCoursesByTeacherId(teacherId: string): Promise<Course[]> {
    return this.courses.filter(course => course.teacher_id === teacherId);
  }

  async updateCourse(course: Course): Promise<void> {
    const courseIndex = this.courses.findIndex(c => c.id === course.id);
    if (courseIndex === -1) {
      throw new Error('Curso no encontrado');
    }
    this.courses[courseIndex] = course;
  }

  async deleteCourse(id: string): Promise<void> {
    const courseIndex = this.courses.findIndex(c => c.id === id);
    if (courseIndex === -1) {
      throw new Error('Curso no encontrado');
    }
    this.courses.splice(courseIndex, 1);
  }
  
}
