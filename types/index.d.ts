interface AuthClient {
  authenticate(): Promise<string>;
}

type AuthToken = AuthClient | string;

type Predicate = true | [string, string, string];

interface Entity {
  syncContent(): Promise<void>;
  saveChanges(): Promise<void>;
}
