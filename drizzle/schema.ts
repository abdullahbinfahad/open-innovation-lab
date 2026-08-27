import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const projectStatusValues = [
  "planned",
  "in_progress",
  "validated",
  "released",
] as const;
export const assistantMessageStatusValues = [
  "queued",
  "generating",
  "completed",
  "error",
] as const;
export const taskStatusValues = ["todo", "in_progress", "completed"] as const;
export const taskPriorityValues = ["low", "medium", "high"] as const;

export const projectRecords = mysqlTable(
  "project_records",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    title: varchar("title", { length: 160 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    difficulty: int("difficulty").notNull(),
    platforms: text("platforms").notNull(),
    releaseOrder: int("releaseOrder").notNull(),
    status: mysqlEnum("status", projectStatusValues)
      .default("planned")
      .notNull(),
    summary: text("summary").notNull(),
    prerequisites: text("prerequisites").notNull(),
    validationCriteria: text("validationCriteria").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("project_records_release_order_idx").on(table.releaseOrder),
    index("project_records_status_idx").on(table.status),
  ]
);

export const assistantSessions = mysqlTable(
  "assistant_sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 160 }).notNull(),
    summary: text("summary"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  },
  table => [
    index("assistant_sessions_user_activity_idx").on(
      table.userId,
      table.lastActivityAt
    ),
  ]
);

export const assistantMessages = mysqlTable(
  "assistant_messages",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sessionId: varchar("sessionId", { length: 64 })
      .notNull()
      .references(() => assistantSessions.id, { onDelete: "cascade" }),
    role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
    content: text("content").notNull(),
    model: varchar("model", { length: 160 }),
    status: mysqlEnum("status", assistantMessageStatusValues)
      .default("completed")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("assistant_messages_session_created_idx").on(
      table.sessionId,
      table.createdAt
    ),
  ]
);

export const userTasks = mysqlTable(
  "user_tasks",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionId: varchar("sessionId", { length: 64 }).references(
      () => assistantSessions.id,
      { onDelete: "set null" }
    ),
    title: varchar("title", { length: 240 }).notNull(),
    description: text("description"),
    status: mysqlEnum("status", taskStatusValues).default("todo").notNull(),
    priority: mysqlEnum("priority", taskPriorityValues)
      .default("medium")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("user_tasks_user_status_idx").on(table.userId, table.status),
    index("user_tasks_session_idx").on(table.sessionId),
  ]
);

export type ProjectRecord = typeof projectRecords.$inferSelect;
export type AssistantSession = typeof assistantSessions.$inferSelect;
export type AssistantMessage = typeof assistantMessages.$inferSelect;
export type UserTask = typeof userTasks.$inferSelect;
