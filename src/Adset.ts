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

interface Content {
  id?: string;
  meta: {
    "advertiser-id": number;
    schema: string;
  };
  data: {
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

  private async updateContent(content: Content) {
    const formData = new FormData();
    formData.append("json", JSON.stringify(content));

    const response = this.client.put(
      ApiType.LEGACY,
      `/adsets-2/${this.adsetId}/content-function?stage=draft`,
      formData
    );

    return response;
  }

  async syncFromODC() {
    this.content = await this.getContent();
  }

  async save() {
    if (!hasCorrectContentFormat(this.content)) {
      throw new Error(
        "Cannot update Adset content, as the format of the content is incorrect."
      );
    }

    return this.updateContent(this.content);
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
