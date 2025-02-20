import { useContext } from "react";

import { RemoteModuleContext } from "./RemoteModuleContext";

export const useRemoteModule = () => useContext(RemoteModuleContext);
