import { UpdateGameLevelUseCase } from '../../../src/core/usecases/UpdateGameLevelUseCase';
import { GameLevel, GameLevelConfig } from '../../../src/core/models/GameLevel';
import { GameLevelRepository } from '../../../src/core/infrastructure/GameLevelRepository';

class MockGameLevelRepository implements GameLevelRepository {
    private gameLevels: Map<string, GameLevel> = new Map();

    async findByGameId(gameId: string): Promise<GameLevel[]> {
        return Array.from(this.gameLevels.values()).filter(l => l.getGameId() === gameId);
    }

    async findByGameIdAndLevel(gameId: string, level: number): Promise<GameLevel | null> {
        const levels = await this.findByGameId(gameId);
        return levels.find(l => l.getLevel() === level) || null;
    }

    async findById(id: string): Promise<GameLevel | null> {
        return this.gameLevels.get(id) || null;
    }

    async findActiveByGameId(gameId: string): Promise<GameLevel[]> {
        const levels = await this.findByGameId(gameId);
        return levels.filter(l => l.getIsActive());
    }

    async save(gameLevel: GameLevel): Promise<GameLevel> {
        this.gameLevels.set(gameLevel.getId(), gameLevel);
        return gameLevel;
    }

    async update(id: string, gameLevelData: Partial<GameLevel>): Promise<GameLevel | null> {
        const existing = this.gameLevels.get(id);
        if (!existing) return null;

        const updated = new GameLevel(
            existing.id,
            existing.gameId,
            existing.level,
            gameLevelData.name ?? existing.name,
            gameLevelData.description ?? existing.description,
            gameLevelData.difficulty ?? existing.difficulty,
            gameLevelData.activitiesCount ?? existing.activitiesCount,
            gameLevelData.config ?? existing.config,
            gameLevelData.isActive ?? existing.isActive,
            existing.createdAt,
            new Date()
        );

        this.gameLevels.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        return this.gameLevels.delete(id);
    }

    async findAll(): Promise<GameLevel[]> {
        return Array.from(this.gameLevels.values());
    }

    addLevel(level: GameLevel): void {
        this.gameLevels.set(level.getId(), level);
    }

    clear(): void {
        this.gameLevels.clear();
    }

    async getTotalActivitiesCount(gameId: string): Promise<number> {
        const levels = await this.findByGameId(gameId);
        return levels.reduce((total, level) => total + level.getActivitiesCount(), 0);
    }
}

