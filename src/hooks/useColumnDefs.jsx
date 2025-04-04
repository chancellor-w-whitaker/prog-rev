import { useCallback, useState, useMemo } from "react";

import { MeasuredCell } from "../components/MeasuredCell";
import { usePrevious } from "./usePrevious";

export const useColumnDefs = ({ cellPadding = 50, rowData = [] }) => {
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

  const [columnWidths, setColumnWidths] = useState();

  const initialColumnWidths = useMemo(
    () =>
      Object.fromEntries(Object.keys(distinctValues).map((key) => [key, 0])),
    [distinctValues]
  );

  usePrevious(initialColumnWidths, () => setColumnWidths(initialColumnWidths));

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

  const columnDefs = useMemo(
    () =>
      Object.entries(columnWidths).map(([field, width]) => ({
        width: Math.ceil(width) + cellPadding,
        field,
      })),
    [columnWidths, cellPadding]
  );

  const measurementContainer = useMemo(
    () => (
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
    ),
    [distinctValues, updateColumnWidths]
  );

  return { measurementContainer, columnDefs };
};
