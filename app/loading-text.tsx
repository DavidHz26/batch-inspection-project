export function Loading({ label }: { label?: string }) {
  return (
    <p className="text-sm text-gray-500" role="status">
      Loading{label ? ` ${label}` : ""}...
    </p>
  );
}
