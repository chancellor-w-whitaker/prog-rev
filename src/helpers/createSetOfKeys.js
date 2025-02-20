export const createSetOfKeys = (objects) =>
  new Set(
    [objects]
      .filter((element) => element)
      .flat()
      .map((row) => Object.keys(row))
      .flat()
  );
