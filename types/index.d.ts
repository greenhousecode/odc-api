interface AuthClient {
  authenticate(): Promise<string>;
}

type AuthToken = AuthClient | string;

type Predicate = true | ["=", string, string];
