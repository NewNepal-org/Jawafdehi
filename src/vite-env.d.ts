/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_JDS_API_BASE_URL?: string;
  readonly VITE_NES_API_BASE_URL?: string;
  readonly VITE_ENABLE_CASE_SUBMISSION_FORM?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
