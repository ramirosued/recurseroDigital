export interface GameLevelConfig {
    min?: number;
    max?: number;
    range?: string;
    operation?: number | string;
    color?: string;
    icon?: string;
    numbersCount?: number;
    [key: string]: any;
}

export class GameLevel {
    id: string;
    gameId: string;
    level: number;
    name: string;
    description: string;
    difficulty: string;
    activitiesCount: number;
    config: GameLevelConfig;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: string,
        gameId: string,
        level: number,
        name: string,
        description: string,
        difficulty: string,
        activitiesCount: number,
        config: GameLevelConfig,
        isActive: boolean = true,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date()
    ) {
        this.id = id;
        this.gameId = gameId;
        this.level = level;
        this.name = name;
        this.description = description;
        this.difficulty = difficulty;
        this.activitiesCount = activitiesCount;
        this.config = config;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    getId(): string {
        return this.id;
    }

    getGameId(): string {
        return this.gameId;
    }

    getLevel(): number {
        return this.level;
    }

    getName(): string {
        return this.name;
    }

    getDescription(): string {
        return this.description;
    }

    getDifficulty(): string {
        return this.difficulty;
    }

    getActivitiesCount(): number {
        return this.activitiesCount;
    }

    getConfig(): GameLevelConfig {
        return this.config;
    }

    getIsActive(): boolean {
        return this.isActive;
    }

    getConfigValue<T>(key: string, defaultValue?: T): T | undefined {
        return this.config[key] as T ?? defaultValue;
    }

    hasConfigKey(key: string): boolean {
        return key in this.config && this.config[key] !== undefined;
    }

    getNumericRange(): { min?: number; max?: number } | null {
        if (this.hasConfigKey('min') && this.hasConfigKey('max')) {
            return {
                min: this.getConfigValue<number>('min'),
                max: this.getConfigValue<number>('max')
            };
        }
        return null;
    }

    isValidConfiguration(): boolean {
        return this.level > 0 && 
               this.activitiesCount > 0 && 
               this.config !== null && 
               typeof this.config === 'object';
    }
}

