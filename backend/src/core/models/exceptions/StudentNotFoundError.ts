export class StudentNotFoundError extends Error {
  constructor() {
    super('Estudiante no encontrado');
    this.name = 'StudentNotFoundError';
  }
}

