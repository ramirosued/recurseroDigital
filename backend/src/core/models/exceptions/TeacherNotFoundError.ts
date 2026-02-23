export class TeacherNotFoundError extends Error {
  constructor() {
    super('Profesor no encontrado');
    this.name = 'TeacherNotFoundError';
  }
}

