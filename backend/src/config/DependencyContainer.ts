import { LoginTeacherUseCase } from '../core/usecases/./loginTeacherUseCase';
import { PostgreSQLTeacherRepository } from '../infrastructure/PostgreSQLTeacherRepository';
import { PostgreSQLStudentRepository } from '../infrastructure/PostgreSQLStudentRepository';
import { PostgreSQLAdminRepository } from '../infrastructure/PostgreSQLAdminRepository';
import { InMemoryTeacherRepository } from '../infrastructure/InMemoryTeacherRepository';
import { InMemoryStudentRepository } from '../infrastructure/InMemoryStudentRepository';
import { InMemoryAdminRepository } from '../infrastructure/InMemoryAdminRepository';
import { DatabaseConnection } from '../infrastructure/DatabaseConnection';
import { BcryptPasswordEncoder } from '../infrastructure/BcryptPasswordEncoder';
import { JWTTokenService } from '../infrastructure/JWTTokenService';
import {LoginStudentUseCase} from "../core/usecases/loginStudentUseCase";
import {LoginAdminUseCase} from "../core/usecases/loginAdminUseCase";
import {AddStudentUseCase} from "../core/usecases/addStudentUseCase";
import {AddTeacherUseCase} from "../core/usecases/addTeacherUseCase";
import {UUIDGenerator} from "../infrastructure/UUIDGenerator";
import {PostgreSQLCourseRepository} from "../infrastructure/PostgreSQLCoursesRepository";
import {InMemoryCourseRepository} from "../infrastructure/InMemoryCourseRepository";
import { User, UserRole } from '../core/models/User';
import { Admin } from '../core/models/Admin';
import { Teacher } from '../core/models/Teacher';
import { Student } from '../core/models/Student';
import { PostgreSQLStudentStatisticsRepository } from '../infrastructure/PostgreSQLStudentStatisticsRepository';
import { InMemoryStudentStatisticsRepository } from '../infrastructure/InMemoryStudentStatisticsRepository';
import { SaveGameStatisticsUseCase } from '../core/usecases/SaveGameStatisticsUseCase';
import { GetStudentProgressUseCase } from '../core/usecases/GetStudentProgressUseCase';
import { GetGameStatisticsUseCase } from '../core/usecases/GetGameStatisticsUseCase';
import { GetStudentGamesUseCase } from '../core/usecases/GetStudentGamesUseCase';
import { AssignCourseToStudentUseCase } from '../core/usecases/AssignCourseToStudentUseCase';
import { AssignTeacherToCoursesUseCase } from '../core/usecases/AssignTeacherToCourseUseCase';
import { GetTeacherCoursesUseCase } from '../core/usecases/GetTeacherCoursesUseCase';
import { GenerateStudentReportUseCase } from '../core/usecases/GenerateStudentReportUseCase';
import { GetCourseStudentsUseCase } from '../core/usecases/GetCourseStudentsUseCase';
import { GetCourseProgressByGameUseCase } from '../core/usecases/GetCourseProgressByGameUseCase';
import { AiTextGenerator } from '../core/services/AiTextGenerator';
import { GeminiAiTextGenerator } from '../infrastructure/GeminiAiTextGenerator';
import { PostgreSQLGameLevelRepository } from '../infrastructure/PostgreSQLGameLevelRepository';
import { GetGameLevelsUseCase } from '../core/usecases/GetGameLevelsUseCase';
import { UpdateGameLevelUseCase } from '../core/usecases/UpdateGameLevelUseCase';
import { UpdateStudentUseCase } from '../core/usecases/UpdateStudentUseCase';
import { DeleteStudentUseCase } from '../core/usecases/DeleteStudentUseCase';
import { EnableStudentUseCase } from '../core/usecases/EnableStudentUseCase';
import { UpdateTeacherUseCase } from '../core/usecases/UpdateTeacherUseCase';
import { DeleteTeacherUseCase } from '../core/usecases/DeleteTeacherUseCase';
import { EnableTeacherUseCase } from '../core/usecases/EnableTeacherUseCase';


export class DependencyContainer {
    private static instance: DependencyContainer;
    
