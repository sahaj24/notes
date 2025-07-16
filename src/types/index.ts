export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
};