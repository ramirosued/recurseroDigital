export class StudentStatisticsEntity {
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
}
