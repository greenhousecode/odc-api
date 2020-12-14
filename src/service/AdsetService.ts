import ODC from '../ODCAuthClient';

import Adset, {
  ContextRule,
  Placeholder,
  Content,
  ContentStage,
} from '../entities/Adset';

export default class AdsetService {
  public content: Content;

  constructor(private client: ODC) {}

  addContextRule(
    adsetId: number,
    rule: ContextRule,
    stage: ContentStage = 'draft'
  ) {
    return this.addContextRules(adsetId, [rule], stage);
  }

  async addContextRules(
    adsetId: number,
    rules: ContextRule[],
    stage: ContentStage = 'draft'
  ) {
    const adset = new Adset(this.client, adsetId);
    await adset.syncContent(stage);
    rules.forEach((rule) => adset.addContextRule(rule));
    await adset.saveChanges(stage);
  }

  removeContextRuleByPredicate(
    adsetId: number,
    predicate: Predicate,
    stage: ContentStage = 'draft'
  ) {
    return this.removeContextRulesByPredicates(adsetId, [predicate], stage);
  }

  async removeContextRulesByPredicates(
    adsetId: number,
    predicates: Predicate[],
    stage: ContentStage = 'draft'
  ) {
    const adset = new Adset(this.client, adsetId);
    await adset.syncContent(stage);

    predicates.forEach((predicate) =>
      adset.removeContextRuleByPredicate(predicate)
    );

    await adset.saveChanges(stage);
  }

  addPlaceholder(
    adsetId: number,
    placeholder: Placeholder,
    stage: ContentStage = 'draft'
  ) {
    return this.addPlaceholders(adsetId, [placeholder], stage);
  }

  async addPlaceholders(
    adsetId: number,
    placeholders: Placeholder[],
    stage: ContentStage = 'draft'
  ) {
    const adset = new Adset(this.client, adsetId);
    await adset.syncContent(stage);
    placeholders.forEach((placeholder) => adset.addPlaceholder(placeholder));
    await adset.saveChanges(stage);
  }
}
