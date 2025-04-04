import { useState, memo } from "react";
import { useEffect } from "react";

import { useElementDimensions } from "../hooks/useElementDimensions";

export const MeasuredCell = memo(({ updateColumnWidths, children, field }) => {
  const [rendered, setRendered] = useState(true);

  const { dimensions, ref } = useElementDimensions();

  // const { height, width, x, y } = dimensions ?? {};
  const { width } = dimensions ?? {};

  useEffect(() => {
    updateColumnWidths({ field, width });

    // ! possibly remove this code if measuring doesn't occur when necessary
    return () => setRendered(false);
  }, [field, width, updateColumnWidths]);

  return (
    rendered && (
      <div style={{ width: "fit-content" }} className="fs-6" ref={ref}>
        {children}
      </div>
    )
  );
});

MeasuredCell.displayName = "MeasuredCell";
