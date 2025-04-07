import { usePointerPosition } from "./usePointerPosition";
import { useDelayedValue } from "./useDelayedValue";

export const useUserIsActive = (delay = 300000) => {
  const pos1 = usePointerPosition();

  const pos2 = useDelayedValue(pos1, delay);

  return pos1 !== pos2;
};
