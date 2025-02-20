import { createRemoteModuleProvider } from "./createRemoteModuleProvider";
import { RemoteModuleContext as Context } from "./RemoteModuleContext";
import { config } from "../settings/config";
import { url } from "../settings/url";

export const RemoteModuleProvider = createRemoteModuleProvider({
  Context,
  config,
  url,
});
