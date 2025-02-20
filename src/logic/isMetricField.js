import { isFallEnrollmentField } from "./isFallEnrollmentField";
import { isDegreesField } from "./isDegreesField";
import { isRatioField } from "./isRatioField";
import { rankedFields } from "./rankedFields";

const isOtherField = (params) =>
  !isRatioField(params) &&
  !isFallEnrollmentField(params) &&
  !isDegreesField(params);

export const isMetricField = ({ field }) =>
  isOtherField({ field }) && !rankedFields.includes(field);
