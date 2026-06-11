/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALLOWED_TELEGRAM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
