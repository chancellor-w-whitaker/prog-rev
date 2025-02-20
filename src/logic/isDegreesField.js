export const isDegreesField = ({ field }) => {
  const words = new Set(field.toLowerCase().split(" "));

  return !words.has("fall") && !words.has("enrollment") && words.has("degrees");
};
