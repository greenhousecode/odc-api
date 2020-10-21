import ODC, { ApiType } from "./ODCAuthClient";

interface ContextRule {
  assignment: Assignment;
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
  if (toBeDetermined as Content) {
    return true;
  }
  return false;
}

export default class Adset {
  public content: Content;

  public synced;

  constructor(private client: ODC, private adsetId: number) {
    this.synced = this.sync();
  }

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

    await this.sync();
    return response;
  }

  async sync() {
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

  async addContextRule(rule: ContextRule) {}

  async removeContextRule(rule: ContextRule) {}

  async addPlaceholder(placeholder: Placeholder) {}

  async removePlaceholder(placeholder: Placeholder) {}
}
