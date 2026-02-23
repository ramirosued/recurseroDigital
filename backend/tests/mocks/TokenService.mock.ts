import { TokenService } from '../../src/core/infrastructure/TokenService';

export class MockTokenService implements TokenService {
  private tokenCounter = 0;

  generate(payload: object): string {
    this.tokenCounter++;
    return `mock_token_${this.tokenCounter}_${JSON.stringify(payload)}`;
  }

  verify(token: string): object | null {
    if (token.startsWith('mock_token_')) {
      return { id: '1', username: 'testuser', role: 'user' };
    }
    return null;
  }

  getUserFromToken(token: string): { id: string; username: string; role: string } | null {
    if (token.startsWith('mock_token_')) {
      return { id: '1', username: 'testuser', role: 'student' };
    }
    return null;
  }

  getLastGeneratedToken(): string | null {
    return this.tokenCounter > 0 ? `mock_token_${this.tokenCounter}` : null;
  }

  reset(): void {
    this.tokenCounter = 0;
  }
}
