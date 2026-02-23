import { Game } from './Game';

export class CourseGame {
    id: string;
    courseId: string;
    gameId: string;
    isEnabled: boolean;
    orderIndex: number;
    game?: Game; 
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: string,
        courseId: string,
        gameId: string,
        isEnabled: boolean = true,
        orderIndex: number = 0,
        game?: Game,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date()
    ) {
        this.id = id;
        this.courseId = courseId;
        this.gameId = gameId;
        this.isEnabled = isEnabled;
        this.orderIndex = orderIndex;
        this.game = game;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    getCourseId(): string {
        return this.courseId;
    }

    getGameId(): string {
        return this.gameId;
    }

    getIsEnabled(): boolean {
        return this.isEnabled;
    }

    getOrderIndex(): number {
        return this.orderIndex;
    }

    getGame(): Game | undefined {
        return this.game;
    }

    setGame(game: Game): void {
        this.game = game;
    }
}