    private _teacherRepository: PostgreSQLTeacherRepository | InMemoryTeacherRepository | null = null;
    private _studentRepository: PostgreSQLStudentRepository | InMemoryStudentRepository | null = null;
    private _adminRepository: PostgreSQLAdminRepository | InMemoryAdminRepository | null = null;
    private _courseRepository: PostgreSQLCourseRepository | InMemoryCourseRepository | null = null;
    private _statisticsRepository: PostgreSQLStudentStatisticsRepository | InMemoryStudentStatisticsRepository | null = null;
    private _databaseConnection: DatabaseConnection | null = null;
    private _passwordEncoder: BcryptPasswordEncoder | null = null;
    private _tokenService: JWTTokenService | null = null;
    private _uuidGenerator: UUIDGenerator | null = null;
    private _loginTeacherUseCase: LoginTeacherUseCase | null = null;
    private _loginStudentUseCase: LoginStudentUseCase | null = null;
    private _loginAdminUseCase: LoginAdminUseCase | null = null;
    private _addStudentUseCase: AddStudentUseCase | null = null;
    private _addTeacherUseCase: AddTeacherUseCase | null = null;
    private _saveGameStatisticsUseCase: SaveGameStatisticsUseCase | null = null;
    private _getStudentProgressUseCase: GetStudentProgressUseCase | null = null;
    private _getGameStatisticsUseCase: GetGameStatisticsUseCase | null = null;
    private _assignTeacherToCoursesUseCase: AssignTeacherToCoursesUseCase | null = null;
    private _getStudentGamesUseCase: GetStudentGamesUseCase | null = null;
    private _assignCourseToStudentUseCase: AssignCourseToStudentUseCase | null = null;
    private _getTeacherCoursesUseCase: GetTeacherCoursesUseCase | null = null;
    private _generateStudentReportUseCase: GenerateStudentReportUseCase | null = null;
    private _getCourseStudentsUseCase: GetCourseStudentsUseCase | null = null;
    private _getCourseProgressByGameUseCase: GetCourseProgressByGameUseCase | null = null;
    private _aiTextGenerator: AiTextGenerator | null = null;
    private _gameLevelRepository: PostgreSQLGameLevelRepository | null = null;
    private _getGameLevelsUseCase: GetGameLevelsUseCase | null = null;
    private _updateGameLevelUseCase: UpdateGameLevelUseCase | null = null;
    private _updateStudentUseCase: UpdateStudentUseCase | null = null;
    private _deleteStudentUseCase: DeleteStudentUseCase | null = null;
    private _enableStudentUseCase: EnableStudentUseCase | null = null;
    private _updateTeacherUseCase: UpdateTeacherUseCase | null = null;
    private _deleteTeacherUseCase: DeleteTeacherUseCase | null = null;
    private _enableTeacherUseCase: EnableTeacherUseCase | null = null;


    private constructor() {
        if (process.env.NODE_ENV !== 'test') {
            this.initializeDatabase();
        }
    }

    private async initializeDatabase(): Promise<void> {
        try {
            console.log('Inicializando base de datos PostgreSQL...');
            const db = DatabaseConnection.getInstance();
            await db.initializeTables();
            console.log('Base de datos inicializada correctamente');
        } catch (error) {
            console.error('Error al inicializar la base de datos:', error);

        }
    }

    public static getInstance(): DependencyContainer {
        if (!DependencyContainer.instance) {
            DependencyContainer.instance = new DependencyContainer();
        }
        return DependencyContainer.instance;
    }

    public get teacherRepository(): PostgreSQLTeacherRepository | InMemoryTeacherRepository {
        if (!this._teacherRepository) {
            if (process.env.NODE_ENV === 'test') {
                this._teacherRepository = new InMemoryTeacherRepository();
            } else {
                this._teacherRepository = new PostgreSQLTeacherRepository();
            }
        }
        return this._teacherRepository;
    }

    public get studentRepository(): PostgreSQLStudentRepository | InMemoryStudentRepository {
        if (!this._studentRepository) {
            if (process.env.NODE_ENV === 'test') {
                this._studentRepository = new InMemoryStudentRepository();
            } else {
                this._studentRepository = new PostgreSQLStudentRepository();
            }
        }
        return this._studentRepository;
    }

