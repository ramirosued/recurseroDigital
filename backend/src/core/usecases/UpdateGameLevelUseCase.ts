import { GameLevelRepository } from '../infrastructure/GameLevelRepository';
import { GameLevel, GameLevelConfig } from '../models/GameLevel';

export interface UpdateGameLevelRequest {
    id: string;
    name?: string;
    description?: string;
    difficulty?: string;
    activitiesCount?: number;
    config?: GameLevelConfig;
    isActive?: boolean;
}

export interface UpdateGameLevelResponse {
    level: {
        id: string;
        gameId: string;
        level: number;
        name: string;
        description: string;
        difficulty: string;
        activitiesCount: number;
        config: GameLevelConfig;
        isActive: boolean;
    };
}

export class UpdateGameLevelUseCase {
    constructor(
        private gameLevelRepository: GameLevelRepository
    ) {}

    async execute(request: UpdateGameLevelRequest): Promise<UpdateGameLevelResponse> {
        this.validateRequest(request);

        const existingLevel = await this.gameLevelRepository.findById(request.id);
        if (!existingLevel) {
            throw new Error(`Nivel con id ${request.id} no encontrado`);
        }

        const updatedLevel = await this.gameLevelRepository.update(request.id, {
            name: request.name,
            description: request.description,
            difficulty: request.difficulty,
            activitiesCount: request.activitiesCount,
            config: request.config,
            isActive: request.isActive
        });

        if (!updatedLevel) {
            throw new Error('Error al actualizar el nivel');
        }

        return {
            level: {
                id: updatedLevel.getId(),
                gameId: updatedLevel.getGameId(),
                level: updatedLevel.getLevel(),
                name: updatedLevel.getName(),
                description: updatedLevel.getDescription(),
                difficulty: updatedLevel.getDifficulty(),
                activitiesCount: updatedLevel.getActivitiesCount(),
                config: updatedLevel.getConfig(),
                isActive: updatedLevel.getIsActive()
            }
        };
    }

    private validateRequest(request: UpdateGameLevelRequest): void {
        if (!request.id || request.id.trim() === '') {
            throw new Error('id es requerido');
        }

        if (request.activitiesCount !== undefined && request.activitiesCount < 1) {
            throw new Error('activitiesCount debe ser mayor a 0');
        }

        if (request.config !== undefined && typeof request.config !== 'object') {
            throw new Error('config debe ser un objeto');
        }
    }
}

