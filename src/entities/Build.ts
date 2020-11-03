import ODC, { ApiType } from '../ODCAuthClient';

export interface Variant {
  content: NestedSchemas;
  context: NestedSchemas;
}

export interface BuildVariant {
  context: NestedSchemas;
  'template-revision-id': number;
}

export interface BuildConfig {
  type: 'video';
  variants: BuildVariant[];
}

export default class Build {
  public variants: Variant[] = [];

  constructor(private client: ODC, public type: BuildConfig['type']) {}

  addVariant(templateRevisionId: number, variant: Variant) {}
}
