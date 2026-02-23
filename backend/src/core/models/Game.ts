export class Game {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    route: string;
    difficultyLevel: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: string,
        name: string,
        description: string,
        imageUrl: string,
        route: string,
        difficultyLevel: number = 1,
        isActive: boolean = true,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date()
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.route = route;
        this.difficultyLevel = difficultyLevel;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    getName(): string {
        return this.name;
    }

    getDescription(): string {
        return this.description;
    }

    getImageUrl(): string {
        return this.imageUrl;
    }

    getRoute(): string {
        return this.route;
    }

    getDifficultyLevel(): number {
        return this.difficultyLevel;
    }

    getIsActive(): boolean {
        return this.isActive;
    }
}
