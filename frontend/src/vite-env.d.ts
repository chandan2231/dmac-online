/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  interface Window {
    paypal?: unknown;
  }
}

export {};
