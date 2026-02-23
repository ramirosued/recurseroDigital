import { LoginAdminUseCase } from '../../../src/core/usecases/loginAdminUseCase';
import { InvalidCredentials } from '../../../src/core/models/exceptions/InvalidCredentials';
import { MockAdminRepository } from '../../mocks/AdminRepository.mock';
import { MockPasswordEncoder } from '../../mocks/PasswordEncoder.mock';
import { MockTokenService } from '../../mocks/TokenService.mock';
import { User, UserRole } from '../../../src/core/models/User';

describe('LoginAdminUseCase', () => {
  let loginUseCase: LoginAdminUseCase;
  let mockUserRepository: MockAdminRepository;
  let mockPasswordEncoder: MockPasswordEncoder;
  let mockTokenService: MockTokenService;

  beforeEach(() => {
    mockUserRepository = new MockAdminRepository();
    mockPasswordEncoder = new MockPasswordEncoder();
    mockTokenService = new MockTokenService();
    
    loginUseCase = new LoginAdminUseCase(
      mockUserRepository,
      mockPasswordEncoder,
      mockTokenService
    );
  });

  afterEach(() => {
    mockUserRepository.clearAdmins();
    mockPasswordEncoder.clearPasswords();
    mockTokenService.reset();
  });

  describe('execute', () => {
    it('debe lanzar InvalidCredentials cuando no encuentra usuario en la DB', async () => {
      const userName = 'admin_inexistente';
      const password = 'password123';

      await expect(loginUseCase.execute(userName, password))
        .rejects
        .toThrow(InvalidCredentials);
    });

    it('debe lanzar InvalidCredentials cuando encuentra usuario pero la contraseña no coincide', async () => {
      const user = new User(
        '1',
        'adminuser',
        'hashed_correct_password',
        UserRole.ADMIN
      );
      
      mockUserRepository.addUser(user);
      mockPasswordEncoder.setPasswordMatch('correct_password', 'hashed_correct_password');
      
      const userName = 'adminuser';
      const wrongPassword = 'wrong_password';

      await expect(loginUseCase.execute(userName, wrongPassword))
        .rejects
        .toThrow(InvalidCredentials);
    });

    it('debe retornar un token cuando encuentra usuario y la contraseña coincide', async () => {
      const user = new User(
        '1',
        'adminuser',
        'hashed_correct_password',
        UserRole.ADMIN
      );
      
      mockUserRepository.addUser(user);
      mockPasswordEncoder.setPasswordMatch('correct_password', 'hashed_correct_password');
      
      const userName = 'adminuser';
      const password = 'correct_password';

      const result = await loginUseCase.execute(userName, password);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('mock_token_');
    });
  });
});
