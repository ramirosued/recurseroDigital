import { InvalidCredentials } from '../models/exceptions/InvalidCredentials';
import { StudentRepository } from '../infrastructure/StudentRepository';
import { Student } from '../models/Student';
import { PasswordEncoder } from '../infrastructure/PasswordEncoder';
import { TokenService } from '../infrastructure/TokenService';

export class LoginStudentUseCase {
    private studentRepository: StudentRepository;
    private passwordEncoder: PasswordEncoder;
    private tokenService: TokenService;

    constructor(
        studentRepository: StudentRepository,
        passwordEncoder: PasswordEncoder,
        tokenService: TokenService
    ) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    async execute(userName: string, password: string): Promise<string> {
        const student = await this.studentRepository.findByUserName(userName);
        if (!student || !(await this.passwordEncoder.compare(password, student.getPasswordHash()))) {
            throw new InvalidCredentials();
        }
        return this.tokenService.generate({
            id: student.id,
            username: student.getUsername(),
            role: student.getRole()
        });
    }
}