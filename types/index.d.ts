interface AuthClient {
  authenticate(): Promise<string>;
}

type AuthToken = AuthClient | string;

type Predicate = true | [string, string, string];

type ComposedPredicate = [string, ...Predicate[]];

interface Entity {
  syncContent(): Promise<void>;
  saveChanges(): Promise<void>;
}

interface NestedSchemas {
  [key: string]: NestedSchemas | string;
}
