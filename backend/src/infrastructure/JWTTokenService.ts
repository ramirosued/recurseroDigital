import jwt from 'jsonwebtoken';
import { TokenService } from '../core/infrastructure/TokenService';

export class JWTTokenService implements TokenService {
  private readonly secretKey: string;
  private readonly expiresIn: string;

  constructor(secretKey: string = process.env.JWT_SECRET || 'your-secret-key', expiresIn: string = '1h') {
    this.secretKey = secretKey;
    this.expiresIn = expiresIn;
  }

  generate(payload: object): string {
    return jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  verify(token: string): object | null {
    try {
      return jwt.verify(token, this.secretKey) as object;
    } catch (error) {
      return null;
    }
  }

  getUserFromToken(token: string): { id: string; username: string; role: string } | null {
    try {
      const decoded = jwt.verify(token, this.secretKey) as any;
      if (decoded && decoded.id && decoded.username && decoded.role) {
        return {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
