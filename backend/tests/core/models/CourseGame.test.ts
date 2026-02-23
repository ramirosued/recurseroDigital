import { CourseGame } from '../../../src/core/models/CourseGame';
import { Game } from '../../../src/core/models/Game';

describe('CourseGame Model', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game('game-1', 'Test Game', 'Description', '/image.png', '/route');
    });

    describe('Constructor', () => {
        it('should create a CourseGame with all properties', () => {
            const courseGame = new CourseGame(
                'cg-1',
                'course-1',
                'game-1',
                true,
                0,
                game,
                new Date('2024-01-01'),
                new Date('2024-01-02')
            );

            expect(courseGame.id).toBe('cg-1');
            expect(courseGame.courseId).toBe('course-1');
            expect(courseGame.gameId).toBe('game-1');
            expect(courseGame.isEnabled).toBe(true);
            expect(courseGame.orderIndex).toBe(0);
            expect(courseGame.game).toBe(game);
            expect(courseGame.createdAt).toBeInstanceOf(Date);
            expect(courseGame.updatedAt).toBeInstanceOf(Date);
        });

        it('should use default values for optional parameters', () => {
            const courseGame = new CourseGame('cg-1', 'course-1', 'game-1');

            expect(courseGame.isEnabled).toBe(true);
            expect(courseGame.orderIndex).toBe(0);
            expect(courseGame.game).toBeUndefined();
            expect(courseGame.createdAt).toBeInstanceOf(Date);
            expect(courseGame.updatedAt).toBeInstanceOf(Date);
        });

        it('should create CourseGame with custom orderIndex', () => {
            const courseGame = new CourseGame('cg-1', 'course-1', 'game-1', true, 5);
            expect(courseGame.orderIndex).toBe(5);
        });
    });

    describe('Getters', () => {
        let courseGame: CourseGame;

        beforeEach(() => {
            courseGame = new CourseGame('cg-1', 'course-1', 'game-1', false, 3, game);
        });

        it('should return courseId using getCourseId', () => {
            expect(courseGame.getCourseId()).toBe('course-1');
        });

        it('should return gameId using getGameId', () => {
            expect(courseGame.getGameId()).toBe('game-1');
        });

        it('should return isEnabled using getIsEnabled', () => {
            expect(courseGame.getIsEnabled()).toBe(false);
        });

        it('should return orderIndex using getOrderIndex', () => {
            expect(courseGame.getOrderIndex()).toBe(3);
        });

        it('should return game using getGame', () => {
            expect(courseGame.getGame()).toBe(game);
        });

        it('should return undefined when game is not set', () => {
            const courseGameWithoutGame = new CourseGame('cg-2', 'course-1', 'game-1');
            expect(courseGameWithoutGame.getGame()).toBeUndefined();
        });
    });

    describe('setGame', () => {
        it('should set the game', () => {
            const courseGame = new CourseGame('cg-1', 'course-1', 'game-1');
            expect(courseGame.getGame()).toBeUndefined();

            courseGame.setGame(game);
            expect(courseGame.getGame()).toBe(game);
        });

        it('should replace existing game', () => {
            const courseGame = new CourseGame('cg-1', 'course-1', 'game-1', true, 0, game);
            const newGame = new Game('game-2', 'New Game', 'Desc', '/img.png', '/route');

            courseGame.setGame(newGame);
            expect(courseGame.getGame()).toBe(newGame);
        });
    });
});


