import { listRoadmapProjects } from "../db";
import { publicProcedure, router } from "../_core/trpc";

export const projectsRouter = router({
  list: publicProcedure.query(async () => listRoadmapProjects()),
});
