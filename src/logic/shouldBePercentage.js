export const shouldBePercentage = (field) =>
  (field.toLocaleLowerCase().split(" ").includes("%") ||
    field.toLocaleLowerCase().split(" ").includes("ratio")) &&
  !field.toLocaleLowerCase().split(" ").includes("met");
