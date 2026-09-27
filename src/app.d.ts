/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {
  readonly PUBLIC_API_BASE: string;
  readonly PUBLIC_APP_NAME: string;
  readonly PUBLIC_PAYMENT_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user?: { id: string; name: string; email: string; role: string } | null;
  }
  interface Platform {
    env?: {
      DB?: D1Database;
      PHOTOS?: R2Bucket;
      REPORTS?: R2Bucket;
      SESSIONS?: KVNamespace;
    };
  }
}
