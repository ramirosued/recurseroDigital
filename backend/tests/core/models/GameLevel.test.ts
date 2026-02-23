import { GameLevel, GameLevelConfig } from '../../../src/core/models/GameLevel';

describe('GameLevel Model', () => {
    describe('Constructor and Basic Getters', () => {
        it('should create a valid GameLevel with all properties', () => {
            const config: GameLevelConfig = {
                min: 100,
                max: 999,
                color: 'blue',
                numbersCount: 6
            };

            const level = new GameLevel(
                'level-1',
                'game-ordenamiento',
                1,
                'Nivel 1',
                'Números de 3 dígitos',
                'Fácil',
                5,
                config
            );

            expect(level.getId()).toBe('level-1');
            expect(level.getGameId()).toBe('game-ordenamiento');
            expect(level.getLevel()).toBe(1);
            expect(level.getName()).toBe('Nivel 1');
            expect(level.getDescription()).toBe('Números de 3 dígitos');
            expect(level.getDifficulty()).toBe('Fácil');
            expect(level.getActivitiesCount()).toBe(5);
            expect(level.getIsActive()).toBe(true);
        });

        it('should handle optional parameters with defaults', () => {
            const config: GameLevelConfig = {};
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Test Level',
                'Test Description',
                'Fácil',
                5,
                config
            );

            expect(level.getIsActive()).toBe(true);
            expect(level.createdAt).toBeInstanceOf(Date);
            expect(level.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe('Configuration Methods', () => {
        let gameLevel: GameLevel;

        beforeEach(() => {
            const config: GameLevelConfig = {
                min: 100,
                max: 999,
                color: 'blue',
                operation: 10,
                numbersCount: 6
            };

            gameLevel = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Test Level',
                'Test Description',
                'Fácil',
                5,
                config
            );
        });

        it('should return complete config object', () => {
            const config = gameLevel.getConfig();
            expect(config).toEqual({
                min: 100,
                max: 999,
                color: 'blue',
                operation: 10,
                numbersCount: 6
            });
        });

        it('should get specific config value', () => {
            expect(gameLevel.getConfigValue<number>('min')).toBe(100);
            expect(gameLevel.getConfigValue<string>('color')).toBe('blue');
            expect(gameLevel.getConfigValue<number>('operation')).toBe(10);
        });

        it('should return default value for non-existent config key', () => {
            expect(gameLevel.getConfigValue('nonExistent', 'default')).toBe('default');
            expect(gameLevel.getConfigValue<number>('missing', 42)).toBe(42);
        });

        it('should check if config key exists', () => {
            expect(gameLevel.hasConfigKey('min')).toBe(true);
            expect(gameLevel.hasConfigKey('max')).toBe(true);
            expect(gameLevel.hasConfigKey('nonExistent')).toBe(false);
        });

        it('should get numeric range if both min and max exist', () => {
            const range = gameLevel.getNumericRange();
            expect(range).toEqual({ min: 100, max: 999 });
        });

        it('should return null for numeric range if min or max missing', () => {
            const configNoRange: GameLevelConfig = { color: 'blue' };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Test',
                'Desc',
                'Fácil',
                5,
                configNoRange
            );

            expect(level.getNumericRange()).toBeNull();
        });
    });

    describe('Validation', () => {
        it('should validate a correct configuration', () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Test Level',
                'Description',
                'Fácil',
                5,
                config
            );

            expect(level.isValidConfiguration()).toBe(true);
        });

        it('should invalidate with zero level', () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                0,
                'Test Level',
                'Description',
                'Fácil',
                5,
                config
            );

            expect(level.isValidConfiguration()).toBe(false);
        });

        it('should invalidate with zero activities count', () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Test Level',
                'Description',
                'Fácil',
                0,
                config
            );

            expect(level.isValidConfiguration()).toBe(false);
        });
    });

    describe('Configuration for Different Game Types', () => {
        it('should handle Ordenamiento configuration', () => {
            const config: GameLevelConfig = {
                min: 1000,
                max: 9999,
                color: 'green',
                numbersCount: 6
            };

            const level = new GameLevel(
                'level-ordenamiento-2',
                'game-ordenamiento',
                2,
                'Nivel 2',
                'Números de 4 dígitos',
                'Intermedio',
                5,
                config
            );

            expect(level.getConfigValue('numbersCount')).toBe(6);
            expect(level.getNumericRange()).toEqual({ min: 1000, max: 9999 });
        });

        it('should handle Escala configuration with operation', () => {
            const config: GameLevelConfig = {
                min: 30,
                max: 490,
                operation: 10,
                color: 'green',
                range: '20 al 500'
            };

            const level = new GameLevel(
                'level-escala-2',
                'game-escala',
                2,
                'Saltos de 10',
                'Encuentra el anterior y posterior (+10 y -10)',
                'Intermedio',
                5,
                config
            );

            expect(level.getConfigValue<number>('operation')).toBe(10);
            expect(level.getConfigValue<string>('range')).toBe('20 al 500');
        });

        it('should handle Calculos configuration with string operation', () => {
            const config: GameLevelConfig = {
                operation: 'suma',
                color: 'from-green-400 to-emerald-500',
                icon: '➕'
            };

            const level = new GameLevel(
                'level-calculos-suma-1',
                'game-calculos',
                1,
                'Nivel 1 - Sumas',
                'Operaciones simples',
                'Fácil',
                5,
                config
            );

            expect(level.getConfigValue<string>('operation')).toBe('suma');
            expect(level.getConfigValue<string>('icon')).toBe('➕');
        });

        it('should handle empty configuration', () => {
            const config: GameLevelConfig = {};
            const level = new GameLevel(
                'level-test',
                'game-test',
                1,
                'Test',
                'Description',
                'Fácil',
                5,
                config
            );

            expect(level.getConfig()).toEqual({});
            expect(level.getNumericRange()).toBeNull();
            expect(level.hasConfigKey('min')).toBe(false);
        });
    });

    describe('Extensibility', () => {
        it('should allow custom configuration keys', () => {
            const config: GameLevelConfig = {
                min: 1,
                max: 50,
                customField: 'custom value',
                anotherField: 123,
                nestedObject: {
                    nested: 'value'
                }
            };

            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Test',
                'Desc',
                'Fácil',
                5,
                config
            );

            expect(level.getConfigValue('customField')).toBe('custom value');
            expect(level.getConfigValue<number>('anotherField')).toBe(123);
            expect(level.getConfigValue('nestedObject')).toEqual({ nested: 'value' });
        });
    });
});

