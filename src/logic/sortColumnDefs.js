import { isFallEnrollmentField } from "./isFallEnrollmentField";
import { sortByKeyOrder } from "../helpers/sortByKeyOrder";
import { isStringNumeric } from "../helpers/isNumeric";
import { insertAfter } from "../helpers/insertAfter";
import { isDegreesField } from "./isDegreesField";
import { isMetricField } from "./isMetricField";
import { isRatioField } from "./isRatioField";
import { rankedFields } from "./rankedFields";

const turnStringNumeric = (string) => {
  const string1 = string
    .split("")
    .filter((char) => isStringNumeric(char))
    .join("");

  return isStringNumeric(string1) ? Number(string1) : Number.MAX_SAFE_INTEGER;
};

const sortStringsNumerically = (a, b) =>
  turnStringNumeric(a) - turnStringNumeric(b);

export const sortColumnDefs = (columnDefs) => {
  const ratioFields = columnDefs
    .filter(isRatioField)
    .map(({ field }) => field)
    .sort(sortStringsNumerically);

  const fallEnrollmentFields = columnDefs
    .filter(isFallEnrollmentField)
    .map(({ field }) => field)
    .sort(sortStringsNumerically);

  const degreesFields = columnDefs
    .filter(isDegreesField)
    .map(({ field }) => field)
    .sort(sortStringsNumerically);

  const metricFields = columnDefs
    .filter(isMetricField)
    .map(({ field }) => field);

  const modifiedArray1 = insertAfter(
    rankedFields,
    "Level",
    [metricFields, fallEnrollmentFields].flat()
  );

  const modifiedArray2 = insertAfter(
    modifiedArray1,
    "Enrollment Minimum",
    degreesFields
  );

  const modifiedArray3 = insertAfter(
    modifiedArray2,
    "Degree Minimum",
    ratioFields
  );

  const order = modifiedArray3.flat();

  return sortByKeyOrder(columnDefs, order);
};
