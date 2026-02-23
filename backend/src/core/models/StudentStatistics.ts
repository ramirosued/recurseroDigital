export class StudentStatistics {
    id: string;
    studentId: string;
    gameId: string;
    level: number;
    activity: number;
    points: number;
    totalPoints: number;
    attempts: number;
    correctAnswers?: number;
    totalQuestions?: number;
    completionTime?: number;
    isCompleted: boolean;
    maxUnlockedLevel: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: string,
        studentId: string,
        gameId: string,
        level: number,
        activity: number,
        points: number,
        totalPoints: number,
        attempts: number,
        isCompleted: boolean,
        maxUnlockedLevel: number,
        createdAt: Date,
        updatedAt: Date,
        correctAnswers?: number,
        totalQuestions?: number,
        completionTime?: number
    ) {
        this.id = id;
        this.studentId = studentId;
        this.gameId = gameId;
        this.level = level;
        this.activity = activity;
        this.points = points;
        this.totalPoints = totalPoints;
        this.attempts = attempts;
        this.correctAnswers = correctAnswers;
        this.totalQuestions = totalQuestions;
        this.completionTime = completionTime;
        this.isCompleted = isCompleted;
        this.maxUnlockedLevel = maxUnlockedLevel;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    getAccuracy(): number {
        let accuary;
        if (!this.totalQuestions || this.totalQuestions === 0){
            accuary = 0;

        } else{
            accuary = (this.correctAnswers || 0) / this.totalQuestions;
        }
        return accuary;
    }

    getSuccessRate(): number {
        return this.getAccuracy() * 100;
    }

    getAverageTimePerQuestion(): number {
        let averageTime;
        if (!this.completionTime || !this.totalQuestions || this.totalQuestions === 0){
            averageTime = 0;
        } else{
          averageTime=  this.completionTime / this.totalQuestions
        }
        return averageTime;
    }

    isLevelCompleted(): boolean {
        return this.isCompleted && this.level <= this.maxUnlockedLevel;
    }

    updateProgress(points: number, attempts: number, isCompleted: boolean = false): void {
        this.points += points;
        this.totalPoints += points;
        this.attempts += attempts;
        this.isCompleted = isCompleted;
        this.updatedAt = new Date();
    }
}
