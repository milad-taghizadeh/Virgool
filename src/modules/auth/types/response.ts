export type AuthResponse = {
  token: Promise<string>;
  code: string;
};
