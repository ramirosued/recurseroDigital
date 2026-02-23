import { Game } from '../../../src/core/models/Game';

describe('Game Model', () => {
    describe('Constructor', () => {
        it('should create a game with all properties', () => {
            const game = new Game(
                'game-1',
                'Ordenamiento',
                'Ordena números',
                '/images/ordenamiento.png',
                '/ordenamiento',
                1,
                true,
                new Date('2024-01-01'),
                new Date('2024-01-02')
            );

            expect(game.id).toBe('game-1');
            expect(game.name).toBe('Ordenamiento');
            expect(game.description).toBe('Ordena números');
            expect(game.imageUrl).toBe('/images/ordenamiento.png');
            expect(game.route).toBe('/ordenamiento');
            expect(game.difficultyLevel).toBe(1);
            expect(game.isActive).toBe(true);
            expect(game.createdAt).toBeInstanceOf(Date);
            expect(game.updatedAt).toBeInstanceOf(Date);
        });

        it('should use default values for optional parameters', () => {
            const game = new Game(
                'game-1',
                'Test Game',
                'Description',
                '/image.png',
                '/route'
            );

            expect(game.difficultyLevel).toBe(1);
            expect(game.isActive).toBe(true);
            expect(game.createdAt).toBeInstanceOf(Date);
            expect(game.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe('Getters', () => {
        let game: Game;

        beforeEach(() => {
            game = new Game(
                'game-1',
                'Test Game',
                'Test Description',
                '/test-image.png',
                '/test-route',
                2,
                false
            );
        });

        it('should return name using getName', () => {
            expect(game.getName()).toBe('Test Game');
        });

        it('should return description using getDescription', () => {
            expect(game.getDescription()).toBe('Test Description');
        });

        it('should return imageUrl using getImageUrl', () => {
            expect(game.getImageUrl()).toBe('/test-image.png');
        });

        it('should return route using getRoute', () => {
            expect(game.getRoute()).toBe('/test-route');
        });

        it('should return difficultyLevel using getDifficultyLevel', () => {
            expect(game.getDifficultyLevel()).toBe(2);
        });

        it('should return isActive using getIsActive', () => {
            expect(game.getIsActive()).toBe(false);
        });
    });
});


