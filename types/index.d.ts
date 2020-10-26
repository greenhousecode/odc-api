interface AuthClient {
  authenticate(): Promise<string>;
}

type ContentStage = "draft" | "published";

type AuthToken = AuthClient | string;

type Predicate = true | ["=", string, string];

interface Entity {
  syncContent(content: ContentStage): Promise<void>;
  saveChanges(): Promise<void>;
}
