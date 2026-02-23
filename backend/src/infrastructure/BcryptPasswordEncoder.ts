import bcrypt from 'bcrypt';
import { PasswordEncoder } from '../core/infrastructure/PasswordEncoder';

export class BcryptPasswordEncoder implements PasswordEncoder {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  async encode(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
