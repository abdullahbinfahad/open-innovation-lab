import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  assistantMessages,
  assistantSessions,
  InsertUser,
  projectRecords,
  userTasks,
  users,
} from "../drizzle/schema";
import { ROADMAP_PROJECTS, type ProjectStatus } from "../shared/roadmap";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

type StoredProject = {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  platforms: string[];
  releaseOrder: number;
  status: ProjectStatus;
  summary: string;
  prerequisites: string;
  validationCriteria: string;
};

function parsePlatforms(value: string): string[] {
  try {
    const result: unknown = JSON.parse(value);
    return Array.isArray(result) &&
      result.every(item => typeof item === "string")
      ? result
      : [];
  } catch {
    return [];
  }
}

function toStoredProject(
  record: typeof projectRecords.$inferSelect
): StoredProject {
  return {
    id: record.id,
    title: record.title,
    category: record.category,
    difficulty: record.difficulty,
    platforms: parsePlatforms(record.platforms),
    releaseOrder: record.releaseOrder,
    status: record.status,
    summary: record.summary,
    prerequisites: record.prerequisites,
    validationCriteria: record.validationCriteria,
  };
}

async function synchronizeRoadmapRecords() {
  const db = await getDb();
  if (!db) return;

  await Promise.all(
    ROADMAP_PROJECTS.map(project =>
      db
        .insert(projectRecords)
        .values({
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
        })
        .onDuplicateKeyUpdate({
          set: {
            title: project.title,
            category: project.category,
            difficulty: project.difficulty,
            platforms: JSON.stringify(project.platforms),
            releaseOrder: project.releaseOrder,
            summary: project.summary,
            prerequisites: project.prerequisites,
            validationCriteria: project.validationCriteria,
          },
        })
    )
  );
}

export async function listRoadmapProjects(): Promise<StoredProject[]> {
  const db = await getDb();
  if (!db) return ROADMAP_PROJECTS;

  await synchronizeRoadmapRecords();
  const records = await db
    .select()
    .from(projectRecords)
    .orderBy(projectRecords.releaseOrder);
  return records.map(toStoredProject);
}

export async function listAssistantSessionsForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(assistantSessions)
    .where(eq(assistantSessions.userId, userId))
    .orderBy(desc(assistantSessions.lastActivityAt));
}

export async function getAssistantSessionForUser(
  sessionId: string,
  userId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db
    .select()
    .from(assistantSessions)
    .where(
      and(
        eq(assistantSessions.id, sessionId),
        eq(assistantSessions.userId, userId)
      )
    )
    .limit(1);
  return rows[0];
}

export async function createAssistantSession(
  userId: number,
  id: string,
  title: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(assistantSessions).values({ id, userId, title });
  return getAssistantSessionForUser(id, userId);
}

export async function listAssistantMessagesForUser(
  sessionId: string,
  userId: number
) {
  const session = await getAssistantSessionForUser(sessionId, userId);
  if (!session) return undefined;
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(assistantMessages)
    .where(eq(assistantMessages.sessionId, sessionId))
    .orderBy(assistantMessages.createdAt);
}

export async function createAssistantMessage(input: {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  status?: "queued" | "generating" | "completed" | "error";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(assistantMessages).values(input);
  await db
    .update(assistantSessions)
    .set({ lastActivityAt: new Date() })
    .where(eq(assistantSessions.id, input.sessionId));
}

export async function finalizeAssistantMessage(input: {
  id: string;
  content: string;
  model?: string;
  status: "completed" | "error";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(assistantMessages)
    .set({ content: input.content, model: input.model, status: input.status })
    .where(eq(assistantMessages.id, input.id));
}

export async function listUserTasksForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(userTasks)
    .where(eq(userTasks.userId, userId))
    .orderBy(desc(userTasks.updatedAt));
}

export async function createUserTask(input: {
  id: string;
  userId: number;
  sessionId?: string | null;
  title: string;
  description?: string | null;
  priority?: "low" | "medium" | "high";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(userTasks).values(input);
}

export async function updateUserTaskStatus(
  id: string,
  userId: number,
  status: "todo" | "in_progress" | "completed"
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(userTasks)
    .set({ status })
    .where(and(eq(userTasks.id, id), eq(userTasks.userId, userId)));
}
