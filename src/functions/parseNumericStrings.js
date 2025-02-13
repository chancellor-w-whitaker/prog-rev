import { isStringNumeric } from "./isNumeric";
import { stringToNumber } from "./stringToNumber";

export const parseNumericStrings = (rowData, exceptions = []) =>
  (Array.isArray(rowData) ? rowData : []).map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        isStringNumeric(value) && !exceptions.includes(key)
          ? stringToNumber(value)
          : value,
      ])
    )
  );
