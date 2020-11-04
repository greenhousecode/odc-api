interface AuthClient {
  authenticate(): Promise<string>;
}

type AuthToken = AuthClient | string;

type ArgumentTypes<T extends (...a: any) => any> = T extends (
  ...a: infer A
) => any
  ? A
  : never;

type ExpandTuple<T1, T2 extends any[]> = ArgumentTypes<
  (a: T1, ...r: T2) => void
>;

type Predicate = true | [string, string, string];

type ComposedPredicate = ExpandTuple<string, Predicate[]>;

interface Entity {
  syncContent(): Promise<void>;
  saveChanges(): Promise<void>;
}

interface NestedSchemas {
  [key: string]: NestedSchemas | string;
}
