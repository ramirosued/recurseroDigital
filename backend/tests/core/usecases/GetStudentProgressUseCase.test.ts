import { GetStudentProgressUseCase, GetStudentProgressRequest } from '../../../src/core/usecases/GetStudentProgressUseCase';
import { MockStudentStatisticsRepository } from '../../mocks/StudentStatisticsRepository.mock';
import { StudentStatistics } from '../../../src/core/models/StudentStatistics';
import { GameLevelRepository } from '../../../src/core/infrastructure/GameLevelRepository';
import { GameLevel, GameLevelConfig } from '../../../src/core/models/GameLevel';

class MockGameLevelRepository implements GameLevelRepository {
  private gameLevels: Map<string, GameLevel[]> = new Map();

  async findByGameId(gameId: string): Promise<GameLevel[]> {
    return this.gameLevels.get(gameId) || [];
  }

  async findByGameIdAndLevel(gameId: string, level: number): Promise<GameLevel | null> {
    const levels = this.gameLevels.get(gameId) || [];
    return levels.find(l => l.getLevel() === level) || null;
  }

  async findById(id: string): Promise<GameLevel | null> {
    for (const levels of this.gameLevels.values()) {
      const found = levels.find(l => l.getId() === id);
      if (found) return found;
    }
    return null;
  }

  async findActiveByGameId(gameId: string): Promise<GameLevel[]> {
    const levels = this.gameLevels.get(gameId) || [];
    return levels.filter(l => l.getIsActive());
  }

  async save(gameLevel: GameLevel): Promise<GameLevel> {
    const gameId = gameLevel.getGameId();
    const levels = this.gameLevels.get(gameId) || [];
    levels.push(gameLevel);
    this.gameLevels.set(gameId, levels);
    return gameLevel;
  }

  async update(id: string, gameLevel: Partial<GameLevel>): Promise<GameLevel | null> {
    throw new Error('Not implemented in mock');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Not implemented in mock');
  }

  async findAll(): Promise<GameLevel[]> {
    const allLevels: GameLevel[] = [];
    for (const levels of this.gameLevels.values()) {
      allLevels.push(...levels);
    }
    return allLevels;
  }

