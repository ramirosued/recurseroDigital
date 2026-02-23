import { GetGameLevelsUseCase } from '../../../src/core/usecases/GetGameLevelsUseCase';
import { GameLevel, GameLevelConfig } from '../../../src/core/models/GameLevel';
import { GameLevelRepository } from '../../../src/core/infrastructure/GameLevelRepository';

/**
 * Mock implementation of GameLevelRepository for testing
 */
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

    // Helper method for tests
    addLevel(gameLevel: GameLevel): void {
        const gameId = gameLevel.getGameId();
        const levels = this.gameLevels.get(gameId) || [];
        levels.push(gameLevel);
        this.gameLevels.set(gameId, levels);
    }

    clear(): void {
        this.gameLevels.clear();
    }

    async getTotalActivitiesCount(gameId: string): Promise<number> {
        const levels = await this.findByGameId(gameId);
        return levels.reduce((total, level) => total + level.getActivitiesCount(), 0);
    }
}

describe('GetGameLevelsUseCase', () => {
    let repository: MockGameLevelRepository;
    let useCase: GetGameLevelsUseCase;

    beforeEach(() => {
        repository = new MockGameLevelRepository();
        useCase = new GetGameLevelsUseCase(repository);
    });

    afterEach(() => {
        repository.clear();
    });

    describe('execute - Happy Path', () => {
        it('should return all levels for a game', async () => {
            // Arrange
            const config1: GameLevelConfig = { min: 100, max: 999, color: 'blue' };
            const config2: GameLevelConfig = { min: 1000, max: 9999, color: 'green' };
            
            const level1 = new GameLevel(
                'level-1',
                'game-ordenamiento',
                1,
                'Nivel 1',
                'Números de 3 dígitos',
                'Fácil',
                5,
                config1
            );

            const level2 = new GameLevel(
                'level-2',
                'game-ordenamiento',
                2,
                'Nivel 2',
                'Números de 4 dígitos',
                'Intermedio',
                5,
                config2
            );

            repository.addLevel(level1);
            repository.addLevel(level2);

            // Act
            const result = await useCase.execute({ gameId: 'game-ordenamiento' });

            // Assert
            expect(result.gameId).toBe('game-ordenamiento');
            expect(result.levels).toHaveLength(2);
            expect(result.levels[0].id).toBe('level-1');
            expect(result.levels[0].level).toBe(1);
            expect(result.levels[0].name).toBe('Nivel 1');
            expect(result.levels[1].id).toBe('level-2');
            expect(result.levels[1].level).toBe(2);
        });

        it('should return only active levels when onlyActive is true', async () => {
            // Arrange
            const config: GameLevelConfig = { min: 1, max: 100 };
            
            const activeLevel = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Active Level',
                'Description',
                'Fácil',
                5,
                config,
                true
            );

            const inactiveLevel = new GameLevel(
                'level-2',
                'game-test',
                2,
                'Inactive Level',
                'Description',
                'Intermedio',
                5,
                config,
                false
            );

            repository.addLevel(activeLevel);
            repository.addLevel(inactiveLevel);

            // Act
            const result = await useCase.execute({ gameId: 'game-test', onlyActive: true });

            // Assert
            expect(result.levels).toHaveLength(1);
            expect(result.levels[0].id).toBe('level-1');
            expect(result.levels[0].name).toBe('Active Level');
        });

        it('should return empty array for game with no levels', async () => {
            // Act
            const result = await useCase.execute({ gameId: 'game-nonexistent' });

            // Assert
            expect(result.gameId).toBe('game-nonexistent');
            expect(result.levels).toHaveLength(0);
        });

        it('should return all levels including inactive when onlyActive is false', async () => {
            // Arrange
            const config: GameLevelConfig = { min: 1, max: 100 };
            
            const activeLevel = new GameLevel('level-1', 'game-test', 1, 'Active', 'Desc', 'Fácil', 5, config, true);
            const inactiveLevel = new GameLevel('level-2', 'game-test', 2, 'Inactive', 'Desc', 'Intermedio', 5, config, false);

            repository.addLevel(activeLevel);
            repository.addLevel(inactiveLevel);

            // Act
            const result = await useCase.execute({ gameId: 'game-test', onlyActive: false });

            // Assert
            expect(result.levels).toHaveLength(2);
        });
    });

    describe('execute - Validation', () => {
        it('should throw error when gameId is empty', async () => {
            await expect(
                useCase.execute({ gameId: '' })
            ).rejects.toThrow('gameId es requerido');
        });

        it('should throw error when gameId is only whitespace', async () => {
            await expect(
                useCase.execute({ gameId: '   ' })
            ).rejects.toThrow('gameId es requerido');
        });
    });

    describe('execute - DTO Mapping', () => {
        it('should correctly map GameLevel to DTO', async () => {
            // Arrange
            const config: GameLevelConfig = {
                min: 100,
                max: 999,
                color: 'blue',
                numbersCount: 6,
                customField: 'custom value'
            };

            const level = new GameLevel(
                'level-ordenamiento-1',
                'game-ordenamiento',
                1,
                'Nivel 1',
                'Números de 3 dígitos',
                'Fácil',
                5,
                config,
                true
            );

            repository.addLevel(level);

            // Act
            const result = await useCase.execute({ gameId: 'game-ordenamiento' });

            // Assert
            const dto = result.levels[0];
            expect(dto).toEqual({
                id: 'level-ordenamiento-1',
                level: 1,
                name: 'Nivel 1',
                description: 'Números de 3 dígitos',
                difficulty: 'Fácil',
                activitiesCount: 5,
                config: {
                    min: 100,
                    max: 999,
                    color: 'blue',
                    numbersCount: 6,
                    customField: 'custom value'
                }
            });
        });

        it('should not include internal model properties in DTO', async () => {
            // Arrange
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-test', 1, 'Test', 'Desc', 'Fácil', 5, config);
            repository.addLevel(level);

            // Act
            const result = await useCase.execute({ gameId: 'game-test' });

            // Assert
            const dto = result.levels[0];
            expect(dto).not.toHaveProperty('isActive');
            expect(dto).not.toHaveProperty('createdAt');
            expect(dto).not.toHaveProperty('updatedAt');
            expect(dto).not.toHaveProperty('gameId'); // gameId está en el nivel superior
        });
    });

    describe('execute - Real World Scenarios', () => {
        it('should handle Ordenamiento game with 3 levels', async () => {
            // Arrange - Setup similar to seed migration
            const levels = [
                new GameLevel('l1', 'game-ordenamiento', 1, 'Nivel 1', '3 dígitos', 'Fácil', 5, 
                    { min: 100, max: 999, color: 'blue', numbersCount: 6 }),
                new GameLevel('l2', 'game-ordenamiento', 2, 'Nivel 2', '4 dígitos', 'Intermedio', 5, 
                    { min: 1000, max: 9999, color: 'green', numbersCount: 6 }),
                new GameLevel('l3', 'game-ordenamiento', 3, 'Nivel 3', '5 dígitos', 'Avanzado', 5, 
                    { min: 10000, max: 99999, color: 'purple', numbersCount: 6 })
            ];

            levels.forEach(l => repository.addLevel(l));

            // Act
            const result = await useCase.execute({ gameId: 'game-ordenamiento' });

            // Assert
            expect(result.levels).toHaveLength(3);
            expect(result.levels[0].difficulty).toBe('Fácil');
            expect(result.levels[1].difficulty).toBe('Intermedio');
            expect(result.levels[2].difficulty).toBe('Avanzado');
        });

        it('should handle Escala game with operation config', async () => {
            // Arrange
            const level = new GameLevel(
                'level-escala-2',
                'game-escala',
                2,
                'Saltos de 10',
                'Encuentra el anterior y posterior (+10 y -10)',
                'Intermedio',
                5,
                { min: 30, max: 490, operation: 10, color: 'green', range: '20 al 500' }
            );

            repository.addLevel(level);

            // Act
            const result = await useCase.execute({ gameId: 'game-escala' });

            // Assert
            expect(result.levels[0].config.operation).toBe(10);
            expect(result.levels[0].config.range).toBe('20 al 500');
        });

        it('should handle Calculos game with string operation', async () => {
            // Arrange
            const level = new GameLevel(
                'level-calculos-suma-1',
                'game-calculos',
                1,
                'Nivel 1 - Sumas',
                'Operaciones simples',
                'Fácil',
                5,
                { operation: 'suma', color: 'from-green-400 to-emerald-500', icon: '➕' }
            );

            repository.addLevel(level);

            // Act
            const result = await useCase.execute({ gameId: 'game-calculos' });

            // Assert
            expect(result.levels[0].config.operation).toBe('suma');
            expect(result.levels[0].config.icon).toBe('➕');
        });

        it('should handle multiple games independently', async () => {
            // Arrange
            const configOrdenamiento: GameLevelConfig = { min: 100, max: 999 };
            const configEscala: GameLevelConfig = { min: 5, max: 95, operation: 1 };

            repository.addLevel(new GameLevel('l1', 'game-ordenamiento', 1, 'Ord 1', 'Desc', 'Fácil', 5, configOrdenamiento));
            repository.addLevel(new GameLevel('l2', 'game-ordenamiento', 2, 'Ord 2', 'Desc', 'Intermedio', 5, configOrdenamiento));
            repository.addLevel(new GameLevel('l3', 'game-escala', 1, 'Escala 1', 'Desc', 'Fácil', 5, configEscala));

            // Act
            const resultOrdenamiento = await useCase.execute({ gameId: 'game-ordenamiento' });
            const resultEscala = await useCase.execute({ gameId: 'game-escala' });

            // Assert
            expect(resultOrdenamiento.levels).toHaveLength(2);
            expect(resultEscala.levels).toHaveLength(1);
            expect(resultOrdenamiento.levels[0].name).toBe('Ord 1');
            expect(resultEscala.levels[0].name).toBe('Escala 1');
        });
    });
});