describe('UpdateGameLevelUseCase', () => {
    let repository: MockGameLevelRepository;
    let useCase: UpdateGameLevelUseCase;

    beforeEach(() => {
        repository = new MockGameLevelRepository();
        useCase = new UpdateGameLevelUseCase(repository);
    });

    afterEach(() => {
        repository.clear();
    });

    describe('execute - Happy Path', () => {
        it('should update level name successfully', async () => {
            const config: GameLevelConfig = { min: 100, max: 999 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Nivel 1',
                'Descripción original',
                'Fácil',
                5,
                config
            );
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                name: 'Nivel 1 Actualizado'
            });

            expect(result.level.name).toBe('Nivel 1 Actualizado');
            expect(result.level.description).toBe('Descripción original');
        });

        it('should update multiple fields at once', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Original',
                'Desc original',
                'Fácil',
                5,
                config
            );
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                name: 'Actualizado',
                description: 'Nueva descripción',
                difficulty: 'Intermedio',
                activitiesCount: 10
            });

            expect(result.level.name).toBe('Actualizado');
            expect(result.level.description).toBe('Nueva descripción');
            expect(result.level.difficulty).toBe('Intermedio');
            expect(result.level.activitiesCount).toBe(10);
        });

        it('should update config successfully', async () => {
            const originalConfig: GameLevelConfig = { min: 100, max: 999 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Nivel 1',
                'Desc',
                'Fácil',
                5,
                originalConfig
            );
            repository.addLevel(level);

            const newConfig: GameLevelConfig = { min: 200, max: 1999, color: 'blue' };
            const result = await useCase.execute({
                id: 'level-1',
                config: newConfig
            });

            expect(result.level.config.min).toBe(200);
            expect(result.level.config.max).toBe(1999);
            expect(result.level.config.color).toBe('blue');
        });

        it('should update isActive status', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Nivel 1',
                'Desc',
                'Fácil',
                5,
                config,
                true
            );
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                isActive: false
            });

            expect(result.level.isActive).toBe(false);
        });
    });

    describe('execute - Validation', () => {
        it('should throw error when id is empty', async () => {
            await expect(
                useCase.execute({ id: '' })
            ).rejects.toThrow('id es requerido');
        });

        it('should throw error when id is only whitespace', async () => {
            await expect(
                useCase.execute({ id: '   ' })
            ).rejects.toThrow('id es requerido');
        });

        it('should throw error when level not found', async () => {
            await expect(
                useCase.execute({ id: 'non-existent', name: 'Test' })
            ).rejects.toThrow('Nivel con id non-existent no encontrado');
        });

        it('should throw error when activitiesCount is less than 1', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-test', 1, 'Test', 'Desc', 'Fácil', 5, config);
            repository.addLevel(level);

            await expect(
                useCase.execute({ id: 'level-1', activitiesCount: 0 })
            ).rejects.toThrow('activitiesCount debe ser mayor a 0');

            await expect(
                useCase.execute({ id: 'level-1', activitiesCount: -1 })
            ).rejects.toThrow('activitiesCount debe ser mayor a 0');
        });

        it('should throw error when config is not an object', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-test', 1, 'Test', 'Desc', 'Fácil', 5, config);
            repository.addLevel(level);

            await expect(
                useCase.execute({ id: 'level-1', config: 'invalid' as any })
            ).rejects.toThrow('config debe ser un objeto');
        });
    });

    describe('execute - Partial Updates', () => {
        it('should only update provided fields', async () => {
            const config: GameLevelConfig = { min: 100, max: 999 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Original',
                'Desc original',
                'Fácil',
                5,
                config,
                true
            );
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                name: 'Solo nombre actualizado'
            });

            expect(result.level.name).toBe('Solo nombre actualizado');
            expect(result.level.description).toBe('Desc original');
            expect(result.level.difficulty).toBe('Fácil');
            expect(result.level.activitiesCount).toBe(5);
            expect(result.level.isActive).toBe(true);
        });

        it('should preserve existing config when not provided', async () => {
            const originalConfig: GameLevelConfig = { min: 100, max: 999, color: 'blue' };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Test',
                'Desc',
                'Fácil',
                5,
                originalConfig
            );
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                name: 'Actualizado'
            });

            expect(result.level.config).toEqual(originalConfig);
        });
    });

    describe('execute - Real World Scenarios', () => {
        it('should update Ordenamiento level configuration', async () => {
            const config: GameLevelConfig = { min: 100, max: 999, numbersCount: 6 };
            const level = new GameLevel(
                'level-ordenamiento-1',
                'game-ordenamiento',
                1,
                'Nivel 1',
                'Números de 3 dígitos',
                'Fácil',
                5,
                config
            );
            repository.addLevel(level);

            const newConfig: GameLevelConfig = { min: 200, max: 1999, numbersCount: 8, color: 'green' };
            const result = await useCase.execute({
                id: 'level-ordenamiento-1',
                config: newConfig,
                activitiesCount: 7
            });

            expect(result.level.config.numbersCount).toBe(8);
            expect(result.level.config.min).toBe(200);
            expect(result.level.activitiesCount).toBe(7);
        });

        it('should update Escala level with operation', async () => {
            const config: GameLevelConfig = { min: 5, max: 95, operation: 1 };
            const level = new GameLevel(
                'level-escala-1',
                'game-escala',
                1,
                'Vecinos Cercanos',
                'Desc',
                'Fácil',
                5,
                config
            );
            repository.addLevel(level);

            const newConfig: GameLevelConfig = { min: 10, max: 100, operation: 2, color: 'blue' };
            const result = await useCase.execute({
                id: 'level-escala-1',
                config: newConfig
            });

            expect(result.level.config.operation).toBe(2);
            expect(result.level.config.min).toBe(10);
        });

        it('should deactivate a level', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-test', 1, 'Test', 'Desc', 'Fácil', 5, config, true);
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                isActive: false
            });

            expect(result.level.isActive).toBe(false);
            const updated = await repository.findById('level-1');
            expect(updated?.getIsActive()).toBe(false);
        });
    });
});

