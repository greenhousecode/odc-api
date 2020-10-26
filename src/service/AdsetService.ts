import ODC from "../ODCAuthClient";

import Adset, { ContextRule, Content } from "../entities/Adset";

export default class AdsetService {
  public content: Content;

  constructor(private client: ODC) {}

  addContextRule(adsetId: number, rule: ContextRule) {
    return this.addContextRules(adsetId, [rule]);
  }

  async addContextRules(
    adsetId: number,
    rules: ContextRule[],
    stage: ContentStage = "draft"
  ) {
    const adset = new Adset(this.client, adsetId);
    await adset.syncContent(stage);
    rules.forEach((rule) => adset.addContextRule(rule));
    await adset.saveChanges();
  }

  removeContextRuleByPredicate(adsetId: number, predicate: Predicate) {
    return this.removeContextRulesByPredicates(adsetId, [predicate]);
  }

  async removeContextRulesByPredicates(
    adsetId: number,
    predicates: Predicate[]
  ) {
    const adset = new Adset(this.client, adsetId);
    await adset.syncContent();

    predicates.forEach((predicate) =>
      adset.removeContextRuleByPredicate(predicate)
    );

    await adset.saveChanges();
  }
}
