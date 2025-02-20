import { shouldFixSocialWorkReviewType } from "./shouldFixSocialWorkReviewType";
import { sortProgramTitleAscByDefault } from "./sortProgramTitleAscByDefault";
import { correctSocialWorkReviewType } from "./correctSocialWorkReviewType";
import { formatPercentage } from "../helpers/formatPercentage";
import { shouldBePercentage } from "./shouldBePercentage";
import { getFieldShade } from "./getFieldShade";
import { pinnedField } from "./pinnedField";

const gridHelpers = {
  valueGetter: ({ colDef: { field }, data }) => {
    if (shouldFixSocialWorkReviewType({ field, data })) {
      return correctSocialWorkReviewType;
    }

    return data[field];
  },
  defaultSort: sortProgramTitleAscByDefault,
};

const { valueGetter, defaultSort } = gridHelpers;

export const initializeColumnDefs = (types) =>
  Object.entries(types).map(([field, type]) => ({
    valueFormatter: ({ value }) =>
      type === "number"
        ? shouldBePercentage(field)
          ? formatPercentage(value)
          : value.toLocaleString()
        : value,
    cellClass: ({ colDef }) =>
      [
        `bg-${getFieldShade(colDef)}-subtle`,
        type === "number" ? "text-end" : "text-start",
      ].join(" "),
    type: type === "number" ? "rightAligned" : null,
    headerClass: "center-ag-header-cell-label",
    pinned: field === pinnedField,
    sort: defaultSort(field),
    lockPosition: true,
    lockVisible: true,
    valueGetter,
    field,
  }));
