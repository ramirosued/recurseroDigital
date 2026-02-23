import { AdminRepository } from '../core/infrastructure/AdminRepository';
import { Admin } from '../core/models/Admin';
import { User, UserRole } from '../core/models/User';

export class InMemoryAdminRepository implements AdminRepository {
  private admins: Admin[] = [];

  constructor() {
    const adminUser = new User(
      '2',
      'julian',
      '$2b$10$T9xOluqoDwlRMZ/LeIdsL.MUagpZUkBOtq.ZR95Bp98tbYCr/yKr6',
      UserRole.ADMIN
    );
    const admin = new Admin('1', '2', 1, ['all'], adminUser);
    this.admins = [admin];
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

  async clearAdmins(): Promise<void> {
    this.admins = [];
  }
}
