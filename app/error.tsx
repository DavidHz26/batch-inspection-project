"use client";

import { useEffect } from "react";
import { Alert } from "./alert";

export default function ErrorPage({ error, retry }: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message = error instanceof Error ? error.message : "An unexpected error occurred.";

  return (
    <div className="max-w-xl space-y-4">
      <Alert variant="error" title="Something went wrong">
        {message}
      </Alert>
      <button type="button" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
