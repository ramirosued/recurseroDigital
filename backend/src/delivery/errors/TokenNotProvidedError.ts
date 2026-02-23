export class TokenNotProvidedError extends Error {
  constructor() {
    super('Token no proporcionado');
    this.name = 'TokenNotProvidedError';
  }
}


