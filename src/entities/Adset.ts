import FormData from "form-data";
import ODC, { ApiType } from "../ODCAuthClient";

export interface Assignment {
  expr: string;
  name: string;
}

export interface ContextRule {
  assignments: Assignment[];
  predicate: Predicate;
}

export interface Placeholder {
  type: "text" | "number" | "click" | "audio" | "video" | "image";
  name: string;
}

export interface Context {
  alias: "custom";
}

export interface Content {
  meta: {
    "advertiser-id": number;
    schema: "urn:lemonpi:schema:content-function:rules:v1";
  };
  data: {
    context: Context[];
    rules: ContextRule[];
    placeholders: Placeholder[];
  };
}

// doesnt work yet..
function hasCorrectContentFormat(
  toBeDetermined: any
): toBeDetermined is Content {
  return !!(toBeDetermined as Content);
}

export default class Adset implements Entity {
  public content: Content;

  constructor(private client: ODC, private adsetId: number) {}

  private async getContent(stage: ContentStage) {
    const { data } = await this.client.get(
      ApiType.LEGACY,
      `/adsets-2/${this.adsetId}/content-function?stage=${stage}`
    );

    return data;
  }

  async getOverview() {
    const { data: adset } = await this.client.get(
      ApiType.LEGACY,
      `/adsets-2/${this.adsetId}`
    );
    return adset;
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

  async syncContent(stage: ContentStage) {
    this.content = await this.getContent(stage);
  }

  async saveChanges(stage: ContentStage) {
    if (!hasCorrectContentFormat(this.content)) {
      throw new Error(
        "Cannot save Adset content, as the format of the content is incorrect."
      );
    }

    const formData = new FormData();
    formData.append("json", JSON.stringify(this.content));

    await this.client.put(
      ApiType.LEGACY,
      `/adsets-2/${this.adsetId}/content-function?stage=${stage}`,
      formData
    );
  }

  addContextRule(rule: ContextRule) {
    this.content.data.rules.push(rule);
  }

  removeContextRuleByPredicate(predicate: Predicate) {
    const index = this.content.data.rules.findIndex(
      (contextRule) =>
        JSON.stringify(contextRule.predicate) === JSON.stringify(predicate)
    );

    return this.content.data.rules.splice(index, 1);
  }

  addPlaceholder(placeholder: Placeholder) {
    this.content.data.placeholders.push(placeholder);
  }

  removePlaceholder(placeholder: Placeholder) {
    const index = this.content.data.placeholders.findIndex(
      (item) => item.name === placeholder.name && item.type === placeholder.type
    );

    this.content.data.placeholders.splice(index, 1);
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
