import "@testing-library/jest-dom";
import React from "react";

process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??= "test-key";

if (typeof HTMLFormElement !== "undefined") {
  if (!HTMLFormElement.prototype.requestSubmit) {
    HTMLFormElement.prototype.requestSubmit = function requestSubmit() {
      this.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    };
  }

  if (!HTMLFormElement.prototype.reportValidity) {
    HTMLFormElement.prototype.reportValidity = function reportValidity() {
      return true;
    };
  }
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub as typeof ResizeObserver;
}

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href, ...props }, children),
}));
