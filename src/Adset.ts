import FormData from "form-data";
import ODC, { ApiType } from "./ODCAuthClient";

interface ContextRule {
  assignments: Assignment[];
  predicate: Predicate;
}

interface Placeholder {
  type: "text" | "number" | "video" | "image";
  name: string;
}

interface Context {
  alias: "custom";
}

interface Content {
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

function hasCorrectContentFormat(
  toBeDetermined: any
): toBeDetermined is Content {
  return !!(toBeDetermined as Content);
}

export default class Adset {
  public content: Content;

  constructor(private client: ODC, private adsetId: number) {}

  private async getContent() {
    const { data } = await this.client.get(
      ApiType.LEGACY,
      `/adsets-2/${this.adsetId}/content-function?stage=draft`
    );

    return data;
  }

  async get() {
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

  async syncContent() {
    this.content = await this.getContent();
    return this.content;
  }

  async saveChanges() {
    if (!hasCorrectContentFormat(this.content)) {
      throw new Error(
        "Cannot save Adset content, as the format of the content is incorrect."
      );
    }

    const formData = new FormData();
    formData.append("json", JSON.stringify(this.content));

    const response = await this.client.put(
      ApiType.LEGACY,
      `/adsets-2/${this.adsetId}/content-function?stage=draft`,
      formData
    );

    return response;
  }

  addContextRule(rule: ContextRule) {
    this.content.data.rules.push(rule);
  }

  removeContextRule(rule: ContextRule) {
    const index = this.content.data.rules.findIndex(
      (contextRule) =>
        JSON.stringify(contextRule.predicate) === JSON.stringify(rule.predicate)
    );

    this.content.data.rules.splice(index, 1);
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
}
