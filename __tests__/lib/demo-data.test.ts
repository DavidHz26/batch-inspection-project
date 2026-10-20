describe("isDemoDataEnabled", () => {
  const original = process.env.DEMO_DATA_ENABLED;

  afterEach(() => {
    if (original === undefined) delete process.env.DEMO_DATA_ENABLED;
    else process.env.DEMO_DATA_ENABLED = original;
    jest.resetModules();
  });

  it("is false unless DEMO_DATA_ENABLED is the string true", async () => {
    process.env.DEMO_DATA_ENABLED = "false";
    jest.resetModules();
    expect((await import("@/lib/demo-data")).isDemoDataEnabled()).toBe(false);

    process.env.DEMO_DATA_ENABLED = "true";
    jest.resetModules();
    expect((await import("@/lib/demo-data")).isDemoDataEnabled()).toBe(true);
  });
});
