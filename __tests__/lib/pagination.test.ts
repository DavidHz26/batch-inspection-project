import { DEFAULT_PAGE_SIZE, pageRange, parsePagination } from "@/lib/pagination";

describe("parsePagination", () => {
  it("defaults to page 1 and the default page size", () => {
    expect(parsePagination({})).toEqual({ page: 1, page_size: DEFAULT_PAGE_SIZE });
  });

  it("accepts an allowed page size and floors the page", () => {
    expect(parsePagination({ page: "2.9", page_size: "20" })).toEqual({
      page: 2,
      page_size: 20,
    });
  });

  it("clamps invalid pages and unknown sizes", () => {
    expect(parsePagination({ page: "0", page_size: "7" })).toEqual({
      page: 1,
      page_size: DEFAULT_PAGE_SIZE,
    });
    expect(parsePagination({ page: "abc" }).page).toBe(1);
  });
});

describe("pageRange", () => {
  it("returns inclusive from/to indexes", () => {
    expect(pageRange(1, 10)).toEqual({ from: 0, to: 9 });
    expect(pageRange(3, 10)).toEqual({ from: 20, to: 29 });
  });
});
