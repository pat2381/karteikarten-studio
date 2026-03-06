import { load, save } from "../storage";

const mockData: Record<string, string> = {};

beforeEach(() => {
  // Clear mockData
  Object.keys(mockData).forEach((k) => delete mockData[k]);

  // Mock window.storage directly (don't redefine window itself)
  (window as Window & { storage?: unknown }).storage = {
    get: jest.fn(async (key: string) =>
      mockData[key] ? { value: mockData[key] } : null
    ),
    set: jest.fn(async (key: string, value: string) => {
      mockData[key] = value;
    }),
  };
});

afterEach(() => {
  delete (window as Window & { storage?: unknown }).storage;
});

describe("load()", () => {
  it("returns fallback when key not found", async () => {
    const result = await load("nonexistent", []);
    expect(result).toEqual([]);
  });

  it("parses stored JSON value", async () => {
    mockData["test-key"] = JSON.stringify({ name: "Test" });
    const result = await load<{ name: string }>("test-key", null);
    expect(result).toEqual({ name: "Test" });
  });

  it("returns fallback on parse error", async () => {
    mockData["bad-key"] = "not-valid-json{{{";
    const result = await load("bad-key", "default");
    expect(result).toBe("default");
  });
});

describe("save()", () => {
  it("saves data without throwing", async () => {
    await expect(save("key", { data: 1 })).resolves.not.toThrow();
  });
});
