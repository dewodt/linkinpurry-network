export interface Session {
  userId: bigint; // REMEMBER TO DESERIALIZE
  email: string;
  name: string;
  avatarUrl: string;
}
