import { useState, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";

import { parseNumericStrings } from "./functions/parseNumericStrings";
import { exportGridAsExcel } from "./functions/exportGridAsExcel";
import { autoSizeStrategy } from "./constants/autoSizeStrategy";
import { onBodyScrollEnd } from "./functions/onBodyScrollEnd";
import { sortByKeyOrder } from "./functions/sortByKeyOrder";
import { transformData } from "./evan/transformData";
import { getTypes } from "./functions/getTypes";
import { usePromise } from "./usePromise";
import { Wrapper } from "./Wrapper";

// ratios displayed as percentages
// column shading
const rankedFields = [
  "Program Title",
  "Degree Designation",
  "Review Type",
  "Metrics Met",
  "College",
  "Program ID",
  // "EKU Program Code",
  "CIP",
  "Level",
  // "METRIC COLUMNS",
  // "Fall 2021 Enrollment",
  // "Fall 2022 Enrollment",
  // "Fall 2023 Enrollment",
  "Enrollment Avg % Change",
  "Enrollment Minimum",
  // "20-21 Degrees",
  // "21-22 Degrees",
  // "22-23 Degrees",
  "Degree Avg % Change",
  "Degree Minimum",
  // "RATIO COLUMNS",
  "100% F2F",
  "100% Distance Learning",
  "F2F & Distance Learning",
];

const leftAlignedNumericColumns = ["Program ID", "CIP"];

const correctSocialWorkReviewType = "Expedited Review";

const pinnedField = "Program Title";

const sortProgramTitleAscByDefault = (field) =>
  field === "Program Title" ? "asc" : null;

const shouldFixSocialWorkReviewType = ({ field, data }) =>
  field === "Review Type" && data["Program Title"] === "Social Work";

const filterByHonorsProgram = (row) =>
  row["Program Title"] !== "Honors Program";

const evaluateValueType = (value, field) => {
  if (typeof value === "string" && value.includes("%")) {
    return "number";
  }

  return typeof value;
};

const helpers = {
  valueGetter: ({ colDef: { field }, data }) => {
    if (shouldFixSocialWorkReviewType({ field, data })) {
      return correctSocialWorkReviewType;
    }

    return data[field];
  },
  defaultSort: sortProgramTitleAscByDefault,
  filterRowData: filterByHonorsProgram,
};

const { filterRowData, valueGetter, defaultSort } = helpers;

const initializeColumnDefs = (types) =>
  Object.entries(types).map(([field, type]) => ({
    valueFormatter: ({ value }) =>
      type === "number" ? value.toLocaleString() : value,
    type: type === "number" ? "rightAligned" : null,
    pinned: field === pinnedField,
    sort: defaultSort(field),
    lockPosition: true,
    lockVisible: true,
    valueGetter,
    field,
  }));

const url = "data/data.json";

const promise = fetch(url).then((response) => response.json());

const insertAfter = (array, element1, element2) => {
  const arr = [...array];

  arr.splice(array.indexOf(element1) + 1, 0, element2);

  return arr;
};

// search box
export default function App() {
  const gridRef = useRef();

  const data = usePromise(promise);

  const rowData = useMemo(
    () => (data ? transformData(data.Data, data.Labels) : []),
    [data]
  );

  const rowDataCorrected = useMemo(
    () =>
      parseNumericStrings(rowData, leftAlignedNumericColumns).filter(
        filterRowData
      ),
    [rowData]
  );

  const types = useMemo(
    () => getTypes(rowDataCorrected, evaluateValueType),
    [rowDataCorrected]
  );

  const columnDefs = useMemo(() => initializeColumnDefs(types), [types]);

  const sortedColumnDefs = useMemo(() => {
    const ratioFields = columnDefs
      .filter(({ field }) => field.toLowerCase().split(" ").includes("ratio"))
      .map(({ field }) => field);

    const fallEnrollmentFields = columnDefs
      .filter(({ field }) => {
        const words = new Set(field.toLowerCase().split(" "));

        return (
          words.has("fall") && words.has("enrollment") && !words.has("degrees")
        );
      })
      .map(({ field }) => field);

    const degreesFields = columnDefs
      .filter(({ field }) => {
        const words = new Set(field.toLowerCase().split(" "));

        return (
          !words.has("fall") && !words.has("enrollment") && words.has("degrees")
        );
      })
      .map(({ field }) => field);

    const specialFieldsSet = new Set(
      [ratioFields, fallEnrollmentFields, degreesFields].flat()
    );

    const otherFields = columnDefs
      .filter(({ field }) => !specialFieldsSet.has(field))
      .map(({ field }) => field);

    const metricFields = columnDefs
      .filter(
        ({ field }) =>
          otherFields.includes(field) && !rankedFields.includes(field)
      )
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
  }, [columnDefs]);

  // const params = [
  //   {
  //     insert: [metricFields, fallEnrollmentFields].flat(),
  //     between: ["Level", "Enrollment Avg % Change"],
  //   },
  //   {
  //     between: ["Enrollment Minimum", "Degree Avg % Change"],
  //     insert: degreesFields,
  //   },
  //   { between: ["Degree Minimum", "100% F2F"], insert: ratioFields },
  // ];

  const [searchValue, setSearchValue] = useState("");

  return (
    <Wrapper
      toolbar={
        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn btn-success bg-gradient shadow-sm"
            onClick={() => exportGridAsExcel({ gridRef })}
            type="button"
          >
            ​
            <svg
              className="bi bi-file-earmark-arrow-down-fill"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 16 16"
              height={16}
              width={16}
            >
              <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1m-1 4v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 11.293V7.5a.5.5 0 0 1 1 0" />
            </svg>
          </button>
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Type to search..."
            className="form-control"
            value={searchValue}
          />
        </div>
      }
      heading="Program Review 2024-2025"
    >
      <div className="ag-theme-quartz" style={{ height: 500 }}>
        <AgGridReact
          autoSizeStrategy={autoSizeStrategy}
          onBodyScrollEnd={onBodyScrollEnd}
          quickFilterText={searchValue}
          columnDefs={sortedColumnDefs}
          rowData={rowDataCorrected}
          ref={gridRef}
        />
      </div>
    </Wrapper>
  );
}
