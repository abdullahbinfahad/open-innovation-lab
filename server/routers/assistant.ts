import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  createAssistantMessage,
  createAssistantSession,
  createUserTask,
  finalizeAssistantMessage,
  getAssistantSessionForUser,
  listAssistantMessagesForUser,
  listAssistantSessionsForUser,
  listUserTasksForUser,
  updateUserTaskStatus,
} from "../db";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";

const assistantSystemPrompt = `You are the Personal AI Assistant for Open Innovation Lab. Be practical, transparent, and concise. Use clear Markdown. Do not claim to have completed external actions you have not performed. When the user has an actionable goal, include a short, sequenced task breakdown. End each response with the exact Markdown heading \"## Suggested follow-ups\" followed by two or three concise bullet questions tailored to the conversation.`;

function responseText(response: unknown): string {
  const content = (
    response as { choices?: Array<{ message?: { content?: unknown } }> }
  ).choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  throw new Error("The model did not return readable text");
}

function responseModel(response: unknown): string | undefined {
  const model = (response as { model?: unknown }).model;
  return typeof model === "string" ? model : undefined;
}

function titleFromMessage(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();
  return normalized.length > 72 ? `${normalized.slice(0, 69)}…` : normalized;
}

function stripJsonFence(value: string) {
  return value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

const taskPlanSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(240),
        description: z.string().trim().max(1000).optional(),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
      })
    )
    .min(1)
    .max(5),
});

export const assistantRouter = router({
  sessions: protectedProcedure.query(({ ctx }) =>
    listAssistantSessionsForUser(ctx.user.id)
  ),

  messages: protectedProcedure
    .input(z.object({ sessionId: z.string().min(1).max(64) }))
    .query(async ({ ctx, input }) => {
      const messages = await listAssistantMessagesForUser(
        input.sessionId,
        ctx.user.id
      );
      if (!messages)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      return messages;
    }),

  tasks: protectedProcedure.query(({ ctx }) =>
    listUserTasksForUser(ctx.user.id)
  ),

  sendMessage: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().min(1).max(64).optional(),
        content: z.string().trim().min(1).max(8000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      let session = input.sessionId
        ? await getAssistantSessionForUser(input.sessionId, userId)
        : undefined;
      if (input.sessionId && !session)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      if (!session) {
        const id = nanoid();
        await createAssistantSession(
          userId,
          id,
          titleFromMessage(input.content)
        );
        session = await getAssistantSessionForUser(id, userId);
      }
      if (!session)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create a session",
        });

      await createAssistantMessage({
        id: nanoid(),
        sessionId: session.id,
        role: "user",
        content: input.content,
        status: "completed",
      });
      const history = await listAssistantMessagesForUser(session.id, userId);
      if (!history)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });

      const pendingId = nanoid();
      await createAssistantMessage({
        id: pendingId,
        sessionId: session.id,
        role: "assistant",
        content: "Preparing a response…",
        status: "generating",
      });

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: assistantSystemPrompt },
            ...history.slice(-12).map(message => ({
              role: message.role,
              content: message.content,
            })),
          ],
        });
        const content = responseText(response);
        const model = responseModel(response);
        await finalizeAssistantMessage({
          id: pendingId,
          content,
          model,
          status: "completed",
        });
        return {
          sessionId: session.id,
          assistantMessageId: pendingId,
          status: "completed" as const,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown model error";
        await finalizeAssistantMessage({
          id: pendingId,
          content: `I could not generate a response. Please try again.\n\n> Technical detail: ${message}`,
          status: "error",
        });
        return {
          sessionId: session.id,
          assistantMessageId: pendingId,
          status: "error" as const,
        };
      }
    }),

  breakDownSession: protectedProcedure
    .input(z.object({ sessionId: z.string().min(1).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const history = await listAssistantMessagesForUser(
        input.sessionId,
        ctx.user.id
      );
      if (!history)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      if (!history.some(message => message.role === "user")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Add a goal or question before creating tasks",
        });
      }

      const conversation = history
        .slice(-16)
        .map(message => `${message.role.toUpperCase()}: ${message.content}`)
        .join("\n\n");
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              'Convert the conversation into a maximum of five concrete user tasks. Return only valid JSON with this shape: {"tasks":[{"title":"string","description":"string","priority":"low|medium|high"}]}. Do not invent commitments or external completion.',
          },
          { role: "user", content: conversation },
        ],
      });
      let parsed: z.infer<typeof taskPlanSchema>;
      try {
        parsed = taskPlanSchema.parse(
          JSON.parse(stripJsonFence(responseText(response)))
        );
      } catch {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "The model returned an invalid task plan. Please try again.",
        });
      }

      await Promise.all(
        parsed.tasks.map(task =>
          createUserTask({
            id: nanoid(),
            userId: ctx.user.id,
            sessionId: input.sessionId,
            title: task.title,
            description: task.description,
            priority: task.priority,
          })
        )
      );
      return { created: parsed.tasks.length };
    }),

  createTask: protectedProcedure
    .input(
      z.object({
        title: z.string().trim().min(1).max(240),
        description: z.string().trim().max(1000).optional(),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        sessionId: z.string().min(1).max(64).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (
        input.sessionId &&
        !(await getAssistantSessionForUser(input.sessionId, ctx.user.id))
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }
      await createUserTask({ id: nanoid(), userId: ctx.user.id, ...input });
      return { success: true } as const;
    }),

  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(64),
        status: z.enum(["todo", "in_progress", "completed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateUserTaskStatus(input.id, ctx.user.id, input.status);
      return { success: true } as const;
    }),
});
