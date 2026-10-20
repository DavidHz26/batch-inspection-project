export function Loading({ label }: { label?: string }) {
  return (
    <p className="text-sm text-muted-foreground" role="status">
      Loading{label ? ` ${label}` : ""}...
    </p>
  );
}
