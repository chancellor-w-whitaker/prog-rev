import { writeFile, utils } from "xlsx";

import { CSVTo2DArray } from "./CSVTo2DArray";

export const exportGridAsExcel = ({
  worksheetName = "Programs",
  fileName = "ProgramReview",
  gridRef,
}) => {
  const gridApi = gridRef.current.api;

  const { getDataAsCsv } = gridApi;

  const dataAsCsv = getDataAsCsv();

  const twoDimensionalArray = CSVTo2DArray(dataAsCsv);

  const worksheet = utils.json_to_sheet(twoDimensionalArray);

  const workbook = utils.book_new();

  utils.book_append_sheet(workbook, worksheet, worksheetName);

  writeFile(workbook, `${fileName}.xlsx`, { compression: true });
};
