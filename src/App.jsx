import { useCallback, useState, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";

import { initializeColumnDefs } from "./logic/initializeColumnDefs.jsx";
import { collegeAbbreviations } from "./logic/collegeAbbreviations.js";
import { filterByHonorsProgram } from "./logic/filterByHonorsProgram";
import { exportGridAsExcel } from "./helpers/exportGridAsExcel";
import { useUserIsActive } from "./hooks/useUserIsActive.jsx";
import { MeasuredCell } from "./components/MeasuredCell.jsx";
import { sortColumnDefs } from "./logic/sortColumnDefs";
import { usePolling } from "./hooks/usePolling.jsx";
import { usePrevious } from "./hooks/usePrevious";
import { transformData } from "./transformData";
import { getTypes } from "./helpers/getTypes";
import { useData } from "./hooks/useData.jsx";

const reviewTypeKey = "Review Type";

const collegeKey = "College";

const getEvery = (key, rows) => {
  return [...new Set(rows.map(({ [key]: value }) => value))];
};

const evaluateValueType = (value) => {
  if (typeof value === "string" && value.includes("%")) {
    return "number";
  }

  return typeof value;
};

// render words (don't render in grid, render somewhere offscreen)
// would there still be performance concerns with large data?
// O(N^2) (10,000 rows of 10 values each)
// measure words
// set column widths based on longest measured word

const processRowData = (rows) =>
  [...rows].filter(filterByHonorsProgram).map((row) =>
    Object.fromEntries([
      ...Object.entries(row).map((entry) =>
        entry[0] === "College"
          ? [entry[0], collegeAbbreviations[entry[1]]]
          : entry
      ),
      ...[
        ["Review Year", null],
        ["Review Complete", null],
        ["Final Recommendation", null],
      ].filter(([key]) => !(key in row)),
    ])
  );

const fetchData = async () => {
  const response = await axios.get(
    `https://irserver2.eku.edu/Apps/DataPage/PROD/ProgramReviewAll/data/data.json`
  );
  return response.data;
};

// check for user inactive (mouse hasn't moved in 5 minutes)

const sessionUrl =
  "https://irserver2.eku.edu/Apps/DataPage/PROD/session_reports";

export default function App(resources) {
  const session = useData(sessionUrl);

  console.log(session);

  const userIsActive = useUserIsActive();

  const primaryKey = "Program ID";

  const readOnlyEdit = true;

  const getRowId = (params) => String(params.data[primaryKey]);

  const { loading, refetch, data } = usePolling(fetchData, 5000, userIsActive);

  const complementaryPrimaryKey =
    data &&
    Object.entries(data.Labels).filter(
      ([key, value]) => value === primaryKey
    )[0][0];

  const handleUpdateRecord = async (params) => {
    await axios.post(
      `https://irserver2.eku.edu/Apps/DataPage/PROD/ProgramReviewAll/write_json`,
      params
    );

    refetch();
  };

  const onCellEditRequest = (event) => {
    const rowId = getRowId(event);

    const newEntry = [event.colDef.field, event.value];

    const originalRecord = data.Data.find(
      (row) => row[complementaryPrimaryKey] === rowId
    );

    const newRecord = Object.fromEntries([
      ...Object.entries(originalRecord),
      newEntry,
    ]);

    const writeBack = {
      Data: data.Data.map((row) =>
        row[complementaryPrimaryKey] === rowId ? newRecord : row
      ),
      Labels: Object.fromEntries(Object.entries(data.Labels)),
    };

    // console.log(
    //   writeBack.Data.find((row) => row[complementaryPrimaryKey] === rowId)
    // );

    handleUpdateRecord(writeBack);
  };

  const editable = true;

  const { useDropdown, Dropdown, Wrapper } = resources;

  const gridRef = useRef();

  const rowData = useMemo(
    () => processRowData(data ? transformData(data.Data, data.Labels) : []),
    [data]
  );

  const distinctValues = useMemo(() => {
    const store = {};

    rowData.forEach((row) =>
      Object.keys(row).forEach((key) => {
        if (!(key in store)) store[key] = new Set([key]);

        store[key].add(row[key]);
      })
    );

    return store;
  }, [rowData]);

  const allColleges = useMemo(() => getEvery(collegeKey, rowData), [rowData]);

  const allReviewTypes = useMemo(
    () => getEvery(reviewTypeKey, rowData),
    [rowData]
  );

  const types = useMemo(() => getTypes(rowData, evaluateValueType), [rowData]);

  // store max value width & field width so you can compute wrapping measurement
  const [columnWidths, setColumnWidths] = useState();

  const initialColumnWidths = useMemo(
    () => Object.fromEntries(Object.keys(types).map((key) => [key, 0])),
    [types]
  );

  const updateColumnWidths = useCallback(
    ({ field, width }) =>
      setColumnWidths((colWidths) =>
        width > colWidths[field]
          ? Object.fromEntries(
              Object.entries(colWidths).map((entry) =>
                entry[0] === field ? [field, width] : entry
              )
            )
          : colWidths
      ),
    []
  );

  usePrevious(types, () => setColumnWidths(initialColumnWidths));

  const columnDefs = useMemo(
    () =>
      initializeColumnDefs({
        columnWidths,
        types,
      }).map((col) => (editable ? col : { ...col, editable: false })),
    [types, columnWidths, editable]
  );

  const sortedColumnDefs = useMemo(
    () => sortColumnDefs(columnDefs),
    [columnDefs]
  );

  const [searchValue, setSearchValue] = useState("");

  const searchBox = (
    <input
      onChange={(e) => setSearchValue(e.target.value)}
      placeholder="Type to search..."
      className="form-control"
      value={searchValue}
    />
  );

  const downloadButton = (
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
  );

  const colleges = useDropdown({
    options: allColleges,
    label: collegeKey,
    multiple: true,
  });

  const reviewTypes = useDropdown({
    options: allReviewTypes,
    label: reviewTypeKey,
    multiple: true,
  });

  const filteredRowData = useMemo(() => {
    return rowData.filter((row) => {
      const college = row[collegeKey];

      const reviewType = row[reviewTypeKey];

      return (
        colleges.selected.has(college) && reviewTypes.selected.has(reviewType)
      );
    });
  }, [rowData, colleges, reviewTypes]);

  return (
    <Wrapper
      toolbar={
        <div className="d-flex gap-2 justify-content-end text-nowrap">
          <Dropdown {...colleges}></Dropdown>
          <Dropdown {...reviewTypes}></Dropdown>
          {searchBox}
          {downloadButton}
        </div>
      }
      heading="Program Review 2024 - 2029"
    >
      <div className="ag-theme-quartz" style={{ height: 500 }}>
        <AgGridReact
          defaultColDef={
            {
              // autoHeaderHeight: true, // Adjust Cell Height to Fit Wrapped Text
              // wrapHeaderText: true, // Wrap Text
              // initialWidth: 200, // Optional: Set a default size
              // resizable: true, // Enable resizing
            }
          }
          onCellEditRequest={onCellEditRequest}
          onCellEditingStarted={refetch}
          quickFilterText={searchValue}
          columnDefs={sortedColumnDefs}
          readOnlyEdit={readOnlyEdit}
          rowData={filteredRowData}
          className="fs-6 poppins"
          getRowId={getRowId}
          loading={loading}
          ref={gridRef}
        />
      </div>
      <div className="position-fixed pe-none opacity-0">
        {Object.keys(distinctValues).map((field) => (
          <MeasuredCell
            updateColumnWidths={updateColumnWidths}
            key={`${field}`}
            field={field}
          >
            {`${field}`}
          </MeasuredCell>
        ))}
        {Object.entries(distinctValues).map(([field, set]) =>
          [...set].map((value) => (
            <MeasuredCell
              updateColumnWidths={updateColumnWidths}
              key={`${field}-${value}`}
              field={field}
            >
              {`${value}`}
            </MeasuredCell>
          ))
        )}
      </div>
    </Wrapper>
  );
}
