import { useRemoteModule } from "../assets/useRemoteModule";
import App from "../../App";

export const Root = () => {
  const remoteModule = useRemoteModule();

  return <App {...remoteModule}></App>;
};
