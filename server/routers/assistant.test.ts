import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  createAssistantMessage: vi.fn(),
  createAssistantSession: vi.fn(),
  createUserTask: vi.fn(),
  finalizeAssistantMessage: vi.fn(),
  getAssistantSessionForUser: vi.fn(),
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
});
