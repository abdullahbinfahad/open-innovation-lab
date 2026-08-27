import { describe, expect, it } from "vitest";
import {
  canonicalRoadmapRecordWrites,
  canonicalRoadmapUpdateSet,
} from "./roadmapSync";

describe("canonical roadmap persistence contract", () => {
  it("writes the expected status distribution for all thirty roadmap records", () => {
    const writes = canonicalRoadmapRecordWrites();
    const statusCounts = writes.reduce<Record<string, number>>(
      (counts, record) => {
        counts[record.status] = (counts[record.status] ?? 0) + 1;
        return counts;
      },
      {}
    );

    expect(writes).toHaveLength(30);
    expect(statusCounts).toEqual({ in_progress: 1, planned: 29 });
    expect(
      writes.find(record => record.id === "personal-ai-assistant")?.status
    ).toBe("in_progress");
  });

  it("includes status in duplicate-record updates so stored state cannot drift", () => {
    for (const record of canonicalRoadmapRecordWrites()) {
      const update = canonicalRoadmapUpdateSet(record);
      expect(update.status).toBe(record.status);
      expect(update.releaseOrder).toBe(record.releaseOrder);
    }
  });
});
