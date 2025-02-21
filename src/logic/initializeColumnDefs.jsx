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

const spaceWidth = 8;

const cellPadding = 50;

const fieldMaxWidth = 200;

export const initializeColumnDefs = (types, widths) =>
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
    width:
      widths && widths[field] ? Math.ceil(widths[field]) + cellPadding : null,
    type: type === "number" ? "rightAligned" : null,
    headerClass: "center-ag-header-cell-label",
    pinned: field === pinnedField,
    sort: defaultSort(field),
    lockPosition: true,
    lockVisible: true,
    valueGetter,
    field,
  }));

const getWidth = (x) => x * spaceWidth + cellPadding;

const reduceMarginally = (one, two) => {
  const times = Math.floor(one / two);

  const result = two * times;

  let iterator = result;
  let best;

  while (!best) {
    const iterated = iterator - 1;

    if (
      iterated > Math.ceil(one / 1.5) &&
      getWidth(iterated) > getWidth(Math.ceil(one / 1.5)) &&
      iterated > two
    ) {
      iterator = iterated;
    } else {
      best = iterator;
    }
  }

  return best;
};
