import { GenerateStudentReportUseCase } from '../../../src/core/usecases/GenerateStudentReportUseCase';
import { MockStudentRepository } from '../../mocks/StudentRepository.mock';
import { MockStudentStatisticsRepository } from '../../mocks/StudentStatisticsRepository.mock';
import { StudentEntity } from '../../../src/infrastructure/entities/StudentEntity';
import { StudentStatistics } from '../../../src/core/models/StudentStatistics';
import { StudentNotFoundError } from '../../../src/core/models/exceptions/StudentNotFoundError';
import { GameLevelRepository } from '../../../src/core/infrastructure/GameLevelRepository';
import { GameLevel } from '../../../src/core/models/GameLevel';

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

describe('GenerateStudentReportUseCase', () => {
    const studentEntity = new StudentEntity(
        'student-1',
        'user-1',
        'student@test.com',
        'hash',
        'Juan',
        'Pérez',
        '12345678'
    );

    let studentRepository: MockStudentRepository;
    let statisticsRepository: MockStudentStatisticsRepository;
    let gameLevelRepository: MockGameLevelRepository;
    let aiTextGenerator: { generateText: jest.Mock };
    let useCase: GenerateStudentReportUseCase;

    beforeEach(() => {
        studentRepository = new MockStudentRepository([studentEntity]);
        statisticsRepository = new MockStudentStatisticsRepository();
        gameLevelRepository = new MockGameLevelRepository();
        aiTextGenerator = {
            generateText: jest.fn().mockResolvedValue({
                text: 'Reporte IA',
                provider: 'mock',
                model: 'gemini-test'
            })
        };

        useCase = new GenerateStudentReportUseCase(
            studentRepository,
            statisticsRepository,
            aiTextGenerator,
            gameLevelRepository
        );
    });

    it('should return fallback report when student has no statistics', async () => {
        const result = await useCase.execute({ studentId: 'student-1' });

        expect(result.report).toContain('No se encontraron estadísticas registradas');
        expect(result.studentName).toBe('Juan');
        expect(result.studentLastname).toBe('Pérez');
        expect(aiTextGenerator.generateText).not.toHaveBeenCalled();
    });

    it('should generate report with AI when statistics exist', async () => {
        const baseDate = new Date('2025-11-10T10:00:00Z');
        statisticsRepository.addStatistics(new StudentStatistics(
            'stat-1',
            'student-1',
            'game-1',
            1,
            1,
            80,
            80,
            1,
            true,
            2,
            baseDate,
            baseDate,
            8,
            10,
            60
        ));

        const result = await useCase.execute({ studentId: 'student-1', recentDays: 5 });

        expect(result.report).toBe('Reporte IA');
        expect(result.studentName).toBe('Juan');
        expect(result.studentLastname).toBe('Pérez');
        expect(aiTextGenerator.generateText).toHaveBeenCalledTimes(1);
        expect(aiTextGenerator.generateText).toHaveBeenCalledWith(expect.stringContaining('ESTADÍSTICAS POR JUEGO'));
    });

    it('should throw StudentNotFoundError when student does not exist', async () => {
        await expect(useCase.execute({ studentId: 'unknown' }))
            .rejects
            .toBeInstanceOf(StudentNotFoundError);
    });
});