    public get adminRepository(): PostgreSQLAdminRepository | InMemoryAdminRepository {
        if (!this._adminRepository) {
            if (process.env.NODE_ENV === 'test') {
                this._adminRepository = new InMemoryAdminRepository();
            } else {
                this._adminRepository = new PostgreSQLAdminRepository();
            }
        }
        return this._adminRepository;
    }

    public get courseRepository(): PostgreSQLCourseRepository | InMemoryCourseRepository {
        if (!this._courseRepository) {
            if (process.env.NODE_ENV === 'test') {
                this._courseRepository = new InMemoryCourseRepository();
            } else {
                this._courseRepository = new PostgreSQLCourseRepository();
            }
        }
        return this._courseRepository;
    }

    public get statisticsRepository(): PostgreSQLStudentStatisticsRepository | InMemoryStudentStatisticsRepository {
        if (!this._statisticsRepository) {
            if (process.env.NODE_ENV === 'test') {
                this._statisticsRepository = new InMemoryStudentStatisticsRepository();
            } else {
                this._statisticsRepository = new PostgreSQLStudentStatisticsRepository();
            }
        }
        return this._statisticsRepository;
    }

    public get databaseConnection(): DatabaseConnection {
        if (!this._databaseConnection) {
            this._databaseConnection = DatabaseConnection.getInstance();
        }
        return this._databaseConnection;
    }

    public get passwordEncoder(): BcryptPasswordEncoder {
        if (!this._passwordEncoder) {
            this._passwordEncoder = new BcryptPasswordEncoder();
        }
        return this._passwordEncoder;
    }

    public get tokenService(): JWTTokenService {
        if (!this._tokenService) {
            this._tokenService = new JWTTokenService();
        }
        return this._tokenService;
    }

    public get uuidGenerator(): UUIDGenerator {
        if (!this._uuidGenerator) {
            this._uuidGenerator = new UUIDGenerator();
        }
        return this._uuidGenerator;
    }

    public get loginTeacherUseCase(): LoginTeacherUseCase {
        if (!this._loginTeacherUseCase) {
            this._loginTeacherUseCase = new LoginTeacherUseCase(
                this.teacherRepository,
                this.passwordEncoder,
                this.tokenService
            );
        }
        return this._loginTeacherUseCase;
    }

    public get loginStudentUseCase(): LoginStudentUseCase {
        if (!this._loginStudentUseCase) {
            this._loginStudentUseCase = new LoginStudentUseCase(
                this.studentRepository,
                this.passwordEncoder,
                this.tokenService
            );
        }
        return this._loginStudentUseCase;
    }

    public get loginAdminsUseCase(): LoginAdminUseCase {
        if (!this._loginAdminUseCase) {
            this._loginAdminUseCase = new LoginAdminUseCase(
                this.adminRepository,
                this.passwordEncoder,
                this.tokenService
            );
        }
        return this._loginAdminUseCase;
    }

    public get addStudentUseCase(): AddStudentUseCase {
        if (!this._addStudentUseCase) {
            this._addStudentUseCase = new AddStudentUseCase(
                this.studentRepository,
                this.passwordEncoder,
                this.uuidGenerator
            );
        }
        return this._addStudentUseCase;
    }

    public get addTeacherUseCase(): AddTeacherUseCase {
        if (!this._addTeacherUseCase) {
            this._addTeacherUseCase = new AddTeacherUseCase(
                this.teacherRepository,
                this.passwordEncoder,
                this.uuidGenerator
            );
        }
        return this._addTeacherUseCase;
    }

    public get saveGameStatisticsUseCase(): SaveGameStatisticsUseCase {
        if (!this._saveGameStatisticsUseCase) {
            this._saveGameStatisticsUseCase = new SaveGameStatisticsUseCase(
                this.statisticsRepository,
                this.uuidGenerator
            );
        }
        return this._saveGameStatisticsUseCase;
    }

    public get getStudentProgressUseCase(): GetStudentProgressUseCase {
        if (!this._getStudentProgressUseCase) {
            this._getStudentProgressUseCase = new GetStudentProgressUseCase(
                this.statisticsRepository,
                this.gameLevelRepository
            );
        }
        return this._getStudentProgressUseCase;
    }

