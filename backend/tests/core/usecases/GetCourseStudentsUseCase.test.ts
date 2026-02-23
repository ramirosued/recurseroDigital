import { GetCourseStudentsUseCase } from '../../../src/core/usecases/GetCourseStudentsUseCase';
import { MockStudentRepository } from '../../mocks/StudentRepository.mock';
import { MockStudentStatisticsRepository } from '../../mocks/StudentStatisticsRepository.mock';
import { CourseRepository } from '../../../src/core/infrastructure/CourseRepository';
import { GameLevelRepository } from '../../../src/core/infrastructure/GameLevelRepository';
import { CourseGame } from '../../../src/core/models/CourseGame';
import { Game } from '../../../src/core/models/Game';
import { User, UserRole } from '../../../src/core/models/User';
import { StudentStatistics } from '../../../src/core/models/StudentStatistics';
import { StudentEntity } from '../../../src/infrastructure/entities/StudentEntity';
import { GameLevel, GameLevelConfig } from '../../../src/core/models/GameLevel';

class MockCourseRepository implements CourseRepository {
    private courseGames: Map<string, CourseGame[]> = new Map();

    async getStudentsByCourseId(courseId: string) {
        throw new Error('Not implemented in mock');
    }

    async getAllGamesByCourseId(courseId: string): Promise<CourseGame[]> {
        return this.courseGames.get(courseId) || [];
    }

    addCourseGame(courseId: string, courseGame: CourseGame): void {
        const games = this.courseGames.get(courseId) || [];
        games.push(courseGame);
        this.courseGames.set(courseId, games);
    }

    clear(): void {
        this.courseGames.clear();
    }

    async findByCourseName(courseName: string) { return null; }
    async addCourse(courseData: any) {}
    async getAllCourses() { return []; }
    async findById(id: string) { return null; }
    async getEnabledGamesByCourseId(courseId: string) { return []; }
    async addGameToCourse(courseGameId: string, courseId: string, gameId: string) {}
    async updateCourseGameStatus(courseGameId: string, isEnabled: boolean) {}
    async createCourse(name: string, teacherId?: string): Promise<any> { throw new Error('Not implemented'); }
    async assignTeacherToCourse(teacherId: string, courseId: string) {}
    async getCoursesByTeacherId(teacherId: string) { return []; }
    async updateCourse(course: any) {}
    async deleteCourse(id: string) {}
    async getAllGames() { return []; }
}

class MockGameLevelRepository implements GameLevelRepository {
    private gameLevels: Map<string, GameLevel[]> = new Map();

    async findByGameId(gameId: string) { return this.gameLevels.get(gameId) || []; }
    async findByGameIdAndLevel(gameId: string, level: number) { return null; }
    async findById(id: string) { return null; }
    async findActiveByGameId(gameId: string) { return []; }
    async save(gameLevel: any) { return gameLevel; }
    async update(id: string, gameLevel: any) { return null; }
    async delete(id: string) { return false; }
    async findAll() { return []; }
    async getTotalActivitiesCount(gameId: string) {
        const levels = this.gameLevels.get(gameId) || [];
        return levels.reduce((total, level) => total + level.getActivitiesCount(), 0);
    }

    addLevel(gameLevel: GameLevel): void {
        const gameId = gameLevel.getGameId();
        const levels = this.gameLevels.get(gameId) || [];
        levels.push(gameLevel);
        this.gameLevels.set(gameId, levels);
    }

    clear(): void {
        this.gameLevels.clear();
    }
}

