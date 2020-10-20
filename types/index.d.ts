interface AuthClient {
  authenticate(): Promise<string>;
}

type AuthToken = AuthClient | string;
