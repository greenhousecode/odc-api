import ODC from "./ODCAuthClient";

type Predicate = true | ["=", string, string];

interface Assignment {
  expr: string;
  name: string;
}

interface Rule {
  assignment: Assignment;
  predicate: Predicate;
}

interface ContentSettings {
  id?: string;
  rules: Rule[];
}

export default class Adset {
  constructor(private client: ODC, private adsetId: number) {}

  async getContent() {
    return this.client.get(
      `/adsets-2/${this.adsetId}/content-function?stage=draft`
    );
  }

  async updateContent(content: ContentSettings) {
    const response = await this.getContent();
    console.log(response);

    // const { data, meta } = response;
    // const formData = new FormData();

    // formData.append(
    //   "json",
    //   JSON.stringify({
    //     meta,
    //     data: {
    //       rules: settings.rules,
    //       context: [{ alias: "custom" }],
    //       placeholders: data.placeholders
    //     }
    //   })
    // );

    // return this.client.put(
    //   `/adsets-2/${adsetId}/content-function?stage=draft`,
    //   formData
    // );
  }
}
