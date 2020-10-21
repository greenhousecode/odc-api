const create = (expression: string) => {
  const [selector, value] = expression.split("=").map((item) => item.trim());
  return ["=", `\${custom.${selector}}`, value] as Predicate;
};

const toHumanReadable = (predicate: Predicate) => {
  return typeof predicate === "boolean"
    ? `${predicate}`
    : `${predicate[1].replace("${custom.", "").replace("}", "")} ${
        predicate[0]
      } ${predicate[2]}`;
};

export default {
  create,
  toHumanReadable,
};
