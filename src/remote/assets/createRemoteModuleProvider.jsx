import createLoadRemoteModule from "@paciolan/remote-module-loader";
import { useEffect, useState } from "react";

export const createRemoteModuleProvider = ({
  url = import.meta.env.remoteUrl,
  Context,
  config,
}) => {
  const loadRemoteModule = createLoadRemoteModule(config);

  const pendingRemoteModule = loadRemoteModule(url);

  const RemoteModuleProvider = ({ children }) => {
    const remoteModule = usePromise(pendingRemoteModule);

    const defaultExport = remoteModule && remoteModule.default;

    return (
      <Context.Provider value={defaultExport}>
        {defaultExport && children}
      </Context.Provider>
    );
  };

  return RemoteModuleProvider;
};

const usePromise = (promise) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    if (promise) {
      let ignore = false;

      promise.then((response) => !ignore && setState(response));

      return () => {
        ignore = true;
      };
    }
  }, [promise]);

  return state;
};
