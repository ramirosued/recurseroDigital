import { GetGameStatisticsUseCase, GetGameStatisticsRequest } from '../../../src/core/usecases/GetGameStatisticsUseCase';
import { MockStudentStatisticsRepository } from '../../mocks/StudentStatisticsRepository.mock';
import { StudentStatistics } from '../../../src/core/models/StudentStatistics';

describe('GetGameStatisticsUseCase', () => {
  let getGameStatisticsUseCase: GetGameStatisticsUseCase;
  let mockStatisticsRepository: MockStudentStatisticsRepository;

  beforeEach(() => {
    mockStatisticsRepository = new MockStudentStatisticsRepository();
    getGameStatisticsUseCase = new GetGameStatisticsUseCase(mockStatisticsRepository);
  });

  afterEach(() => {
    mockStatisticsRepository.clearStatistics();
  });

  const createTestStatistics = () => {
    const stats: StudentStatistics[] = [
      // Estadísticas del estudiante 1 en juego de escritura
      new StudentStatistics(
        'stat-1',
        'student-1',
        'game-escritura',
        1,
        1,
        50,
        50,
        1,
        true,
        2,
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T10:05:00Z'),
        8,
        10,
        60
      ),
      new StudentStatistics(
        'stat-2',
        'student-1',
        'game-escritura',
        2,
        1,
        75,
        125,
        2,
        true,
        2,
        new Date('2024-01-01T11:00:00Z'),
        new Date('2024-01-01T11:10:00Z'),
        9,
        10,
        90
      ),
      // Estadísticas del estudiante 2 en juego de escritura
      new StudentStatistics(
        'stat-3',
        'student-2',
        'game-escritura',
        1,
        1,
        60,
        60,
        1,
        true,
        1,
        new Date('2024-01-01T12:00:00Z'),
        new Date('2024-01-01T12:05:00Z'),
        7,
        10,
        120
      ),
      new StudentStatistics(
        'stat-4',
        'student-2',
        'game-escritura',
        1,
        2,
        40,
        100,
        3,
        false, // no completado
        1,
        new Date('2024-01-01T13:00:00Z'),
        new Date('2024-01-01T13:15:00Z'),
        5,
        10,
        180
      ),
      // Estadísticas del estudiante 3 en juego de escritura
      new StudentStatistics(
        'stat-5',
        'student-3',
        'game-escritura',
        1,
        1,
        80,
        80,
        1,
        true,
        1,
        new Date('2024-01-01T14:00:00Z'),
        new Date('2024-01-01T14:05:00Z'),
        10,
        10,
        45
      ),
      // Estadísticas en otro juego (no deberían incluirse)
      new StudentStatistics(
        'stat-6',
        'student-1',
        'game-ordenamiento',
        1,
        1,
        70,
        70,
        1,
        true,
        1,
        new Date('2024-01-01T15:00:00Z'),
        new Date('2024-01-01T15:05:00Z'),
        8,
        10,
        75
      )
    ];

    stats.forEach(stat => mockStatisticsRepository.addStatistics(stat));
    return stats;
  };

  describe('When execute', () => {
    it('should return game statistics correctly', async () => {
      createTestStatistics();
      
      const request: GetGameStatisticsRequest = {
        gameId: 'game-escritura'
      };

      const result = await getGameStatisticsUseCase.execute(request);

      expect(result.gameId).toBe('game-escritura');
      expect(result.totalStudents).toBe(3); // 3 estudiantes únicos
      expect(result.studentProgress).toHaveLength(3);
    });

    it('should calculate average points correctly', async () => {
      createTestStatistics();
      
      const request: GetGameStatisticsRequest = {
        gameId: 'game-escritura'
      };

      const result = await getGameStatisticsUseCase.execute(request);

      // Total de puntos: 50 + 75 + 60 + 40 + 80 = 305
      // Número de estadísticas: 5
      // Promedio: 305 / 5 = 61
      expect(result.averagePoints).toBe(61);
    });

    it('should calculate average accuracy correctly', async () => {
      createTestStatistics();
      
      const request: GetGameStatisticsRequest = {
        gameId: 'game-escritura'
      };

      const result = await getGameStatisticsUseCase.execute(request);

      // Accuracy por estadística: 80%, 90%, 70%, 50%, 100%
      // Promedio: (80 + 90 + 70 + 50 + 100) / 5 = 78%
      expect(result.averageAccuracy).toBe(78);
    });

    it('should calculate completion rate correctly', async () => {
      createTestStatistics();
      
      const request: GetGameStatisticsRequest = {
        gameId: 'game-escritura'
      };

      const result = await getGameStatisticsUseCase.execute(request);

      // 4 completadas de 5 total = 80%
      expect(result.completionRate).toBe(80);
    });

    it('should include correct student progress data', async () => {
      createTestStatistics();
      
      const request: GetGameStatisticsRequest = {
        gameId: 'game-escritura'
      };

      const result = await getGameStatisticsUseCase.execute(request);

      expect(result.studentProgress).toHaveLength(3);
      
      // Verificar que cada estudiante tiene sus datos correctos
      const student1Progress = result.studentProgress.find(sp => sp.studentId === 'student-1');
      expect(student1Progress).toBeDefined();
      expect(student1Progress!.maxUnlockedLevel).toBe(2);
      expect(student1Progress!.totalPoints).toBe(125); // 50 + 75
      expect(student1Progress!.completionRate).toBe(100); // 2 de 2 completadas
      expect(student1Progress!.averageAccuracy).toBeCloseTo(85, 1); // (80 + 90) / 2

      const student2Progress = result.studentProgress.find(sp => sp.studentId === 'student-2');
      expect(student2Progress).toBeDefined();
      expect(student2Progress!.maxUnlockedLevel).toBe(1);
      expect(student2Progress!.totalPoints).toBe(100); // 60 + 40
      expect(student2Progress!.completionRate).toBe(50); // 1 de 2 completadas
      expect(student2Progress!.averageAccuracy).toBe(60); // (70 + 50) / 2

      const student3Progress = result.studentProgress.find(sp => sp.studentId === 'student-3');
      expect(student3Progress).toBeDefined();
      expect(student3Progress!.maxUnlockedLevel).toBe(1);
      expect(student3Progress!.totalPoints).toBe(80);
      expect(student3Progress!.completionRate).toBe(100); // 1 de 1 completada
      expect(student3Progress!.averageAccuracy).toBe(100);
    });

    it('should return empty statistics when game has no data', async () => {
      createTestStatistics();
      
      const request: GetGameStatisticsRequest = {
        gameId: 'game-descomposicion'
      };

      const result = await getGameStatisticsUseCase.execute(request);

      expect(result.gameId).toBe('game-descomposicion');
      expect(result.totalStudents).toBe(0);
      expect(result.averagePoints).toBe(0);
      expect(result.averageAccuracy).toBe(0);
      expect(result.completionRate).toBe(0);
      expect(result.studentProgress).toHaveLength(0);
    });

    it('should handle student names correctly', async () => {
      createTestStatistics();
      
      const request: GetGameStatisticsRequest = {
        gameId: 'game-escritura'
      };

      const result = await getGameStatisticsUseCase.execute(request);

      result.studentProgress.forEach(studentProgress => {
        expect(studentProgress.studentName).toMatch(/^Estudiante student-\d+$/);
      });
    });

    it('should include last activity timestamps', async () => {
      createTestStatistics();
      
      const request: GetGameStatisticsRequest = {
        gameId: 'game-escritura'
      };

      const result = await getGameStatisticsUseCase.execute(request);

      result.studentProgress.forEach(studentProgress => {
        expect(studentProgress.lastActivity).toBeInstanceOf(Date);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle statistics with no questions correctly', async () => {
      const stats = [
        new StudentStatistics(
          'stat-1',
          'student-1',
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
        )
      ];

      stats.forEach(stat => mockStatisticsRepository.addStatistics(stat));

      const request: GetGameStatisticsRequest = {
        gameId: 'game-escritura'
      };

      const result = await getGameStatisticsUseCase.execute(request);

      expect(result.averageAccuracy).toBe(0); // Sin preguntas, accuracy = 0
    });

    it('should handle single student correctly', async () => {
      const stats = [
        new StudentStatistics(
          'stat-1',
          'student-1',
          'game-escritura',
          1,
          1,
          100,
          100,
          1,
          true,
          1,
          new Date(),
          new Date(),
          10,
          10
        )
      ];

      stats.forEach(stat => mockStatisticsRepository.addStatistics(stat));

      const request: GetGameStatisticsRequest = {
        gameId: 'game-escritura'
      };

      const result = await getGameStatisticsUseCase.execute(request);

      expect(result.totalStudents).toBe(1);
      expect(result.averagePoints).toBe(100);
      expect(result.averageAccuracy).toBe(100);
      expect(result.completionRate).toBe(100);
      expect(result.studentProgress).toHaveLength(1);
    });

    it('should handle mixed completion status correctly', async () => {
      const stats = [
        new StudentStatistics(
          'stat-1',
          'student-1',
          'game-escritura',
          1,
          1,
          50,
          50,
          1,
          true, // completado
          1,
          new Date(),
          new Date()
        ),
        new StudentStatistics(
          'stat-2',
          'student-1',
          'game-escritura',
          1,
          2,
          60,
          110,
          1,
          false, // no completado
          1,
          new Date(),
          new Date()
        ),
        new StudentStatistics(
          'stat-3',
          'student-2',
          'game-escritura',
          1,
          1,
          70,
          70,
          1,
          true, // completado
          1,
          new Date(),
          new Date()
        )
      ];

      stats.forEach(stat => mockStatisticsRepository.addStatistics(stat));

      const request: GetGameStatisticsRequest = {
        gameId: 'game-escritura'
      };

      const result = await getGameStatisticsUseCase.execute(request);

      expect(result.completionRate).toBeCloseTo(66.67, 1); // 2 de 3 completadas
    });
  });
});
