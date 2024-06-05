import type { TooltipPositionerFunction } from "chart.js";
// https://vitejs.dev/guide/env-and-mode.html

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_HOST: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "chart.js" {
  // https://stackoverflow.com/questions/67776765/chart-js-3-x-custom-positioners-cannot-use-them-in-typescript
  // Extend tooltip positioner map

  interface TooltipPositionerMap {
    custom: TooltipPositionerFunction<ChartType>;
  }
}
