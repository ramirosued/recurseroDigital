import { TokenNotProvidedError } from '../errors/TokenNotProvidedError';

export class AuthorizationHeaderService {
  static extractBearerToken(authHeader?: string | string[]): string {
    if (!authHeader) {
      throw new TokenNotProvidedError();
    }

    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    const trimmedHeader = headerValue.trim();

    if (!trimmedHeader.startsWith('Bearer ')) {
      throw new TokenNotProvidedError();
    }

    const token = trimmedHeader.slice('Bearer '.length).trim();

    if (!token) {
      throw new TokenNotProvidedError();
    }

    return token;
  }
}

