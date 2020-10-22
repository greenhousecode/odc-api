import ODC from "../ODCAuthClient";

import Adset, { ContextRule, Content } from "../entities/Adset";

export default class AdsetService {
  public content: Content;

  constructor(private client: ODC) {}

  addContextRule(adsetId: number, rule: ContextRule) {
    return this.addContextRules(adsetId, [rule]);
  }

  async addContextRules(adsetId: number, rules: ContextRule[]) {
    const adset = new Adset(this.client, adsetId);
    await adset.syncContent();
    rules.forEach((rule) => adset.addContextRule(rule));
    await adset.saveChanges();
  }

  removeContextRuleByPredicate(adsetId: number, predicate: Predicate) {
    const index = this.content.data.rules.findIndex(
      (contextRule) =>
        JSON.stringify(contextRule.predicate) === JSON.stringify(predicate)
    );

    return this.content.data.rules.splice(index, 1);
  }

  removeContextRulesByPredicates(adsetId: number, predicates: Predicate[]) {}
}
