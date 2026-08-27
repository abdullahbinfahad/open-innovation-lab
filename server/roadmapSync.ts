import { ROADMAP_PROJECTS, type ProjectStatus } from "../shared/roadmap";

export type RoadmapRecordWrite = {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  platforms: string;
  releaseOrder: number;
  status: ProjectStatus;
  summary: string;
  prerequisites: string;
  validationCriteria: string;
};

export function canonicalRoadmapRecordWrites(): RoadmapRecordWrite[] {
  return ROADMAP_PROJECTS.map(project => ({
    id: project.id,
    title: project.title,
    category: project.category,
    difficulty: project.difficulty,
    platforms: JSON.stringify(project.platforms),
    releaseOrder: project.releaseOrder,
    status: project.status,
    summary: project.summary,
    prerequisites: project.prerequisites,
    validationCriteria: project.validationCriteria,
  }));
}

export function canonicalRoadmapUpdateSet(record: RoadmapRecordWrite) {
  return {
    title: record.title,
    category: record.category,
    difficulty: record.difficulty,
    platforms: record.platforms,
    releaseOrder: record.releaseOrder,
    status: record.status,
    summary: record.summary,
    prerequisites: record.prerequisites,
    validationCriteria: record.validationCriteria,
  };
}
