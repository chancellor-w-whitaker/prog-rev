export const getWeirdRows = (rows) =>
  rows.filter((row) => {
    for (const key of Object.keys(row)) {
      if (
        typeof row[key] === "number" &&
        (isNaN(row[key]) || !isFinite(row[key]))
      ) {
        return true;
      }
    }
    return false;
  });
