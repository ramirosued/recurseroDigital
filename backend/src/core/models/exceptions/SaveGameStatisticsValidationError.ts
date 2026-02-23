export class SaveGameStatisticsValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SaveGameStatisticsValidationError';
    }
}

