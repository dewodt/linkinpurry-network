export interface Session {
  userId: string; // treat as string (simpler) => in fe, often uses string (for path params, ect)
  email: string;
  name: string;
  avatarUrl: string;
}
