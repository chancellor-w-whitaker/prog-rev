import {
  useDeferredValue,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
  memo,
} from "react";
import { AgGridReact } from "ag-grid-react";

import { initializeColumnDefs } from "./logic/initializeColumnDefs.jsx";
import { useElementDimensions } from "./hooks/useElementDimensions.jsx";
import { filterByHonorsProgram } from "./logic/filterByHonorsProgram";
import { exportGridAsExcel } from "./helpers/exportGridAsExcel";
import { sortColumnDefs } from "./logic/sortColumnDefs";
import { usePrevious } from "./hooks/usePrevious";
import { transformData } from "./transformData";
import { usePromise } from "./hooks/usePromise";
import { getTypes } from "./helpers/getTypes";
import { url } from "./constants/url";

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

const promise = fetch(url).then((response) => response.json());

// render words (don't render in grid, render somewhere offscreen)
// would there still be performance concerns with large data?
// O(N^2) (10,000 rows of 10 values each)
// measure words
// set column widths based on longest measured word

const Offscreen = memo(({ style, ...props }) => {
  return (
    <div {...props} style={{ position: "absolute", left: 0, ...style }}></div>
  );
});

Offscreen.displayName = "Offscreen";

const DynamicComponent = memo(({ updateColumnWidths, children, field }) => {
  const { dimensions, ref } = useElementDimensions();

  // const { height, width, x, y } = dimensions ?? {};
  const { width } = dimensions ?? {};

  useEffect(() => {
    updateColumnWidths({ field, width });
  }, [field, width, updateColumnWidths]);

  return (
    <div style={{ width: "fit-content" }} className="fs-6" ref={ref}>
      {children}
    </div>
  );
});

DynamicComponent.displayName = "DynamicComponent";

export default function App(resources) {
  const { useDropdown, Dropdown, Wrapper } = resources;

  const gridRef = useRef();

  const data = usePromise(promise);

  const rowData = useMemo(
    () =>
      (data ? transformData(data.Data, data.Labels) : []).filter(
        filterByHonorsProgram
      ),
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
    () => initializeColumnDefs(types, columnWidths),
    [types, columnWidths]
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

  usePrevious(allColleges, () => colleges.handleChange(undefined, false));

  const reviewTypes = useDropdown({
    options: allReviewTypes,
    label: reviewTypeKey,
    multiple: true,
  });

  usePrevious(allReviewTypes, () => reviewTypes.handleChange(undefined, false));

  const filterDeps = useMemo(() => {
    return { reviewTypes, colleges, rowData };
  }, [rowData, colleges, reviewTypes]);

  const deferredFilterDeps = useDeferredValue(filterDeps);

  const filteredRowData = useMemo(() => {
    return deferredFilterDeps.rowData.filter((row) => {
      const college = row[collegeKey];

      const reviewType = row[reviewTypeKey];

      return (
        deferredFilterDeps.colleges.selected.has(college) &&
        deferredFilterDeps.reviewTypes.selected.has(reviewType)
      );
    });
  }, [deferredFilterDeps]);

  // const deferredFilteredRowData = useDeferredValue(filteredRowData);

  // usePrevious(filteredRowData, () => gridRef.api?.autoSizeAllColumns());

  console.log(columnWidths);

  // once columnWidths checks every distinct value, can remove offscreen component

  // console.log(distinctValues);

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
      heading="Program Review 2024-2025"
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
          // onModelUpdated={(e) => e.api.autoSizeAllColumns()}
          // suppressColumnVirtualisation
          // className="azeret-mono fw-bold"
          // autoSizeStrategy={autoSizeStrategy}
          quickFilterText={searchValue}
          // defaultColDef={headerWrappingDef}
          columnDefs={sortedColumnDefs}
          // suppressRowVirtualisation
          rowData={filteredRowData}
          className="fs-6 poppins"
          ref={gridRef}
        />
      </div>
      <div className="position-fixed pe-none opacity-0">
        {Object.keys(distinctValues).map((field) => (
          <DynamicComponent
            updateColumnWidths={updateColumnWidths}
            key={`${field}`}
            field={field}
          >
            {`${field}`}
          </DynamicComponent>
        ))}
        {Object.entries(distinctValues).map(([field, set]) =>
          [...set].map((value) => (
            <DynamicComponent
              updateColumnWidths={updateColumnWidths}
              key={`${field}-${value}`}
              field={field}
            >
              {`${value}`}
            </DynamicComponent>
          ))
        )}
      </div>
    </Wrapper>
  );
}
