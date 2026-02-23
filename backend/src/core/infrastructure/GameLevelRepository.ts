import { GameLevel } from '../models/GameLevel';

export interface GameLevelRepository {
    findByGameId(gameId: string): Promise<GameLevel[]>;
    findByGameIdAndLevel(gameId: string, level: number): Promise<GameLevel | null>;
    findById(id: string): Promise<GameLevel | null>;
    findActiveByGameId(gameId: string): Promise<GameLevel[]>;
    save(gameLevel: GameLevel): Promise<GameLevel>;
    update(id: string, gameLevel: Partial<GameLevel>): Promise<GameLevel | null>;
    delete(id: string): Promise<boolean>;
    findAll(): Promise<GameLevel[]>;
    getTotalActivitiesCount(gameId: string): Promise<number>;
}

