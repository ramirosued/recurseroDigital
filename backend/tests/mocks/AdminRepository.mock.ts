import { AdminRepository } from '../../src/core/infrastructure/AdminRepository';
import { Admin } from '../../src/core/models/Admin';
import { User } from '../../src/core/models/User';

export class MockAdminRepository implements AdminRepository {
  private admins: Admin[] = [];

  constructor(admins: Admin[] = []) {
    this.admins = admins;
  }

  async findByUserName(userName: string): Promise<Admin | null> {
    const admin = this.admins.find(a => a.user.username === userName);
    return admin || null;
  }

  async addAdmin(adminData: Admin): Promise<void> {
    this.admins.push(adminData);
  }

  async getAllAdmins(): Promise<Admin[]> {
    return [...this.admins];
  }

  async findById(id: string): Promise<Admin | null> {
    const admin = this.admins.find(a => a.id === id);
    return admin || null;
  }

  async updateAdmin(adminData: Admin): Promise<void> {
    const index = this.admins.findIndex(a => a.id === adminData.id);
    if (index !== -1) {
      this.admins[index] = adminData;
    }
  }

  async deleteAdmin(id: string): Promise<void> {
    const index = this.admins.findIndex(a => a.id === id);
    if (index !== -1) {
      this.admins.splice(index, 1);
    }
  }

  // Métodos auxiliares para testing
  addUser(user: User): void {
    const admin = new Admin('1', user.id, 1, ['all'], user);
    this.admins.push(admin);
  }

  clearAdmins(): void {
    this.admins = [];
  }
}
