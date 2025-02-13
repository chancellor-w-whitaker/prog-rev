export const sortByKeyOrder = (array, order, field = "field") => {
  const evaluateFieldRank = (field) =>
    order.includes(field) ? order.indexOf(field) : Number.MAX_SAFE_INTEGER;

  const sortFn = ({ [field]: fieldA }, { [field]: fieldB }) =>
    evaluateFieldRank(fieldA) - evaluateFieldRank(fieldB);

  return array.sort(sortFn);
};
