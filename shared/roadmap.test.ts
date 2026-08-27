import { describe, expect, it } from "vitest";
import { ROADMAP_PROJECTS, roadmapStatusLabel } from "./roadmap";

describe("roadmap contract", () => {
  it("contains exactly thirty unique projects in release order", () => {
    expect(ROADMAP_PROJECTS).toHaveLength(30);
    expect(new Set(ROADMAP_PROJECTS.map(project => project.id)).size).toBe(30);
    expect(ROADMAP_PROJECTS.map(project => project.releaseOrder)).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 1)
    );
  });

  it("keeps non-implemented projects transparently planned", () => {
    const firstProject = ROADMAP_PROJECTS[0];
    const remainingProjects = ROADMAP_PROJECTS.slice(1);
    expect(firstProject?.status).toBe("in_progress");
    expect(
      remainingProjects.every(project => project.status === "planned")
    ).toBe(true);
  });

  it("defines exactly one in-progress project and twenty-nine planned projects", () => {
    const statusCounts = ROADMAP_PROJECTS.reduce<Record<string, number>>(
      (counts, project) => {
        counts[project.status] = (counts[project.status] ?? 0) + 1;
        return counts;
      },
      {}
    );

    expect(statusCounts).toEqual({ in_progress: 1, planned: 29 });
  });

  it("requires a release contract for every roadmap entry", () => {
    for (const project of ROADMAP_PROJECTS) {
      expect(project.summary.length).toBeGreaterThan(20);
      expect(project.prerequisites.length).toBeGreaterThan(20);
      expect(project.validationCriteria.length).toBeGreaterThan(20);
      expect(project.platforms.length).toBeGreaterThan(0);
      expect(roadmapStatusLabel[project.status]).toBeTruthy();
    }
  });
});
