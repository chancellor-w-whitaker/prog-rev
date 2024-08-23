import "ag-grid-community/styles/ag-grid.css";
import { AgGridReact } from "ag-grid-react";
import { csv } from "d3-fetch"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid
import { useMemo } from "react";

import { isStringNumeric } from "./isNumeric";
import { usePromise } from "./usePromise";

const helpers = {
  filterColumnDefs: ({ field }) => !["Fall 2020", "1920"].includes(field),
  leftAlignedNumericColumns: ["Program ID", "CIP"],
  promise: csv("data/Final.csv"),
  pinnedField: "Program Title",
};

const { leftAlignedNumericColumns, filterColumnDefs, pinnedField, promise } =
  helpers;

/*
- if number (not program id || cip) || percentage,
- type is rightAligned

- sort review type, metrics met, -> rest

- let bethany know we can make any data changes

- make sure you fix vite config

- add notes/link to "on off dashboard" asana task
*/

const stringToNumber = (string = "") => Number(string);

const parseNumericStrings = (rowData) =>
  (Array.isArray(rowData) ? rowData : []).map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        isStringNumeric(value) ? stringToNumber(value) : value,
      ])
    )
  );

const customTypeEvaluator = (value, field) => {
  if (typeof value === "string" && value.includes("%")) {
    return "number";
  }

  if (leftAlignedNumericColumns.includes(field)) {
    return "string";
  }

  return typeof value;
};

const getTypes = (rowData, typeEvaluator = (value) => typeof value) => {
  const types = {};

  (Array.isArray(rowData) ? rowData : []).forEach((row) => {
    Object.entries(row).forEach(([field, value]) => {
      if (!(field in types)) types[field] = {};

      const object = types[field];

      const type = typeEvaluator(value, field);

      if (!(type in object)) object[type] = 0;

      object[type]++;
    });
  });

  return Object.fromEntries(
    Object.entries(types).map(([field, object]) => [
      field,
      Object.keys(object).sort(
        (typeA, typeB) => object[typeB] - object[typeA]
      )[0],
    ])
  );
};

const fieldsRanked = ["Program Title", "Review Type", "Metrics Met"];

const evaluateFieldRank = (field) =>
  fieldsRanked.includes(field)
    ? fieldsRanked.indexOf(field)
    : Number.MAX_SAFE_INTEGER;

const sortColumnDefs = ({ field: fieldA }, { field: fieldB }) =>
  evaluateFieldRank(fieldA) - evaluateFieldRank(fieldB);

function App() {
  const rowData = usePromise(promise);

  const rowDataCorrected = useMemo(
    () => parseNumericStrings(rowData),
    [rowData]
  );

  const types = useMemo(
    () => getTypes(rowDataCorrected, customTypeEvaluator),
    [rowDataCorrected]
  );

  const columnDefs = useMemo(
    () =>
      Object.entries(types)
        .map(([field, type]) => ({
          type: type === "number" ? "rightAligned" : null,
          lockPosition: field === pinnedField,
          pinned: field === pinnedField,
          lockVisible: true,
          field,
        }))
        .filter(filterColumnDefs)
        .sort(sortColumnDefs),
    [types]
  );

  const autoSizeStrategy = { type: "fitCellContents" };

  const onBodyScrollEnd = (e) => e.api.autoSizeAllColumns();

  return (
    <>
      <h1 className="display-4">Program Review</h1>
      <div
        className="ag-theme-quartz" // applying the Data Grid theme
        style={{ height: 500 }} // the Data Grid will fill the size of the parent container
      >
        <AgGridReact
          autoSizeStrategy={autoSizeStrategy}
          onBodyScrollEnd={onBodyScrollEnd}
          columnDefs={columnDefs}
          rowData={rowData}
        />
      </div>
    </>
  );
}

export default App;
