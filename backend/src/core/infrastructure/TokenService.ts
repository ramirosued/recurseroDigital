export interface TokenService {
    generate(payload: object): string;
    verify(token: string): object | null;
    getUserFromToken(token: string): { id: string; username: string; role: string } | null;
}