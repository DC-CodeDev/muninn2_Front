/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SYNCFUSION_LICENSE_KEY: string;
  readonly VITE_SYNCFUSION_SERVICE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