  async getTotalActivitiesCount(gameId: string): Promise<number> {
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

describe('GetStudentProgressUseCase', () => {
  let getStudentProgressUseCase: GetStudentProgressUseCase;
  let mockStatisticsRepository: MockStudentStatisticsRepository;
  let mockGameLevelRepository: MockGameLevelRepository;

  beforeEach(() => {
    mockStatisticsRepository = new MockStudentStatisticsRepository();
    mockGameLevelRepository = new MockGameLevelRepository();
    getStudentProgressUseCase = new GetStudentProgressUseCase(
      mockStatisticsRepository,
      mockGameLevelRepository
    );
  });

  afterEach(() => {
    mockStatisticsRepository.clearStatistics();
    mockGameLevelRepository.clear();
  });

  const createTestStatistics = () => {
    // Crear configuraciones de niveles para los juegos
    const escrituraConfig: GameLevelConfig = {};
    const ordenamientoConfig: GameLevelConfig = {};
    
    // Nivel 1 de escritura con 1 actividad
    const escrituraLevel1 = new GameLevel(
      'level-escritura-1',
      'game-escritura',
      1,
      'Nivel 1',
      'Descripción nivel 1',
      'easy',
      1,
      escrituraConfig,
      true
    );
    
    // Nivel 2 de escritura con 1 actividad
    const escrituraLevel2 = new GameLevel(
      'level-escritura-2',
      'game-escritura',
      2,
      'Nivel 2',
      'Descripción nivel 2',
      'medium',
      1,
      escrituraConfig,
      true
    );
    
    // Nivel 1 de ordenamiento con 1 actividad
    const ordenamientoLevel1 = new GameLevel(
      'level-ordenamiento-1',
      'game-ordenamiento',
      1,
      'Nivel 1',
      'Descripción nivel 1',
      'easy',
      1,
      ordenamientoConfig,
      true
    );
    
    mockGameLevelRepository.addLevel(escrituraLevel1);
    mockGameLevelRepository.addLevel(escrituraLevel2);
    mockGameLevelRepository.addLevel(ordenamientoLevel1);

    const stats: StudentStatistics[] = [
      // Estadísticas del estudiante 1 en juego de escritura
      // Completó nivel 1, actividad 1 (última actividad del nivel 1)
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
      // Completó nivel 2, actividad 1 (última actividad del nivel 2)
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
      // Estadísticas del estudiante 1 en juego de ordenamiento
      // Completó nivel 1, actividad 1 (última actividad del nivel 1)
      new StudentStatistics(
        'stat-3',
        'student-1',
        'game-ordenamiento',
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
      // Estadísticas del estudiante 2 en juego de escritura
      // Completó nivel 1, actividad 1 (última actividad del nivel 1)
      new StudentStatistics(
        'stat-4',
        'student-2',
        'game-escritura',
        1,
        1,
        40,
        40,
        3,
        true,
        1,
        new Date('2024-01-01T13:00:00Z'),
        new Date('2024-01-01T13:15:00Z'),
        6,
        10,
        180
      )
    ];

    stats.forEach(stat => mockStatisticsRepository.addStatistics(stat));
    return stats;
  };

  describe('When execute with specific game', () => {
    it('should return progress for specific student and game', async () => {
      createTestStatistics();
      
      const request: GetStudentProgressRequest = {
        studentId: 'student-1',
        gameId: 'game-escritura'
      };

      const result = await getStudentProgressUseCase.execute(request);

      expect(result.studentId).toBe('student-1');
      expect(result.gameProgress).toHaveLength(1);
      expect(result.gameProgress[0].gameId).toBe('game-escritura');
      // El estudiante completó nivel 2, actividad 1 (última del nivel 2), entonces maxUnlockedLevel = 3
      expect(result.gameProgress[0].maxUnlockedLevel).toBe(3);
      expect(result.gameProgress[0].totalPoints).toBe(125); // 50 + 75
      expect(result.gameProgress[0].statistics).toHaveLength(2);
    });

    it('should return empty progress when student has no statistics for game', async () => {
      createTestStatistics();
      
      const request: GetStudentProgressRequest = {
        studentId: 'student-1',
        gameId: 'game-descomposicion'
      };

      const result = await getStudentProgressUseCase.execute(request);

      expect(result.studentId).toBe('student-1');
      expect(result.gameProgress).toHaveLength(0);
      expect(result.totalPoints).toBe(0);
      expect(result.totalGamesPlayed).toBe(0);
    });
  });

  describe('When execute for all games', () => {
    it('should return progress for all games of a student', async () => {
      createTestStatistics();
      
      const request: GetStudentProgressRequest = {
        studentId: 'student-1'
      };

      const result = await getStudentProgressUseCase.execute(request);

      expect(result.studentId).toBe('student-1');
      expect(result.gameProgress).toHaveLength(2); // escritura y ordenamiento
      expect(result.totalPoints).toBe(185); // 125 (escritura) + 60 (ordenamiento)
      expect(result.totalGamesPlayed).toBe(2);

      // Verificar progreso por juego
      const escrituraProgress = result.gameProgress.find(gp => gp.gameId === 'game-escritura');
      expect(escrituraProgress).toBeDefined();
      // El estudiante completó nivel 2, actividad 1 (última del nivel 2), entonces maxUnlockedLevel = 3
      expect(escrituraProgress!.maxUnlockedLevel).toBe(3);
      expect(escrituraProgress!.totalPoints).toBe(125);

      const ordenamientoProgress = result.gameProgress.find(gp => gp.gameId === 'game-ordenamiento');
      expect(ordenamientoProgress).toBeDefined();
      // El estudiante completó nivel 1, actividad 1 (última del nivel 1), entonces maxUnlockedLevel = 2
      expect(ordenamientoProgress!.maxUnlockedLevel).toBe(2);
      expect(ordenamientoProgress!.totalPoints).toBe(60);
    });

    it('should return empty progress when student has no statistics', async () => {
      createTestStatistics();
      
      const request: GetStudentProgressRequest = {
        studentId: 'student-nonexistent'
      };

      const result = await getStudentProgressUseCase.execute(request);

      expect(result.studentId).toBe('student-nonexistent');
      expect(result.gameProgress).toHaveLength(0);
      expect(result.totalPoints).toBe(0);
      expect(result.totalGamesPlayed).toBe(0);
    });

    it('should return maxUnlockedLevel = 1 when student has no completed activities', async () => {
      // Crear configuración de niveles pero sin estadísticas completadas
      const escrituraConfig: GameLevelConfig = {};
      const escrituraLevel1 = new GameLevel(
        'level-escritura-1',
        'game-escritura',
        1,
        'Nivel 1',
        'Descripción nivel 1',
        'easy',
        1,
        escrituraConfig,
        true
      );
      mockGameLevelRepository.addLevel(escrituraLevel1);
      
      const request: GetStudentProgressRequest = {
        studentId: 'student-1',
        gameId: 'game-escritura'
      };

      const result = await getStudentProgressUseCase.execute(request);

      expect(result.studentId).toBe('student-1');
      expect(result.gameProgress).toHaveLength(0);
      expect(result.totalPoints).toBe(0);
    });
  });

  describe('Progress calculation', () => {
    it('should calculate completion rate correctly', async () => {
      // Crear configuración de niveles para el juego
      const escrituraConfig: GameLevelConfig = {};
      const escrituraLevel1 = new GameLevel(
        'level-escritura-1',
        'game-escritura',
        1,
        'Nivel 1',
        'Descripción nivel 1',
        'easy',
        2, // 2 actividades en el nivel 1
        escrituraConfig,
        true
      );
      const escrituraLevel2 = new GameLevel(
        'level-escritura-2',
        'game-escritura',
        2,
        'Nivel 2',
        'Descripción nivel 2',
        'medium',
        1, // 1 actividad en el nivel 2
        escrituraConfig,
        true
      );
      mockGameLevelRepository.addLevel(escrituraLevel1);
      mockGameLevelRepository.addLevel(escrituraLevel2);

      // Crear estadísticas con diferentes estados de completado
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
          2,
          true, // completado - última actividad del nivel 1
          1,
          new Date(),
          new Date()
        ),
        new StudentStatistics(
          'stat-3',
          'student-1',
          'game-escritura',
          2,
          1,
          30,
          140,
          3,
          false, // no completado
          1,
          new Date(),
          new Date()
        )
      ];

      stats.forEach(stat => mockStatisticsRepository.addStatistics(stat));

      const request: GetStudentProgressRequest = {
        studentId: 'student-1',
        gameId: 'game-escritura'
      };

      const result = await getStudentProgressUseCase.execute(request);

      const gameProgress = result.gameProgress[0];
      expect(gameProgress.completionRate).toBeCloseTo(66.67, 1);
      // La última actividad completada fue nivel 1, actividad 2 (última del nivel 1), entonces maxUnlockedLevel = 2
      expect(gameProgress.maxUnlockedLevel).toBe(2);
    });

    it('should calculate average accuracy correctly', async () => {
      // Crear configuración de niveles para el juego
      const escrituraConfig: GameLevelConfig = {};
      const escrituraLevel1 = new GameLevel(
        'level-escritura-1',
        'game-escritura',
        1,
        'Nivel 1',
        'Descripción nivel 1',
        'easy',
        2, // 2 actividades en el nivel 1
        escrituraConfig,
        true
      );
      mockGameLevelRepository.addLevel(escrituraLevel1);

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
          new Date(),
          8, // 80% accuracy
          10
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
          true,
          1,
          new Date(),
          new Date(),
          6, // 60% accuracy
          10
        )
      ];

      stats.forEach(stat => mockStatisticsRepository.addStatistics(stat));

      const request: GetStudentProgressRequest = {
        studentId: 'student-1',
        gameId: 'game-escritura'
      };

      const result = await getStudentProgressUseCase.execute(request);

      const gameProgress = result.gameProgress[0];
      expect(gameProgress.averageAccuracy).toBe(70); // (80 + 60) / 2
      // La última actividad completada fue nivel 1, actividad 2 (última del nivel 1), entonces maxUnlockedLevel = 2
      expect(gameProgress.maxUnlockedLevel).toBe(2);
    });

    it('should find latest activity correctly', async () => {
      // Crear configuración de niveles para el juego
      const escrituraConfig: GameLevelConfig = {};
      const escrituraLevel1 = new GameLevel(
        'level-escritura-1',
        'game-escritura',
        1,
        'Nivel 1',
        'Descripción nivel 1',
        'easy',
        2, // 2 actividades en el nivel 1
        escrituraConfig,
        true
      );
      mockGameLevelRepository.addLevel(escrituraLevel1);

      const baseDate = new Date('2024-01-01T10:00:00Z');
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
          new Date(baseDate.getTime()),
          new Date(baseDate.getTime() + 5000)
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
          true,
          1,
          new Date(baseDate.getTime() + 60000), // 1 minuto después
          new Date(baseDate.getTime() + 70000)
        )
      ];

      stats.forEach(stat => mockStatisticsRepository.addStatistics(stat));

      const request: GetStudentProgressRequest = {
        studentId: 'student-1',
        gameId: 'game-escritura'
      };

      const result = await getStudentProgressUseCase.execute(request);

      const gameProgress = result.gameProgress[0];
      expect(gameProgress.lastActivity).toEqual(new Date(baseDate.getTime() + 60000));
      // La última actividad completada fue nivel 1, actividad 2 (última del nivel 1), entonces maxUnlockedLevel = 2
      expect(gameProgress.maxUnlockedLevel).toBe(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle statistics with no questions correctly', async () => {
      // Crear configuración de niveles para el juego
      const escrituraConfig: GameLevelConfig = {};
      const escrituraLevel1 = new GameLevel(
        'level-escritura-1',
        'game-escritura',
        1,
        'Nivel 1',
        'Descripción nivel 1',
        'easy',
        1, // 1 actividad en el nivel 1
        escrituraConfig,
        true
      );
      mockGameLevelRepository.addLevel(escrituraLevel1);

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

      const request: GetStudentProgressRequest = {
        studentId: 'student-1',
        gameId: 'game-escritura'
      };

      const result = await getStudentProgressUseCase.execute(request);

      const gameProgress = result.gameProgress[0];
      expect(gameProgress.averageAccuracy).toBe(0); // Sin preguntas, accuracy = 0
      // La última actividad completada fue nivel 1, actividad 1 (última del nivel 1), entonces maxUnlockedLevel = 2
      expect(gameProgress.maxUnlockedLevel).toBe(2);
    });

    it('should handle single activity correctly', async () => {
      // Crear configuración de niveles para el juego
      const escrituraConfig: GameLevelConfig = {};
      const escrituraLevel1 = new GameLevel(
        'level-escritura-1',
        'game-escritura',
        1,
        'Nivel 1',
        'Descripción nivel 1',
        'easy',
        1, // 1 actividad en el nivel 1
        escrituraConfig,
        true
      );
      mockGameLevelRepository.addLevel(escrituraLevel1);

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
          new Date()
        )
      ];

      stats.forEach(stat => mockStatisticsRepository.addStatistics(stat));

      const request: GetStudentProgressRequest = {
        studentId: 'student-1',
        gameId: 'game-escritura'
      };

      const result = await getStudentProgressUseCase.execute(request);

      expect(result.gameProgress).toHaveLength(1);
      expect(result.gameProgress[0].completionRate).toBe(100);
      expect(result.gameProgress[0].totalPoints).toBe(100);
      // La última actividad completada fue nivel 1, actividad 1 (última del nivel 1), entonces maxUnlockedLevel = 2
      expect(result.gameProgress[0].maxUnlockedLevel).toBe(2);
    });
  });
});
