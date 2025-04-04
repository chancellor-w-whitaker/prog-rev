export const isRatioField = ({ field }) =>
  field.toLowerCase().split(" ").includes("ratio") &&
  !field.toLowerCase().split(" ").includes("met");
