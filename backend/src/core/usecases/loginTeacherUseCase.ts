import { InvalidCredentials } from '../models/exceptions/InvalidCredentials';
import { TeacherRepository } from '../infrastructure/TeacherRepository';
import { PasswordEncoder } from '../infrastructure/PasswordEncoder';
import { TokenService } from '../infrastructure/TokenService';

export class LoginTeacherUseCase {
    private teacherRepository: TeacherRepository;
    private passwordEncoder: PasswordEncoder;
    private tokenService: TokenService;

    constructor(
        teacherRepository: TeacherRepository,
        passwordEncoder: PasswordEncoder,
        tokenService: TokenService
    ) {
        this.teacherRepository = teacherRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    async execute(userName: string, password: string): Promise<string> {
        const teacher = await this.teacherRepository.findByUserName(userName);
        if (!teacher || !(await this.passwordEncoder.compare(password, teacher.getPasswordHash()))) {
            throw new InvalidCredentials();
        }
        return this.tokenService.generate({
            id: teacher.id,
            username: teacher.getUsername(),
            role: teacher.getRole()
        });
    }
}