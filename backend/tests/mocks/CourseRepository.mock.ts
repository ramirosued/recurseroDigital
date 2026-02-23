import { CourseRepository } from '../../src/core/infrastructure/CourseRepository';
import { Course } from '../../src/core/models/Course';
import { CourseGame } from '../../src/core/models/CourseGame';
import { Game } from '../../src/core/models/Game';

export class MockCourseRepository implements CourseRepository {
    private courses: Course[] = [];
    private courseGames: CourseGame[] = [];
    private games: Game[] = [];

    async findByCourseName(courseName: string): Promise<Course | null> {
        const course = this.courses.find(c => c.name === courseName);
        return course || null;
    }

    async addCourse(courseData: Course): Promise<void> {
        this.courses.push(courseData);
    }

    async getAllCourses(): Promise<Course[]> {
        return [...this.courses];
    }

    async findById(id: string): Promise<Course | null> {
        const course = this.courses.find(c => c.id === id);
        return course || null;
    }

    async getEnabledGamesByCourseId(courseId: string): Promise<CourseGame[]> {
        return this.courseGames.filter(cg => cg.courseId === courseId && cg.isEnabled);
    }

    async getAllGamesByCourseId(courseId: string): Promise<CourseGame[]> {
        return this.courseGames.filter(cg => cg.courseId === courseId);
    }

    async addGameToCourse(courseGameId: string, courseId: string, gameId: string): Promise<void> {
        const courseGame = new CourseGame(courseGameId, courseId, gameId);
        this.courseGames.push(courseGame);
    }

    async updateCourseGameStatus(courseGameId: string, isEnabled: boolean): Promise<void> {
        const courseGame = this.courseGames.find(cg => cg.id === courseGameId);
        if (courseGame) {
            courseGame.isEnabled = isEnabled;
        }
    }

    async createCourse(name: string, teacherId?: string): Promise<Course> {
        const course = new Course(this.generateId(), name, teacherId || '', []);
        this.courses.push(course);
        return course;
    }

    async assignTeacherToCourse(teacherId: string, courseId: string): Promise<void> {
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
            course.teacher_id = teacherId;
        }
    }

    async getCoursesByTeacherId(teacherId: string): Promise<Course[]> {
        return this.courses.filter(c => c.teacher_id === teacherId);
    }

    async updateCourse(course: Course): Promise<void> {
        const index = this.courses.findIndex(c => c.id === course.id);
        if (index !== -1) {
            this.courses[index] = course;
        }
    }

    async deleteCourse(id: string): Promise<void> {
        const index = this.courses.findIndex(c => c.id === id);
        if (index !== -1) {
            this.courses.splice(index, 1);
        }
    }

    async getAllGames(): Promise<Game[]> {
        return [...this.games];
    }

    clearCourses(): void {
        this.courses = [];
        this.courseGames = [];
    }

    addGame(game: Game): void {
        this.games.push(game);
    }

    addCourseGame(courseGame: CourseGame): void {
        this.courseGames.push(courseGame);
    }

    private generateId(): string {
        return `course-${Date.now()}`;
    }
}


