import deepEqual from 'deep-equal';

export interface Variant {
  content: NestedSchemas;
  context: NestedSchemas;
}

export interface BuildVariant {
  context: NestedSchemas;
  'template-revision-id': number;
}

// ToDo: add extra build types
export type BuildType = 'video';

export interface BuildConfig {
  type: BuildType;
  variants: BuildVariant[];
}

export default class Build {
  public variants: BuildVariant[] = [];

  constructor(public type: BuildType) {}

  addVariant(templateRevisionId: number, variant: Variant | BuildVariant) {
    this.variants.push({
      'template-revision-id': templateRevisionId,
      context: variant.context,
    });
  }

  removeVariant(variant: Variant | BuildVariant) {
    const index = this.variants.findIndex((item) =>
      deepEqual(item.context, variant.context)
    );

    if (index > -1) {
      return this.variants.splice(index, 1)[0];
    }

    return null;
  }
}
