export const getTypes = (rowData, typeEvaluator = (value) => typeof value) => {
  const types = {};

  (Array.isArray(rowData) ? rowData : []).forEach((row) => {
    Object.entries(row).forEach(([field, value]) => {
      if (!(field in types)) types[field] = {};

      const object = types[field];

      const type = typeEvaluator(value, field);

      if (!(type in object)) object[type] = 0;

      object[type]++;
    });
  });

  return Object.fromEntries(
    Object.entries(types).map(([field, object]) => [
      field,
      Object.keys(object).sort(
        (typeA, typeB) => object[typeB] - object[typeA]
      )[0],
    ])
  );
};
