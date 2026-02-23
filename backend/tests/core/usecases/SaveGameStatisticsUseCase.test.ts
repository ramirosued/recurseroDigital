import { SaveGameStatisticsUseCase, SaveGameStatisticsRequest } from '../../../src/core/usecases/SaveGameStatisticsUseCase';
import { SaveGameStatisticsValidationError } from '../../../src/core/models/exceptions/SaveGameStatisticsValidationError';
import { MockStudentStatisticsRepository } from '../../mocks/StudentStatisticsRepository.mock';
import { MockIdGenerator } from '../../mocks/IdGenerator.mock';
import { StudentStatistics } from '../../../src/core/models/StudentStatistics';

describe('SaveGameStatisticsUseCase', () => {
  let saveGameStatisticsUseCase: SaveGameStatisticsUseCase;
  let mockStatisticsRepository: MockStudentStatisticsRepository;
  let mockIdGenerator: MockIdGenerator;

  beforeEach(() => {
    mockStatisticsRepository = new MockStudentStatisticsRepository();
    mockIdGenerator = new MockIdGenerator();
    
    saveGameStatisticsUseCase = new SaveGameStatisticsUseCase(
      mockStatisticsRepository,
      mockIdGenerator
    );
  });

  afterEach(() => {
    mockStatisticsRepository.clearStatistics();
    mockIdGenerator.reset();
  });

  describe('When execute', () => {
    it('should save game statistics successfully', async () => {
      const request: SaveGameStatisticsRequest = {
        studentId: 'student-123',
        gameId: 'game-escritura',
        level: 1,
        activity: 1,
        points: 100,
        attempts: 2,
        correctAnswers: 8,
        totalQuestions: 10,
        completionTime: 120,
        isCompleted: true,
        maxUnlockedLevel: 2
      };

      const result = await saveGameStatisticsUseCase.execute(request);

      expect(result).toBeInstanceOf(StudentStatistics);
      expect(result.studentId).toBe(request.studentId);
      expect(result.gameId).toBe(request.gameId);
      expect(result.level).toBe(request.level);
      expect(result.activity).toBe(request.activity);
      expect(result.points).toBe(request.points);
      expect(result.attempts).toBe(request.attempts);
      expect(result.correctAnswers).toBe(request.correctAnswers);
      expect(result.totalQuestions).toBe(request.totalQuestions);
      expect(result.completionTime).toBe(request.completionTime);
      expect(result.isCompleted).toBe(request.isCompleted);
      expect(result.maxUnlockedLevel).toBe(request.maxUnlockedLevel);
    });

    it('should calculate total points correctly for first activity', async () => {
      const request: SaveGameStatisticsRequest = {
        studentId: 'student-123',
        gameId: 'game-escritura',
        level: 1,
        activity: 1,
        points: 100,
        attempts: 1,
        isCompleted: true
      };

      const result = await saveGameStatisticsUseCase.execute(request);

      expect(result.totalPoints).toBe(100); // Primera actividad, total = puntos de la actividad
    });

    it('should calculate total points correctly with existing statistics', async () => {
      // Primero guardar una estadística existente
      const existingStats = new StudentStatistics(
        'stat-1',
        'student-123',
        'game-escritura',
        1,
        1,
        50,
        50,
        1,
        true,
        1,
        new Date(),
        new Date()
      );
      mockStatisticsRepository.addStatistics(existingStats);

      const request: SaveGameStatisticsRequest = {
        studentId: 'student-123',
        gameId: 'game-escritura',
        level: 1,
        activity: 2,
        points: 75,
        attempts: 1,
        isCompleted: true
      };

      const result = await saveGameStatisticsUseCase.execute(request);

      expect(result.totalPoints).toBe(125); // 50 (existente) + 75 (nueva)
    });

    it('should use default maxUnlockedLevel when not provided', async () => {
      const request: SaveGameStatisticsRequest = {
        studentId: 'student-123',
        gameId: 'game-escritura',
        level: 3,
        activity: 1,
        points: 100,
        attempts: 1,
        isCompleted: true
      };

      const result = await saveGameStatisticsUseCase.execute(request);

      expect(result.maxUnlockedLevel).toBe(3); // Debería usar el nivel actual
    });

    it('should handle optional fields correctly', async () => {
      const request: SaveGameStatisticsRequest = {
        studentId: 'student-123',
        gameId: 'game-escritura',
        level: 1,
        activity: 1,
        points: 100,
        attempts: 1,
        isCompleted: true
      };

      const result = await saveGameStatisticsUseCase.execute(request);

      expect(result.correctAnswers).toBeUndefined();
      expect(result.totalQuestions).toBeUndefined();
      expect(result.completionTime).toBeUndefined();
    });

    it('should generate unique ID for statistics', async () => {
      const request: SaveGameStatisticsRequest = {
        studentId: 'student-123',
        gameId: 'game-escritura',
        level: 1,
        activity: 1,
        points: 100,
        attempts: 1,
        isCompleted: true
      };

      const result1 = await saveGameStatisticsUseCase.execute(request);
      const result2 = await saveGameStatisticsUseCase.execute(request);

      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
      expect(result1.id).not.toBe(result2.id);
    });

    it('should set correct timestamps', async () => {
      const beforeExecution = new Date();
      
      const request: SaveGameStatisticsRequest = {
        studentId: 'student-123',
        gameId: 'game-escritura',
        level: 1,
        activity: 1,
        points: 100,
        attempts: 1,
        isCompleted: true
      };

      const result = await saveGameStatisticsUseCase.execute(request);
      const afterExecution = new Date();

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(beforeExecution.getTime());
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(afterExecution.getTime());
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeExecution.getTime());
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(afterExecution.getTime());
    });

    it('should throw validation error when required fields are missing', async () => {
      const request = {
        studentId: 'student-123',
        gameId: 'game-escritura',
        activity: 1,
        points: 100,
        attempts: 1,
        isCompleted: true
      } as unknown as SaveGameStatisticsRequest;

      await expect(saveGameStatisticsUseCase.execute(request)).rejects.toBeInstanceOf(SaveGameStatisticsValidationError);
    });

    it('should throw validation error when values are invalid', async () => {
      const request: SaveGameStatisticsRequest = {
        studentId: 'student-123',
        gameId: 'game-escritura',
        level: 0,
        activity: 1,
        points: -10,
        attempts: -1,
        isCompleted: true
      };

      await expect(saveGameStatisticsUseCase.execute(request)).rejects.toBeInstanceOf(SaveGameStatisticsValidationError);
    });

    it('should handle different game types', async () => {
      const games = ['game-escritura', 'game-ordenamiento', 'game-descomposicion'];
      
      for (const gameId of games) {
        const request: SaveGameStatisticsRequest = {
          studentId: 'student-123',
          gameId,
          level: 1,
          activity: 1,
          points: 100,
          attempts: 1,
          isCompleted: true
        };

        const result = await saveGameStatisticsUseCase.execute(request);
        expect(result.gameId).toBe(gameId);
      }
    });

    it('should handle different students', async () => {
      const students = ['student-1', 'student-2', 'student-3'];
      
      for (const studentId of students) {
        const request: SaveGameStatisticsRequest = {
          studentId,
          gameId: 'game-escritura',
          level: 1,
          activity: 1,
          points: 100,
          attempts: 1,
          isCompleted: true
        };

        const result = await saveGameStatisticsUseCase.execute(request);
        expect(result.studentId).toBe(studentId);
      }
    });
  });
});
