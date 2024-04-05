/// <reference types="vite/client" />
  interface ImportMetaEnv {
    readonly VITE_EP_SCHEDULE: string
  readonly VITE_EP_RETRIEVE: string
  readonly VITE_EP_REMOVE: string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }