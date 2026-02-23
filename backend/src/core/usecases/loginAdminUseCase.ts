import { InvalidCredentials } from '../models/exceptions/InvalidCredentials';
import { AdminRepository } from '../infrastructure/AdminRepository';
import { PasswordEncoder } from '../infrastructure/PasswordEncoder';
import { TokenService } from '../infrastructure/TokenService';

export class LoginAdminUseCase {
    private adminRepository: AdminRepository;
    private passwordEncoder: PasswordEncoder;
    private tokenService: TokenService;

    constructor(
        adminRepository: AdminRepository,
        passwordEncoder: PasswordEncoder,
        tokenService: TokenService
    ) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    async execute(userName: string, password: string): Promise<string> {
        const admin = await this.adminRepository.findByUserName(userName);
        if (!admin || !(await this.passwordEncoder.compare(password, admin.getPasswordHash()))) {
            throw new InvalidCredentials();
        }
        return this.tokenService.generate({
            id: admin.id,
            username: admin.getUsername(),
            role: admin.getRole()
        });
    }
}