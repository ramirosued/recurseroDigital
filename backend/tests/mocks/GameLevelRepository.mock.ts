import { GameLevelRepository } from '../../src/core/infrastructure/GameLevelRepository';
import { GameLevel, GameLevelConfig } from '../../src/core/models/GameLevel';

export class MockGameLevelRepository implements GameLevelRepository {
    private gameLevels: GameLevel[] = [];

    async findByGameId(gameId: string): Promise<GameLevel[]> {
        return this.gameLevels.filter(gl => gl.getGameId() === gameId);
    }

    async findByGameIdAndLevel(gameId: string, level: number): Promise<GameLevel | null> {
        const gameLevel = this.gameLevels.find(
            gl => gl.getGameId() === gameId && gl.getLevel() === level
        );
        return gameLevel || null;
    }

    async findById(id: string): Promise<GameLevel | null> {
        const gameLevel = this.gameLevels.find(gl => gl.getId() === id);
        return gameLevel || null;
    }

    async findActiveByGameId(gameId: string): Promise<GameLevel[]> {
        return this.gameLevels.filter(
            gl => gl.getGameId() === gameId && gl.getIsActive()
        );
    }

    async save(gameLevel: GameLevel): Promise<GameLevel> {
        this.gameLevels.push(gameLevel);
        return gameLevel;
    }

    async update(id: string, gameLevel: Partial<GameLevel>): Promise<GameLevel | null> {
        const index = this.gameLevels.findIndex(gl => gl.getId() === id);
        if (index !== -1) {
            const existing = this.gameLevels[index];
            const config: GameLevelConfig = gameLevel.config || existing.getConfig();
            const updated = new GameLevel(
                existing.getId(),
                existing.getGameId(),
                gameLevel.level || existing.getLevel(),
                gameLevel.name || existing.getName(),
                gameLevel.description || existing.getDescription(),
                gameLevel.difficulty || existing.getDifficulty(),
                gameLevel.activitiesCount || existing.getActivitiesCount(),
                config,
                gameLevel.isActive !== undefined ? gameLevel.isActive : existing.getIsActive()
            );
            this.gameLevels[index] = updated;
            return updated;
        }
        return null;
    }

    async delete(id: string): Promise<boolean> {
        const index = this.gameLevels.findIndex(gl => gl.getId() === id);
        if (index !== -1) {
            this.gameLevels.splice(index, 1);
            return true;
        }
        return false;
    }

    async findAll(): Promise<GameLevel[]> {
        return [...this.gameLevels];
    }

    async getTotalActivitiesCount(gameId: string): Promise<number> {
        const levels = this.gameLevels.filter(gl => gl.getGameId() === gameId);
        return levels.reduce((total, level) => total + level.getActivitiesCount(), 0);
    }

    clearGameLevels(): void {
        this.gameLevels = [];
    }

    addGameLevel(gameLevel: GameLevel): void {
        this.gameLevels.push(gameLevel);
    }
}


