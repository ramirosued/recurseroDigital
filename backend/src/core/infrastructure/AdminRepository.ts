import {Admin} from "../models/Admin";

export interface AdminRepository {
    findByUserName(userName: string): Promise<Admin | null>;
    addAdmin(adminData: Admin): Promise<void>;
    getAllAdmins(): Promise<Admin[]>;
    findById(id: string): Promise<Admin | null>;
    updateAdmin(adminData: Admin): Promise<void>;
    deleteAdmin(id: string): Promise<void>;
}