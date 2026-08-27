import { describe, expect, it } from "vitest";
import { affectedRowsFromMySqlUpdate } from "./db";

describe("affectedRowsFromMySqlUpdate", () => {
  it("reads Drizzle MySQL update results returned as a result tuple", () => {
    expect(affectedRowsFromMySqlUpdate([{ affectedRows: 1 }, []])).toBe(1);
  });

  it("supports a direct result header and rejects missing affected-row metadata", () => {
    expect(affectedRowsFromMySqlUpdate({ affectedRows: 2 })).toBe(2);
    expect(affectedRowsFromMySqlUpdate([{ insertId: 3 }, []])).toBe(0);
  });
});
