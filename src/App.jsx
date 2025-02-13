import "ag-grid-community/styles/ag-grid.css";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useMemo, useRef } from "react";

import { parseNumericStrings } from "./functions/parseNumericStrings";
import { getTypes } from "./functions/getTypes";
import { exportGridAsExcel } from "./functions/exportGridAsExcel";
import { onBodyScrollEnd } from "./functions/onBodyScrollEnd";
import { autoSizeStrategy } from "./constants/autoSizeStrategy";
import { transformData } from "./evan/transformData";
import { usePromise } from "./usePromise";

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

  if (leftAlignedNumericColumns.includes(field)) {
    return "string";
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
    type: type === "number" ? "rightAligned" : null,
    pinned: field === pinnedField,
    sort: defaultSort(field),
    lockPosition: true,
    lockVisible: true,
    valueFormatter: ({ value }) =>
      type === "number" ? value.toLocaleString() : value,
    valueGetter,
    field,
  }));

const url = "data/data.json";

const promise = fetch(url).then((response) => response.json());

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

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex gap-3 align-items-center">
        <div className="display-4 lh-1">Program Review 2024-2025</div>
        <button
          className="btn btn-success bg-gradient shadow-sm fs-3 d-flex align-items-center"
          onClick={() => exportGridAsExcel({ gridRef })}
          type="button"
        >
          ​
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            fill="currentColor"
            className="bi bi-file-earmark-arrow-down-fill"
            viewBox="0 0 16 16"
          >
            <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1m-1 4v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 11.293V7.5a.5.5 0 0 1 1 0" />
          </svg>
        </button>
      </div>
      <div className="ag-theme-quartz" style={{ height: 500 }}>
        <AgGridReact
          autoSizeStrategy={autoSizeStrategy}
          onBodyScrollEnd={onBodyScrollEnd}
          rowData={rowDataCorrected}
          columnDefs={columnDefs}
          ref={gridRef}
        />
      </div>
    </div>
  );
}
