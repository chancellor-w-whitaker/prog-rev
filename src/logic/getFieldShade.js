import { isFallEnrollmentField } from "./isFallEnrollmentField";
import { enrollmentFields } from "./enrollmentFields";
import { isDegreesField } from "./isDegreesField";
import { isMetricField } from "./isMetricField";
import { primaryFields } from "./primaryFields";
import { degreeFields } from "./degreeFields";
import { isRatioField } from "./isRatioField";
import { infoFields } from "./infoFields";

const isPrimaryField = ({ field }) => primaryFields.includes(field);

const isEnrollmentField = ({ field }) => enrollmentFields.includes(field);

const isDegreeField = ({ field }) => degreeFields.includes(field);

const isInfoField = ({ field }) => infoFields.includes(field);

const isSecondaryField = isMetricField;

const isSuccessField = (params) =>
  isFallEnrollmentField(params) || isEnrollmentField(params);

const isDangerField = (params) =>
  isDegreesField(params) || isDegreeField(params);

const isWarningField = isRatioField;

export const getFieldShade = (params) => {
  const shades = ["light", "primary", "success", "danger", "warning", "info"];

  const results = [
    isPrimaryField,
    isSecondaryField,
    isSuccessField,
    isDangerField,
    isWarningField,
    isInfoField,
  ].map((method) => method(params));

  return shades[results.findIndex((value) => value)];
};
