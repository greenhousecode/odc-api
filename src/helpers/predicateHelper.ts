const create = (expression: string) => {
  const parts = expression.split("=");
  return [`\${custom.${parts[1]}}`, parts[0], parts[2]] as Predicate;
};

const toHumanReadable = (predicate: Predicate) => {
  return typeof predicate === "boolean"
    ? `${predicate}`
    : `${predicate[1]} ${predicate[0]} ${predicate[2]}`;
};

export default {
  create,
  toHumanReadable,
};
