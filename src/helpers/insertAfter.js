export const insertAfter = (array, element1, element2) => {
  const arr = [...array];

  arr.splice(array.indexOf(element1) + 1, 0, element2);

  return arr;
};
