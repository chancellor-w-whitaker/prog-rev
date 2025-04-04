export const fieldDefs = {
  "Final Recommendation": {
    cellEditorParams: {
      values: [
        null,
        "Continue without modifications",
        "Continue with modifications",
        "Continue with conditions and monitoring",
        "Close within one to three years",
      ],
    },
    cellEditor: "agSelectCellEditor",
    editable: true,
  },
  "Review Year": {
    cellEditorParams: {
      values: [
        null,
        "2024-2025",
        "2025-2026",
        "2026-2027",
        "2027-2028",
        "2028-2029",
      ],
    },
    cellEditor: "agSelectCellEditor",
    editable: true,
  },
  "Review Complete": {
    cellEditorParams: {
      values: [null, "Y", "N"],
    },
    cellEditor: "agSelectCellEditor",
    editable: true,
  },
};
