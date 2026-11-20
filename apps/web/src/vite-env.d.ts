/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production';
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_MOCK_API?: string;
  readonly VITE_EXTERNAL_SYSTEM_ID?: string;
  readonly VITE_LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  readonly VITE_DYNATRACE_ENABLED?: string;
  readonly VITE_DYNATRACE_SCRIPT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
