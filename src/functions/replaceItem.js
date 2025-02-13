export const replaceItem = (array, oldItem, newItem) => {
  const index = array.indexOf(oldItem);

  if (index !== -1) {
    return [...array.slice(0, index), newItem, ...array.slice(index + 1)];
  }
};
