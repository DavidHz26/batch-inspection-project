type QueryResult = {
  data: unknown;
  error: { message: string; code?: string } | null;
  count: number | null;
};

export function createQueryBuilder(initial?: Partial<QueryResult>) {
  const result: QueryResult = {
    data: initial?.data ?? [],
    error: initial?.error ?? null,
    count: initial?.count ?? 0,
  };

  const builder: Record<string, unknown> = {};
  const self = () => builder;

  for (const method of [
    "select",
    "eq",
    "order",
    "range",
    "insert",
    "update",
    "delete",
    "in",
    "maybeSingle",
    "single",
  ]) {
    builder[method] = jest.fn(self);
  }

  builder.then = (
    onFulfilled?: (value: QueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(onFulfilled, onRejected);

  return { builder, result };
}

export function createSupabaseMock(initial?: Partial<QueryResult>) {
  const { builder, result } = createQueryBuilder(initial);
  return {
    from: jest.fn(() => builder),
    rpc: jest.fn(async () => ({ data: result.data, error: result.error })),
    builder,
    result,
  };
}

export type MockSupabase = ReturnType<typeof createSupabaseMock>;
