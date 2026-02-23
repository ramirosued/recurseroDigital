import { GameLevelRepository } from '../infrastructure/GameLevelRepository';
import { GameLevel } from '../models/GameLevel';

export interface GetGameLevelsRequest {
    gameId: string;
    onlyActive?: boolean;
}

export interface GetGameLevelsResponse {
    gameId: string;
    levels: GameLevelDTO[];
}

export interface GameLevelDTO {
    id: string;
    level: number;
    name: string;
    description: string;
    difficulty: string;
    activitiesCount: number;
    config: {
        min?: number;
        max?: number;
        range?: string;
        operation?: number | string;
        color?: string;
        icon?: string;
        numbersCount?: number;
        [key: string]: any;
    };
}

export class GetGameLevelsUseCase {
    constructor(
        private gameLevelRepository: GameLevelRepository
    ) {}

    async execute(request: GetGameLevelsRequest): Promise<GetGameLevelsResponse> {
        this.validateRequest(request);
        const gameLevels = await this.fetchGameLevels(request);
        const levelsDTO = gameLevels.map(level => this.mapToDTO(level));

        return {
            gameId: request.gameId,
            levels: levelsDTO
        };
    }

    private validateRequest(request: GetGameLevelsRequest): void {
        if (!request.gameId || request.gameId.trim() === '') {
            throw new Error('gameId es requerido');
        }
    }

    private async fetchGameLevels(request: GetGameLevelsRequest): Promise<GameLevel[]> {
        if (request.onlyActive === true) {
            return await this.gameLevelRepository.findActiveByGameId(request.gameId);
        }
        
        return await this.gameLevelRepository.findByGameId(request.gameId);
    }

    private mapToDTO(gameLevel: GameLevel): GameLevelDTO {
        return {
            id: gameLevel.getId(),
            level: gameLevel.getLevel(),
            name: gameLevel.getName(),
            description: gameLevel.getDescription(),
            difficulty: gameLevel.getDifficulty(),
            activitiesCount: gameLevel.getActivitiesCount(),
            config: gameLevel.getConfig()
        };
    }
}

