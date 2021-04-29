import FormData from 'form-data';
import ODC, { ApiType } from '../ODCAuthClient';
import Build, { Variant } from './Build';

export interface Assignment {
  expr: string;
  name: string;
}

export interface ContextRule {
  assignments: Assignment[];
  predicate: Predicate;
  name?: string;
}

export interface Placeholder {
  type: 'text' | 'click' | 'audio' | 'video' | 'image' | string;
  name: string;
  defaultValue?: string;
}

export interface Context {
  alias: 'custom';
}

export interface Content {
  meta: {
    'advertiser-id': number;
    schema: 'urn:lemonpi:schema:content-function:rules:v1';
  };
  data: {
    context: Context[];
    rules: ContextRule[];
    placeholders: Placeholder[];
  };
}

export interface VariantsConfig {
  count: number;
  items: Variant[];
}

export type ContentStage = 'draft' | 'published';

type StagedContentFunction<T extends string = undefined> = {
  id: number;
  name: T;
};

type ContentOverview = {
  publishedContentFunction?: StagedContentFunction;
  stagedContentFunctions: StagedContentFunction<'draft'>[];
};

const EXPRESSION_VALUE_CHAR_LIMIT = 2048;

// doesnt work yet..
function hasCorrectContentFormat(
  toBeDetermined: any
): toBeDetermined is Content {
  return !!(toBeDetermined as Content);
}

export default class Adset {
  public content: Content;

  public variants: VariantsConfig;

  constructor(private client: ODC, private adsetId: number) {}

  async getDetails() {
    const { data } = await this.client.get(
      ApiType.LEGACY,
      `/adsets-2/${this.adsetId}`
    );

    return data;
  }

  async getContentOverview() {
    const { data } = await this.client.get(
      ApiType.LEGACY,
      `/adsets-2/${this.adsetId}/content-function/overview`
    );

    return data as ContentOverview;
  }

  async getContentVariants() {
    const {
      data: { items },
    } = await this.client.post(
      ApiType.LEGACY,
      `/content-functions/adset/${this.adsetId}/variants`,
      null
    );
    return items;
  }

  async syncVariants() {
    const { data } = await this.client.get(
      ApiType.LEGACY,
      `/adsets-2/${this.adsetId}/content-functions/published/variants`
    );

    this.variants = data;
  }

  async getContentStage(stage: ContentStage) {
    const { data } = await this.client.get(
      ApiType.LEGACY,
      `/adsets-2/${this.adsetId}/content-function?stage=${stage}`
    );

    return data;
  }

  async syncContent(stage: ContentStage) {
    const content = await this.getContentStage(stage);
    this.content = content;
  }

  async createContentStage(stage: ContentStage, content: Content) {
    const formData = new FormData();
    formData.append('json', JSON.stringify(content));

    const response = await this.client.put(
      ApiType.LEGACY,
      `/adsets-2/${this.adsetId}/content-function?stage=${stage}`,
      formData
    );

    return response.status === 204;
  }

  async saveChanges(stage: ContentStage) {
    if (!hasCorrectContentFormat(this.content)) {
      throw new Error(
        'Cannot save Adset content, as the format of the content is incorrect.'
      );
    }

    // Rules require to have an indexed incremental name
    this.content.data.rules = this.content.data.rules.map((rule, index) =>
      // The first rule is the default, so it doesn't have a name
      index > 0
        ? {
            ...rule,
            name: `rule${index - 1}`,
          }
        : rule
    );

    if (stage === 'draft') {
      return this.createContentStage('draft', this.content);
    }

    await this.createContentStage('draft', this.content);

    return this.client.post(
      ApiType.LEGACY,
      `/adsets-2/${this.adsetId}/content-function/publish?stage=draft`,
      null,
      {
        'Content-Type': 'application/json',
      }
    );
  }

  // Variants and Builds

  async runBuild(build: Build) {
    if (build.variants.length) {
      const payload = {
        type: build.type,
        variants: [...build.variants],
      };

      const { data } = await this.client.post(
        ApiType.NORMAL,
        `/adsets/${this.adsetId}/builds`,
        payload
      );

      return data;
    }

    return null;
  }

  async getBuild(buildId: number) {
    const { data } = await this.client.get(
      ApiType.NORMAL,
      `/adsets/${this.adsetId}/builds/${buildId}`
    );
    return data;
  }

  async getBuildVariants(buildId: number) {
    const { data } = await this.client.get(
      ApiType.NORMAL,
      `/adsets/${this.adsetId}/builds/${buildId}/variants`
    );
    return data;
  }

  getVariantByPredicate(predicate: Predicate | ComposedPredicate) {
    if (!this.variants) {
      throw new Error(
        'Please sync your variants first by running "await <your-adset-instance>.syncVariants()"'
      );
    }

    const [source, selector] = predicate[1].replace(/[${}]/g, '').split('.');

    return this.variants.items.find(
      (variant) => variant.context[source][selector] === predicate[2]
    );
  }

  // Context Rules

  addContextRule(rule: ContextRule) {
    rule.assignments.forEach((assignment) => {
      if (!assignment.expr || typeof assignment.expr !== 'string') {
        throw new Error('Please provide an expr value of type String');
      }
    });

    this.content.data.rules.push(rule);
  }

  removeContextRuleByPredicate(predicate: Predicate | ComposedPredicate) {
    const index = this.content.data.rules.findIndex(
      (contextRule) =>
        JSON.stringify(contextRule.predicate) === JSON.stringify(predicate)
    );

    if (index > -1) {
      return this.content.data.rules.splice(index, 1)[0];
    }

    return null;
  }

  removeAllContextRules() {
    const defaults = this.content.data.rules.shift();
    this.content.data.rules = [defaults];
  }

  getContextRuleByPredicate(predicate: Predicate | ComposedPredicate) {
    const rule = this.content.data.rules.find(
      (contextRule) =>
        JSON.stringify(contextRule.predicate) === JSON.stringify(predicate)
    );

    return rule;
  }

  // Placeholders

  addPlaceholder(placeholder: Placeholder) {
    if (!placeholder.defaultValue) {
      throw new Error('Cannot add placeholder without a default value!');
    }

    const { defaultValue } = placeholder;

    // eslint-disable-next-line no-param-reassign
    delete placeholder.defaultValue;

    this.content.data.placeholders.push(placeholder);

    this.content.data.rules[0].assignments.push({
      expr: defaultValue,
      name: placeholder.name,
    });
  }

  removePlaceholder(placeholder: Placeholder) {
    const placeholderIndex = this.content.data.placeholders.findIndex(
      (item) => item.name === placeholder.name && item.type === placeholder.type
    );

    if (placeholderIndex > -1) {
      const assignmentIndex = this.content.data.rules[0].assignments.findIndex(
        (item) => item.name === placeholder.name
      );

      // remove assignments in defaults
      this.content.data.rules[0].assignments.splice(assignmentIndex, 1);
      return this.content.data.placeholders.splice(placeholderIndex, 1)[0];
    }

    return null;
  }

  hasPlaceholder(placeholder: Placeholder) {
    return this.content.data.placeholders.reduce((bool, item) => {
      return (
        bool ||
        (item.name === placeholder.name && item.type === placeholder.type)
      );
    }, false);
  }
}
