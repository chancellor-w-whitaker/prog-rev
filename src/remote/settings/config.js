import { createRequires } from "@paciolan/remote-module-loader";
import React from "react";

export const config = { requires: createRequires({ react: React }) };
