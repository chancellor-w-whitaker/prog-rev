import { enrollmentFields } from "./enrollmentFields";
import { primaryFields } from "./primaryFields";
import { degreeFields } from "./degreeFields";
import { infoFields } from "./infoFields";

export const rankedFields = [
  // shade bg-primary-subtle
  ...primaryFields,
  // shade bg-secondary-subtle
  // "METRIC COLUMNS",
  // shade bg-success-subtle
  // "Fall 2021 Enrollment",
  // "Fall 2022 Enrollment",
  // "Fall 2023 Enrollment",
  ...enrollmentFields,
  // shade bg-danger-subtle
  // "20-21 Degrees",
  // "21-22 Degrees",
  // "22-23 Degrees",
  ...degreeFields,
  // shade bg-warning-subtle
  // "RATIO COLUMNS",
  // shade bg-info-subtle
  ...infoFields,
];