    public get getGameStatisticsUseCase(): GetGameStatisticsUseCase {
        if (!this._getGameStatisticsUseCase) {
            this._getGameStatisticsUseCase = new GetGameStatisticsUseCase(
                this.statisticsRepository
            );
        }
        return this._getGameStatisticsUseCase;
    }

    public get getStudentGamesUseCase(): GetStudentGamesUseCase {
        if (!this._getStudentGamesUseCase) {
            this._getStudentGamesUseCase = new GetStudentGamesUseCase(
                this.studentRepository,
                this.courseRepository
            );
        }
        return this._getStudentGamesUseCase;
    }

    public get assignCourseToStudentUseCase(): AssignCourseToStudentUseCase {
        if (!this._assignCourseToStudentUseCase) {
            this._assignCourseToStudentUseCase = new AssignCourseToStudentUseCase(
                this.studentRepository,
                this.courseRepository
            );
        }
        return this._assignCourseToStudentUseCase;
    }

    public get assignTeacherToCoursesUseCase(): AssignTeacherToCoursesUseCase {
        if (!this._assignTeacherToCoursesUseCase) {
            this._assignTeacherToCoursesUseCase = new AssignTeacherToCoursesUseCase(
                this.courseRepository,
                this.teacherRepository
            );
        }
        return this._assignTeacherToCoursesUseCase;
    }

    public get getTeacherCoursesUseCase(): GetTeacherCoursesUseCase {
        if (!this._getTeacherCoursesUseCase) {
            this._getTeacherCoursesUseCase = new GetTeacherCoursesUseCase(
                this.teacherRepository,
                this.courseRepository
            );
        }
        return this._getTeacherCoursesUseCase;
    }

    private get aiTextGenerator(): AiTextGenerator {
        if (!this._aiTextGenerator) {
            if (process.env.NODE_ENV === 'test') {
                this._aiTextGenerator = {
                    async generateText(prompt: string): Promise<{ text: string; provider: string; model: string }> {
                        return {
                            text: 'Reporte simulado (test). No se realizaron llamadas a servicios externos.',
                            provider: 'test-double',
                            model: 'mock'
                        };
                    }
                };
            } else {
                this._aiTextGenerator = new GeminiAiTextGenerator();
            }
        }
        return this._aiTextGenerator;
    }

    public get generateStudentReportUseCase(): GenerateStudentReportUseCase {
        if (!this._generateStudentReportUseCase) {
            this._generateStudentReportUseCase = new GenerateStudentReportUseCase(
                this.studentRepository,
                this.statisticsRepository,
                this.aiTextGenerator,
                this.gameLevelRepository
            );
        }

        return this._generateStudentReportUseCase;
    }

    public get getCourseStudentsUseCase(): GetCourseStudentsUseCase {
        if (!this._getCourseStudentsUseCase) {
            this._getCourseStudentsUseCase = new GetCourseStudentsUseCase(
                this.studentRepository,
                this.statisticsRepository,
                this.courseRepository,
                this.gameLevelRepository
            );
        }

        return this._getCourseStudentsUseCase;
    }

    public get getCourseProgressByGameUseCase(): GetCourseProgressByGameUseCase {
        if (!this._getCourseProgressByGameUseCase) {
            this._getCourseProgressByGameUseCase = new GetCourseProgressByGameUseCase(
                this.studentRepository,
                this.statisticsRepository,
                this.gameLevelRepository,
                this.courseRepository
            );
        }
        return this._getCourseProgressByGameUseCase;
    }

    public get gameLevelRepository(): PostgreSQLGameLevelRepository {
        if (!this._gameLevelRepository) {
            this._gameLevelRepository = new PostgreSQLGameLevelRepository();
        }
        return this._gameLevelRepository;
    }

    public get getGameLevelsUseCase(): GetGameLevelsUseCase {
        if (!this._getGameLevelsUseCase) {
            this._getGameLevelsUseCase = new GetGameLevelsUseCase(
                this.gameLevelRepository
            );
        }
        return this._getGameLevelsUseCase;
    }

