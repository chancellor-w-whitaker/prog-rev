import "ag-grid-community/styles/ag-grid.css";
import { AgGridReact } from "ag-grid-react";
import { csv } from "d3-fetch"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid
import { useMemo } from "react";

import { isStringNumeric } from "./isNumeric";
import { usePromise } from "./usePromise";

const helpers = {
  headerValueGetter: ({ colDef: { field } }) => {
    if (field.startsWith("Fall 202")) return `${field} Enrollment`;

    if (field === "Metrics Met") return "Metrics Total";

    if (["20-21", "21-22", "22-23"].includes(field)) {
      return `${field} Degrees`;
    }

    return field;
  },
  valueGetter: ({ colDef: { field }, data }) => {
    if (field === "Review Type" && data["Program Title"] === "Social Work") {
      return "Expedited Review";
    }
    return data[field];
  },
  filterColumnDefs: ({ field }) =>
    !["Review Year", "Fall 2020", "1920"].includes(field),
  defaultSort: (field) => (field === "Program Title" ? "asc" : null),
  filterRowData: (row) => row["Program Title"] !== "Honors Program",
  leftAlignedNumericColumns: ["Program ID", "CIP"],
  promise: csv("data/Final.csv"),
  pinnedField: "Program Title",
};

const {
  leftAlignedNumericColumns,
  headerValueGetter,
  filterColumnDefs,
  filterRowData,
  pinnedField,
  valueGetter,
  defaultSort,
  promise,
} = helpers;

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

const replaceItem = (array, oldItem, newItem) => {
  const index = array.indexOf(oldItem);

  if (index !== -1) {
    return [...array.slice(0, index), newItem, ...array.slice(index + 1)];
  }
};

const isMetricColumn = (field) =>
  !isRatioColumn(field) && !fieldsRanked.includes(field);

const isRatioColumn = (field) =>
  field.toLowerCase().split(" ").includes("ratio") &&
  field.toLowerCase() !== "ratio";

const fieldsRanked = [
  "Program Title",
  "Degree Designation",
  "Review Type",
  "Metrics Met",
  "College",
  "Program ID",
  "EKU Program Code",
  "CIP",
  "Level",
  "METRIC COLUMNS",
  "Fall 2021",
  "Fall 2022",
  "Fall 2023",
  "Enrollment Avg % Change",
  "Enrollment Minimum",
  "20-21",
  "21-22",
  "22-23",
  "Degree Avg % Change",
  "Degree Minimum",
  "RATIO COLUMNS",
  "100% F2F",
  "100% Distance Learning",
  "F2F and Distance Learning",
];

function App() {
  const rowData = usePromise(promise);

  const rowDataCorrected = useMemo(
    () => parseNumericStrings(rowData).filter(filterRowData),
    [rowData]
  );

  const types = useMemo(
    () => getTypes(rowDataCorrected, customTypeEvaluator),
    [rowDataCorrected]
  );

  const columnDefs = useMemo(() => {
    const easyLeftAligned = new Set([
      "Program Title",
      "Degree Designation",
      "Review Type",
      "College",
      "Program ID",
      "EKU Program Code",
      "CIP",
      "Level",
    ]);

    const unsortedColumnDefs = Object.entries(types)
      .map(([field]) => ({
        type: !easyLeftAligned.has(field) ? "rightAligned" : null,
        pinned: field === pinnedField,
        sort: defaultSort(field),
        lockPosition: true,
        lockVisible: true,
        headerValueGetter,
        valueGetter,
        field,
      }))
      .filter(filterColumnDefs);

    const ratioColumns = unsortedColumnDefs
      .filter(({ field }) => isRatioColumn(field))
      .map(({ field }) => field);

    const metricColumns = unsortedColumnDefs
      .filter(({ field }) => isMetricColumn(field))
      .map(({ field }) => field);

    const includesRatioColumns = replaceItem(
      fieldsRanked,
      "RATIO COLUMNS",
      ratioColumns
    );

    const includesMetricColumns = replaceItem(
      includesRatioColumns,
      "METRIC COLUMNS",
      metricColumns
    );

    const fieldsReranked = includesMetricColumns.flat();

    const evaluateFieldRank = (field) =>
      fieldsReranked.includes(field)
        ? fieldsReranked.indexOf(field)
        : Number.MAX_SAFE_INTEGER;

    const sortColumnDefs = ({ field: fieldA }, { field: fieldB }) =>
      evaluateFieldRank(fieldA) - evaluateFieldRank(fieldB);

    return unsortedColumnDefs.sort(sortColumnDefs);
  }, [types]);

  const autoSizeStrategy = { type: "fitCellContents" };

  const onBodyScrollEnd = (e) => e.api.autoSizeAllColumns();

  return (
    <>
      <h1 className="display-4">Program Review 2024-2025</h1>
      <div
        className="ag-theme-quartz" // applying the Data Grid theme
        style={{ height: 500 }} // the Data Grid will fill the size of the parent container
      >
        <AgGridReact
          autoSizeStrategy={autoSizeStrategy}
          onBodyScrollEnd={onBodyScrollEnd}
          rowData={rowDataCorrected}
          columnDefs={columnDefs}
        />
      </div>
    </>
  );
}

export default App;