describe('GetCourseStudentsUseCase', () => {
    let useCase: GetCourseStudentsUseCase;
    let mockStudentRepository: MockStudentRepository;
    let mockStatisticsRepository: MockStudentStatisticsRepository;
    let mockCourseRepository: MockCourseRepository;
    let mockGameLevelRepository: MockGameLevelRepository;

    beforeEach(() => {
        mockStudentRepository = new MockStudentRepository();
        mockStatisticsRepository = new MockStudentStatisticsRepository();
        mockCourseRepository = new MockCourseRepository();
        mockGameLevelRepository = new MockGameLevelRepository();

        useCase = new GetCourseStudentsUseCase(
            mockStudentRepository,
            mockStatisticsRepository,
            mockCourseRepository,
            mockGameLevelRepository
        );
    });

    afterEach(() => {
        mockStudentRepository.clearStudents();
        mockStatisticsRepository.clearStatistics();
        mockCourseRepository.clear();
        mockGameLevelRepository.clear();
    });

    describe('execute', () => {
        it('should return empty students array when course has no students', async () => {
            const result = await useCase.execute({ courseId: 'course-1' });

            expect(result.courseId).toBe('course-1');
            expect(result.students).toEqual([]);
        });

        it('should return student details for single student without statistics', async () => {
            const studentEntity = createStudentEntity('student-1', 'Juan', 'Pérez', 'juan.perez', 'course-1');
            mockStudentRepository.addStudentEntity(studentEntity);

            const game1 = new Game('game-1', 'Ordenamiento', 'Descripción', 'url', '/ordenamiento', 1, true);
            const courseGame1 = new CourseGame('cg-1', 'course-1', 'game-ordenamiento', true, 0, game1);
            mockCourseRepository.addCourseGame('course-1', courseGame1);

            const result = await useCase.execute({ courseId: 'course-1' });

            expect(result.students).toHaveLength(1);
            expect(result.students[0].id).toBe('student-1');
            expect(result.students[0].name).toBe('Juan');
            expect(result.students[0].lastname).toBe('Pérez');
            expect(result.students[0].userName).toBe('juan.perez');
            expect(result.students[0].totalGamesPlayed).toBe(0);
            expect(result.students[0].averageScore).toBe(0);
            expect(result.students[0].lastActivity).toBeNull();
            expect(result.students[0].progressByGame).toHaveProperty('ordenamiento');
            expect(result.students[0].progressByGame['ordenamiento']).toEqual({
                completed: 0,
                totalTime: 0,
                averageScore: 0,
                totalAttempts: 0
            });
        });

        it('should return student details with aggregated statistics', async () => {
            const studentEntity = createStudentEntity('student-1', 'María', 'García', 'maria.garcia', 'course-1');
            mockStudentRepository.addStudentEntity(studentEntity);

            const game1 = new Game('game-1', 'Ordenamiento', 'Descripción', 'url', '/ordenamiento', 1, true);
            const game2 = new Game('game-2', 'Escritura', 'Descripción', 'url', '/escritura', 1, true);
            const courseGame1 = new CourseGame('cg-1', 'course-1', 'game-ordenamiento', true, 0, game1);
            const courseGame2 = new CourseGame('cg-2', 'course-1', 'game-escritura', true, 1, game2);
            mockCourseRepository.addCourseGame('course-1', courseGame1);
            mockCourseRepository.addCourseGame('course-1', courseGame2);

            const statistics = [
                createStatistic('stat-1', 'student-1', 'game-ordenamiento', 100, 10, 10, 30),
                createStatistic('stat-2', 'student-1', 'game-ordenamiento', 80, 8, 10, 25),
                createStatistic('stat-3', 'student-1', 'game-escritura', 90, 9, 10, 20)
            ];

            statistics.forEach(stat => mockStatisticsRepository.addStatistics(stat));

            const result = await useCase.execute({ courseId: 'course-1' });

            expect(result.students).toHaveLength(1);
            const studentDetails = result.students[0];
            
            expect(studentDetails.id).toBe('student-1');
            expect(studentDetails.name).toBe('María');
            expect(studentDetails.lastname).toBe('García');
            expect(studentDetails.userName).toBe('maria.garcia');
            expect(studentDetails.enrollmentDate).toBeTruthy();
            expect(studentDetails.totalGamesPlayed).toBe(2);
            expect(studentDetails.averageScore).toBe(90); // (100 + 80 + 90) / 3
            expect(studentDetails.lastActivity).toBeTruthy();
            expect(studentDetails.progressByGame['ordenamiento']).toBeDefined();
            expect(studentDetails.progressByGame['escritura']).toBeDefined();
        });

        it('should normalize game IDs by removing "game-" prefix', async () => {
            const studentEntity = createStudentEntity('student-1', 'Carlos', 'López', 'carlos.lopez', 'course-1');
            mockStudentRepository.addStudentEntity(studentEntity);

            const game1 = new Game('game-1', 'Ordenamiento', 'Descripción', 'url', '/ordenamiento', 1, true);
            const game2 = new Game('game-2', 'Escritura', 'Descripción', 'url', '/escritura', 1, true);
            const courseGame1 = new CourseGame('cg-1', 'course-1', 'game-ordenamiento', true, 0, game1);
            const courseGame2 = new CourseGame('cg-2', 'course-1', 'game-escritura', true, 1, game2);
            mockCourseRepository.addCourseGame('course-1', courseGame1);
            mockCourseRepository.addCourseGame('course-1', courseGame2);

            const statistics = [
                createStatistic('stat-1', 'student-1', 'game-ordenamiento', 100, 10, 10, 30),
                createStatistic('stat-2', 'student-1', 'game-escritura', 80, 8, 10, 25)
            ];
            statistics.forEach(stat => mockStatisticsRepository.addStatistics(stat));

            const result = await useCase.execute({ courseId: 'course-1' });

            const progressByGame = result.students[0].progressByGame;
            expect(progressByGame['ordenamiento']).toBeDefined();
            expect(progressByGame['escritura']).toBeDefined();
            expect(progressByGame['game-ordenamiento']).toBeUndefined();
            expect(progressByGame['game-escritura']).toBeUndefined();
        });

        it('should handle multiple students correctly', async () => {
            const student1 = createStudentEntity('student-1', 'Ana', 'Martínez', 'ana.martinez', 'course-1');
            const student2 = createStudentEntity('student-2', 'Luis', 'Rodríguez', 'luis.rodriguez', 'course-1');
            
            mockStudentRepository.addStudentEntity(student1);
            mockStudentRepository.addStudentEntity(student2);

            const game1 = new Game('game-1', 'Ordenamiento', 'Descripción', 'url', '/ordenamiento', 1, true);
            const game2 = new Game('game-2', 'Escritura', 'Descripción', 'url', '/escritura', 1, true);
            const courseGame1 = new CourseGame('cg-1', 'course-1', 'game-ordenamiento', true, 0, game1);
            const courseGame2 = new CourseGame('cg-2', 'course-1', 'game-escritura', true, 1, game2);
            mockCourseRepository.addCourseGame('course-1', courseGame1);
            mockCourseRepository.addCourseGame('course-1', courseGame2);
            
            const stats1 = [createStatistic('stat-1', 'student-1', 'game-ordenamiento', 100, 10, 10, 30)];
            const stats2 = [createStatistic('stat-2', 'student-2', 'game-escritura', 80, 8, 10, 25)];

            stats1.forEach(stat => mockStatisticsRepository.addStatistics(stat));
            stats2.forEach(stat => mockStatisticsRepository.addStatistics(stat));

            const result = await useCase.execute({ courseId: 'course-1' });

            expect(result.students).toHaveLength(2);
            expect(result.students[0].name).toBe('Ana');
            expect(result.students[1].name).toBe('Luis');
        });

        it('should calculate progress by game correctly', async () => {
            const studentEntity = createStudentEntity('student-1', 'Elena', 'Torres', 'elena.torres', 'course-1');
            mockStudentRepository.addStudentEntity(studentEntity);

            const game1 = new Game('game-1', 'Ordenamiento', 'Descripción', 'url', '/ordenamiento', 1, true);
            const courseGame1 = new CourseGame('cg-1', 'course-1', 'game-ordenamiento', true, 0, game1);
            mockCourseRepository.addCourseGame('course-1', courseGame1);

            // Configurar niveles de juego para calcular el porcentaje de progreso
            const config: GameLevelConfig = {};
            const level1 = new GameLevel(
                'level-1',
                'game-ordenamiento',
                1,
                'Nivel 1',
                'Descripción nivel 1',
                'easy',
                5,
                config,
                true
            );
            mockGameLevelRepository.addLevel(level1);

            // Las estadísticas tienen actividad 1 completada en nivel 1 de 5 actividades totales
            // Por lo tanto: (1 / 5) * 100 = 20%
            const statistics = [
                createStatistic('stat-1', 'student-1', 'game-ordenamiento', 100, 10, 10, 30, true, 1, 1),
                createStatistic('stat-2', 'student-1', 'game-ordenamiento', 80, 8, 10, 25, true, 1, 1),
                createStatistic('stat-3', 'student-1', 'game-ordenamiento', 90, 9, 10, 20, false, 1, 1)
            ];
            statistics.forEach(stat => mockStatisticsRepository.addStatistics(stat));

            const result = await useCase.execute({ courseId: 'course-1' });

            const progress = result.students[0].progressByGame['ordenamiento'];
            expect(progress.completed).toBe(2); // Solo 2 completadas
            expect(progress.totalTime).toBe(75); // 30 + 25 + 20
            expect(progress.averageScore).toBe(20); // 1 actividad de 5 totales = 20%
        });
    });

    describe('integration scenarios', () => {
        it('should handle real-world scenario with mixed statistics', async () => {
            const studentEntity = createStudentEntity('student-1', 'Sofia', 'Hernández', 'sofia.hernandez', 'course-1');
            mockStudentRepository.addStudentEntity(studentEntity);

            const game1 = new Game('game-1', 'Ordenamiento', 'Descripción', 'url', '/ordenamiento', 1, true);
            const game2 = new Game('game-2', 'Escritura', 'Descripción', 'url', '/escritura', 1, true);
            const game3 = new Game('game-3', 'Descomposición', 'Descripción', 'url', '/descomposicion', 1, true);
            const game4 = new Game('game-4', 'Escala', 'Descripción', 'url', '/escala', 1, true);
            const courseGame1 = new CourseGame('cg-1', 'course-1', 'game-ordenamiento', true, 0, game1);
            const courseGame2 = new CourseGame('cg-2', 'course-1', 'game-escritura', true, 1, game2);
            const courseGame3 = new CourseGame('cg-3', 'course-1', 'game-descomposicion', true, 2, game3);
            const courseGame4 = new CourseGame('cg-4', 'course-1', 'game-escala', true, 3, game4);
            mockCourseRepository.addCourseGame('course-1', courseGame1);
            mockCourseRepository.addCourseGame('course-1', courseGame2);
            mockCourseRepository.addCourseGame('course-1', courseGame3);
            mockCourseRepository.addCourseGame('course-1', courseGame4);

            const statistics = [
                // Ordenamiento - 2 completadas
                createStatistic('stat-1', 'student-1', 'game-ordenamiento', 100, 10, 10, 30, true),
                createStatistic('stat-2', 'student-1', 'game-ordenamiento', 80, 8, 10, 25, true),
                createStatistic('stat-3', 'student-1', 'game-ordenamiento', 90, 9, 10, 20, false),
                // Escritura - 1 completada
                createStatistic('stat-4', 'student-1', 'game-escritura', 85, 8, 10, 15, true),
                // Descomposición - sin completar
                createStatistic('stat-5', 'student-1', 'game-descomposicion', 70, 7, 10, 40, false)
            ];
            statistics.forEach(stat => mockStatisticsRepository.addStatistics(stat));

            const result = await useCase.execute({ courseId: 'course-1' });

            const studentDetails = result.students[0];
            expect(studentDetails.totalGamesPlayed).toBe(3);
            expect(studentDetails.averageScore).toBe(84); // (100 + 80 + 90 + 80 + 70) / 5 = 84

            expect(studentDetails.progressByGame['ordenamiento'].completed).toBe(2);
            expect(studentDetails.progressByGame['ordenamiento'].totalTime).toBe(75);

            expect(studentDetails.progressByGame['escritura'].completed).toBe(1);
            expect(studentDetails.progressByGame['escritura'].totalTime).toBe(15);

            expect(studentDetails.progressByGame['descomposicion'].completed).toBe(0);
            expect(studentDetails.progressByGame['descomposicion'].totalTime).toBe(40);

            // El juego escala no fue jugado, debe aparecer con 0%
            expect(studentDetails.progressByGame['escala']).toBeDefined();
            expect(studentDetails.progressByGame['escala'].completed).toBe(0);
            expect(studentDetails.progressByGame['escala'].totalTime).toBe(0);
            expect(studentDetails.progressByGame['escala'].averageScore).toBe(0);
            expect(studentDetails.progressByGame['escala'].totalAttempts).toBe(0);
        });
    });
});

// Helper functions
function createStudentEntity(
    id: string,
    name: string,
    lastname: string,
    username: string,
    courseId: string
): StudentEntity {
    return new StudentEntity(
        id,
        `user-${id}`,
        username,
        'hashedPassword',
        name,
        lastname,
        '12345678',
        courseId
    );
}

function createStatistic(
    id: string,
    studentId: string,
    gameId: string,
    points: number,
    correctAnswers: number,
    totalQuestions: number,
    completionTime: number,
    isCompleted: boolean = true,
    level: number = 1,
    activity: number = 1
): StudentStatistics {
    return new StudentStatistics(
        id,
        studentId,
        gameId,
        level,
        activity,
        points,
        points,
        1,
        isCompleted,
        1,
        new Date(),
        new Date(),
        correctAnswers,
        totalQuestions,
        completionTime
    );
}