    public get updateGameLevelUseCase(): UpdateGameLevelUseCase {
        if (!this._updateGameLevelUseCase) {
            this._updateGameLevelUseCase = new UpdateGameLevelUseCase(
                this.gameLevelRepository
            );
        }
        return this._updateGameLevelUseCase;
    }

    public get updateStudentUseCase(): UpdateStudentUseCase {
        if (!this._updateStudentUseCase) {
            this._updateStudentUseCase = new UpdateStudentUseCase(
                this.studentRepository,
                this.teacherRepository,
                this.adminRepository,
                this.passwordEncoder
            );
        }
        return this._updateStudentUseCase;
    }

    public get deleteStudentUseCase(): DeleteStudentUseCase {
        if (!this._deleteStudentUseCase) {
            this._deleteStudentUseCase = new DeleteStudentUseCase(
                this.studentRepository
            );
        }
        return this._deleteStudentUseCase;
    }

    public get enableStudentUseCase(): EnableStudentUseCase {
        if (!this._enableStudentUseCase) {
            this._enableStudentUseCase = new EnableStudentUseCase(
                this.studentRepository
            );
        }
        return this._enableStudentUseCase;
    }

    public get updateTeacherUseCase(): UpdateTeacherUseCase {
        if (!this._updateTeacherUseCase) {
            this._updateTeacherUseCase = new UpdateTeacherUseCase(
                this.teacherRepository,
                this.studentRepository,
                this.adminRepository,
                this.courseRepository,
                this.passwordEncoder
            );
        }
        return this._updateTeacherUseCase;
    }

    public get deleteTeacherUseCase(): DeleteTeacherUseCase {
        if (!this._deleteTeacherUseCase) {
            this._deleteTeacherUseCase = new DeleteTeacherUseCase(
                this.teacherRepository
            );
        }
        return this._deleteTeacherUseCase;
    }

    public get enableTeacherUseCase(): EnableTeacherUseCase {
        if (!this._enableTeacherUseCase) {
            this._enableTeacherUseCase = new EnableTeacherUseCase(
                this.teacherRepository
            );
        }
        return this._enableTeacherUseCase;
    }

    public async clearAllData(): Promise<void> {
        if (process.env.NODE_ENV === 'test') {
            await (this.teacherRepository as InMemoryTeacherRepository).clearTeachers();
            await (this.studentRepository as InMemoryStudentRepository).clearStudents();
            await (this.adminRepository as InMemoryAdminRepository).clearAdmins();
            await (this.courseRepository as InMemoryCourseRepository).clearCourses();
            await (this.statisticsRepository as InMemoryStudentStatisticsRepository).clearStatistics();

            await this.initializeTestData();
        }
    }

    private async initializeTestData(): Promise<void> {
        const testContainer = DependencyContainer.getInstance();
        
        const adminUser = new User(
            '2',
            'julian',
            '$2b$10$T9xOluqoDwlRMZ/LeIdsL.MUagpZUkBOtq.ZR95Bp98tbYCr/yKr6',
            UserRole.ADMIN
        );
        const admin = new Admin('1', '2', 1, ['all'], adminUser);
        await (testContainer.adminRepository as InMemoryAdminRepository).addAdmin(admin);

        const teacherUser = new User(
            '1',
            'Mariana@gmail.com',
            '$2b$10$pxoWnWCOR5f5tWmjLemzSuyeDzx3R8NFv4n80.F.Onh7hYKWMFYni',
            UserRole.TEACHER
        );
        const teacher = new Teacher('1', 'Mariana', 'García', 'Mariana@gmail.com', teacherUser);
        await (testContainer.teacherRepository as InMemoryTeacherRepository).addTeacher(teacher);

        const studentUser = new User(
            '1',
            'nico@gmail.com',
            '$2b$10$T9xOluqoDwlRMZ/LeIdsL.MUagpZUkBOtq.ZR95Bp98tbYCr/yKr6',
            UserRole.STUDENT
        );
        const student = new Student('1', 'Nicolás', 'García', '12345678', null, studentUser);
        await (testContainer.studentRepository as InMemoryStudentRepository).addStudent(student);

    }

}
