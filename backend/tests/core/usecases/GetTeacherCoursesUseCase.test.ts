import { GetTeacherCoursesUseCase, GetTeacherCoursesRequest } from "../../../src/core/usecases/GetTeacherCoursesUseCase";
import { TeacherRepository } from "../../../src/core/infrastructure/TeacherRepository";
import { CourseRepository } from "../../../src/core/infrastructure/CourseRepository";
import { Teacher } from "../../../src/core/models/Teacher";
import { User, UserRole } from "../../../src/core/models/User";
import { Course } from "../../../src/core/models/Course";
import { TeacherNotFoundError } from "../../../src/core/models/exceptions/TeacherNotFoundError";
import { TeacherInvalidRequestError } from "../../../src/core/models/exceptions/TeacherInvalidRequestError";

class MockTeacherRepository implements TeacherRepository {
  private teacher: Teacher | null = null;

  setTeacher(teacher: Teacher | null): void {
    this.teacher = teacher;
  }

  async findByUserName(): Promise<Teacher | null> {
    return this.teacher;
  }

  async addTeacher(): Promise<void> {
    return;
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return [];
  }

  async findById(id: string): Promise<Teacher | null> {
    if (this.teacher && this.teacher.id === id) {
      return this.teacher;
    }
    return null;
  }

  async updateTeacher(): Promise<void> {
    return;
  }

  async deleteTeacher(): Promise<void> {
    return;
  }

  async enableTeacher(): Promise<void> {
    return;
  }
}

class MockCourseRepository implements CourseRepository {
  private courses: Course[] = [];

  setCourses(courses: Course[]): void {
    this.courses = courses;
  }

  async findByCourseName(): Promise<Course | null> {
    return null;
  }

  async addCourse(): Promise<void> {
    return;
  }

  async getAllCourses(): Promise<Course[]> {
    return [];
  }

  async findById(): Promise<Course | null> {
    return null;
  }

  async getEnabledGamesByCourseId(): Promise<any[]> {
    return [];
  }

  async getAllGamesByCourseId(): Promise<any[]> {
    return [];
  }

  async getAllGames(): Promise<any[]> {
    return [];
  }

  async updateCourseGameStatus(): Promise<void> {
    return;
  }

  async addGameToCourse(): Promise<void> {
    return;
  }

  async createCourse(name: string, teacherId?: string): Promise<Course> {
    return new Course("course-id", name, teacherId || "", []);
  }

  async assignTeacherToCourse(): Promise<void> {
    return;
  }

  async getCoursesByTeacherId(teacherId: string): Promise<Course[]> {
    return this.courses.filter(course => course.teacher_id === teacherId);
  }

  async updateCourse(course: Course): Promise<void> {
    const index = this.courses.findIndex(c => c.id === course.id);
    if (index !== -1) {
      this.courses[index] = course;
    }
  }

  async deleteCourse(id: string): Promise<void> {
    this.courses = this.courses.filter(c => c.id !== id);
  }
}

describe("GetTeacherCoursesUseCase", () => {
  let useCase: GetTeacherCoursesUseCase;
  let teacherRepository: MockTeacherRepository;
  let courseRepository: MockCourseRepository;
  let teacher: Teacher;
  let teacherUser: User;

  beforeEach(() => {
    teacherRepository = new MockTeacherRepository();
    courseRepository = new MockCourseRepository();
    useCase = new GetTeacherCoursesUseCase(teacherRepository, courseRepository);
    teacherUser = new User("user-1", "teacher@example.com", "hash", UserRole.TEACHER);
    teacher = new Teacher("teacher-1", "Ana", "Gomez", "teacher@example.com", teacherUser);
  });

  describe("execute", () => {
    it("should return teacher courses", async () => {
      const courses = [
        new Course("course-1", "Curso 1", "teacher-1", []),
        new Course("course-2", "Curso 2", "teacher-1", []),
        new Course("course-3", "Curso 3", "teacher-2", [])
      ];
      courseRepository.setCourses(courses);
      teacherRepository.setTeacher(teacher);

      const request: GetTeacherCoursesRequest = { teacherId: teacher.id };
      const result = await useCase.execute(request);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("course-1");
      expect(result[1].id).toBe("course-2");
    });

    it("should throw error when teacherId is missing", async () => {
      await expect(useCase.execute({ teacherId: "" })).rejects.toThrow(TeacherInvalidRequestError);
    });

    it("should throw error when teacher does not exist", async () => {
      teacherRepository.setTeacher(null);
      await expect(useCase.execute({ teacherId: "teacher-1" })).rejects.toThrow(TeacherNotFoundError);
    });
  });
});

