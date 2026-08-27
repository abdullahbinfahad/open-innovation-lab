import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  createAssistantMessage: vi.fn(),
  createAssistantSession: vi.fn(),
  createUserTask: vi.fn(),
  finalizeAssistantMessage: vi.fn(),
  getAssistantSessionForUser: vi.fn(),
  getOrCreateGuestUserId: vi.fn(),
  listAssistantMessagesForUser: vi.fn(),
  listAssistantSessionsForUser: vi.fn(),
  listUserTasksForUser: vi.fn(),
  updateUserTaskStatus: vi.fn(),
}));

const llm = vi.hoisted(() => ({ invokeLLM: vi.fn() }));

vi.mock("../db", () => db);
vi.mock("../_core/llm", () => llm);

import { assistantRouter } from "./assistant";

const caller = () =>
  assistantRouter.createCaller({ user: { id: 42 } } as never);
const guestCaller = () => assistantRouter.createCaller({ user: null } as never);
const guestId = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";

describe("assistant workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a session, saves a user message, and persists a completed model response", async () => {
    db.getAssistantSessionForUser.mockResolvedValue({
      id: "session-1",
      userId: 42,
      title: "Plan my launch",
    });
    db.listAssistantMessagesForUser.mockResolvedValueOnce([
      {
        id: "user-message",
        role: "user",
        content: "Plan my launch",
        status: "completed",
      },
    ]);
    llm.invokeLLM.mockResolvedValue({
      model: "test-model",
      choices: [
        {
          message: {
            content:
              "Here is a practical plan.\n\n## Suggested follow-ups\n- What is the deadline?",
          },
        },
      ],
    });

    const result = await caller().sendMessage({ content: "Plan my launch" });

    expect(result).toMatchObject({
      sessionId: "session-1",
      status: "completed",
    });
    expect(db.createAssistantSession).toHaveBeenCalledWith(
      42,
      expect.any(String),
      "Plan my launch"
    );
    expect(db.createAssistantMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "user",
        content: "Plan my launch",
        status: "completed",
      })
    );
    expect(db.createAssistantMessage).toHaveBeenCalledWith(
      expect.objectContaining({ role: "assistant", status: "generating" })
    );
    expect(db.finalizeAssistantMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("Suggested follow-ups"),
        model: "test-model",
        status: "completed",
      })
    );
  });

  it("turns a session conversation into validated persisted tasks", async () => {
    db.listAssistantMessagesForUser.mockResolvedValue([
      {
        id: "user-message",
        role: "user",
        content: "Create a practical launch plan",
        status: "completed",
      },
      {
        id: "assistant-message",
        role: "assistant",
        content: "Start with positioning.",
        status: "completed",
      },
    ]);
    llm.invokeLLM.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              tasks: [
                {
                  title: "Define the audience",
                  description: "Write a short audience brief",
                  priority: "high",
                },
                {
                  title: "Draft launch milestones",
                  description: "Create a weekly milestone list",
                  priority: "medium",
                },
              ],
            }),
          },
        },
      ],
    });

    const result = await caller().breakDownSession({ sessionId: "session-1" });

    expect(result).toEqual({ created: 2 });
    expect(db.createUserTask).toHaveBeenCalledTimes(2);
    expect(db.createUserTask).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 42,
        sessionId: "session-1",
        title: "Define the audience",
        priority: "high",
      })
    );
  });

  it("refuses to turn an invalid model payload into tasks", async () => {
    db.listAssistantMessagesForUser.mockResolvedValue([
      {
        id: "user-message",
        role: "user",
        content: "Help me plan",
        status: "completed",
      },
    ]);
    llm.invokeLLM.mockResolvedValue({
      choices: [{ message: { content: "not JSON" } }],
    });

    await expect(
      caller().breakDownSession({ sessionId: "session-1" })
    ).rejects.toMatchObject({ code: "BAD_GATEWAY" });
    expect(db.createUserTask).not.toHaveBeenCalled();
  });

  it("persists a visible error-state message when the model request fails", async () => {
    db.getAssistantSessionForUser.mockResolvedValue({
      id: "session-1",
      userId: 42,
      title: "Plan my launch",
    });
    db.listAssistantMessagesForUser.mockResolvedValue([
      {
        id: "user-message",
        role: "user",
        content: "Plan my launch",
        status: "completed",
      },
    ]);
    llm.invokeLLM.mockRejectedValue(new Error("Model service unavailable"));

    const result = await caller().sendMessage({ content: "Plan my launch" });

    expect(result.status).toBe("error");
    expect(db.finalizeAssistantMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        content: expect.stringContaining("Model service unavailable"),
      })
    );
  });

  it("rejects manual task creation for a session outside the current workspace", async () => {
    db.getAssistantSessionForUser.mockResolvedValue(undefined);

    await expect(
      caller().createTask({ title: "Do not create", sessionId: "unknown" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(db.createUserTask).not.toHaveBeenCalled();
  });

  it("rejects a task-status update when the task is missing or belongs to another workspace", async () => {
    db.updateUserTaskStatus.mockResolvedValue(0);

    await expect(
      caller().updateTaskStatus({ id: "not-owned", status: "completed" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("uses a device-local guest identity when hosted OAuth is unavailable", async () => {
    db.getOrCreateGuestUserId.mockResolvedValue(84);
    db.listAssistantSessionsForUser.mockResolvedValue([]);
    db.listUserTasksForUser.mockResolvedValue([]);
    db.updateUserTaskStatus.mockResolvedValue(1);

    await guestCaller().sessions({ guestId });
    await guestCaller().tasks({ guestId });
    await guestCaller().createTask({
      guestId,
      title: "Verify guest task creation",
    });
    await guestCaller().updateTaskStatus({
      guestId,
      id: "task-1",
      status: "completed",
    });

    expect(db.listAssistantSessionsForUser).toHaveBeenCalledWith(84);
    expect(db.listUserTasksForUser).toHaveBeenCalledWith(84);
    expect(db.createUserTask).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 84,
        title: "Verify guest task creation",
      })
    );
    expect(db.updateUserTaskStatus).toHaveBeenCalledWith(
      "task-1",
      84,
      "completed"
    );
  });
});
