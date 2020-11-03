const create = (
  field: string,
  operator: '=',
  value: string,
  source = 'custom'
) => [operator, `\${${source}.${field}}`, value] as Predicate;

const toHumanReadable = (predicate: Predicate) =>
  typeof predicate === 'boolean'
    ? `${predicate}`
    : `${predicate[1].replace(/\${\w+\./, '').replace('}', '')} ${
        predicate[0]
      } ${predicate[2]}`;

export default {
  create,
  toHumanReadable,
};
