# Personal AI Assistant validation record

## Purpose

This record distinguishes controls that were exercised in the running application from controls covered by automated tests. It is intentionally specific: roadmap status is not advanced merely because a component renders.

## Live workspace audit

The following guest-workspace flow was exercised against the running full-stack application on 2026-08-27. The guest identity is a random identifier stored only in the current browser’s local storage; the server uses it only to scope the corresponding persisted workspace data.

| Control                        | Expected result                                                   | Observed result                                                           |
| ------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Open assistant                 | A usable workspace loads without OAuth.                           | Passed; the device-local guest workspace loaded.                          |
| Send a starter prompt          | A new session, user message, and model response are stored.       | Passed; a real model response appeared with contextual follow-up prompts. |
| Create tasks from conversation | The model returns validated tasks and the action queue refreshes. | Passed; three generated tasks appeared in the persistent queue.           |
| Add a manual task              | The task form stores a user-created task and refreshes the queue. | Passed; the submitted task appeared with its description and priority.    |
| Toggle task completion         | The task state is saved and visibly updates.                      | Passed; the task changed to its completed state.                          |
| Reload the workspace           | Sessions and tasks remain available to the same browser.          | Passed; the saved session and all tasks reloaded.                         |
| Select saved session           | Prior conversation can be retrieved from the session list.        | Passed; the conversation and model response were retrieved.               |

### Browser-storage scope

Guest persistence is intentionally scoped to the browser’s local storage. A normal page reload retained the saved session and task queue during the audit. Closing the isolated test-browser profile started a new guest workspace, as expected for a new browser-storage context; it does not merge data from another device or browser profile.

After the MySQL result-parser correction, the live completion control was exercised again in both directions for a newly created guest task. The task changed between completed and incomplete without a failure toast, while the server retains a `NOT_FOUND` response for a task outside the current workspace.

Following removal of the global automatic OAuth redirect, the assistant was reopened in guest mode and the **Start a new conversation** control was exercised. It retained the task queue, cleared the active conversation, and left a usable fresh composer without redirecting to an external sign-in service.

The post-repair audit also exercised **View roadmap** from the workspace and **Open assistant** from the public hub. Both routes completed successfully; after the public roadmap request resolved, its counter displayed the canonical one in-progress project. A starter prompt generated a real model response, a model-provided suggested-follow-up chip generated the next persisted turn, and **Make tasks** created a refreshed set of three tasks from that conversation. The manual add-task control, saved-session selection, and task-status toggle were also exercised during the same guest-workspace validation cycle.

## Control map

| Visible control          | Route or client action             | Backing procedure                       | Access mode            | Expected success and error outcome                                                                                                                                                                             |
| ------------------------ | ---------------------------------- | --------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open the assistant       | Navigate to `/assistant`           | `assistant.sessions`, `assistant.tasks` | Guest or authenticated | Loads a persistent device workspace or account workspace. A data error is surfaced through the query state rather than silently blocking the page.                                                             |
| View roadmap             | Navigate to `/`                    | None                                    | Public                 | Returns to the public project hub.                                                                                                                                                                             |
| Start a new conversation | Clear the selected session         | None                                    | Guest or authenticated | Opens a clean composer; existing sessions remain stored.                                                                                                                                                       |
| Select a saved session   | Set the active session ID          | `assistant.messages`                    | Guest or authenticated | Retrieves messages owned by the current workspace; an unknown or unowned session returns a `NOT_FOUND` error.                                                                                                  |
| Send prompt              | Submit composer or starter prompt  | `assistant.sendMessage`                 | Guest or authenticated | Persists a user message, shows a generating response, then persists a completed model response. A model failure becomes a stored error-state response and a visible toast.                                     |
| Send suggested follow-up | Select a response follow-up chip   | `assistant.sendMessage`                 | Guest or authenticated | Creates the next contextual turn with the same success and model-error handling as the composer.                                                                                                               |
| Make tasks               | Select **Make tasks**              | `assistant.breakDownSession`            | Guest or authenticated | Converts the selected conversation into at most five validated tasks and refreshes the queue. Missing conversation data returns `NOT_FOUND`; malformed model JSON returns a visible `BAD_GATEWAY` error toast. |
| Open task form           | Select the add-task button         | None                                    | Guest or authenticated | Reveals the manual task form without network work.                                                                                                                                                             |
| Add manual task          | Submit a valid manual task form    | `assistant.createTask`                  | Guest or authenticated | Persists the task and refreshes the queue. A selected session outside the workspace returns `NOT_FOUND` and a visible toast.                                                                                   |
| Toggle task completion   | Select a task completion control   | `assistant.updateTaskStatus`            | Guest or authenticated | Persists the status change and refreshes the task. A missing or unowned task returns a visible failure rather than changing another workspace’s task.                                                          |
| Sign out                 | Select **Sign out** when displayed | `auth.logout`                           | Authenticated only     | Clears the hosted account session and returns the user to a guest workspace. The button is intentionally absent in guest mode.                                                                                 |

## Authentication note

The hosted OAuth redirect returned a third-party 403 response during the live audit. The assistant therefore does not depend on that redirect for its core functionality: guest mode is the first-party, device-scoped identity equivalent that enables persistent use when OAuth is unavailable. The browser stores only a random workspace identifier; the server stores a one-way hash rather than the raw identifier. If hosted OAuth succeeds, the same tools use the authenticated account and expose a Sign out control. The existing automated test suite also covers the logout mutation.

The client audit found one optional `startLogin` utility retained by the framework, but no released route, button, query handler, mutation handler, or automatic error handler invokes it. The global unauthorized-to-OAuth redirect was removed. Consequently, no visible released assistant control routes a guest user to the unavailable OAuth service.

## Automated coverage

The assistant router tests cover conversation creation, completed model responses, malformed task-plan errors, task persistence, and guest identity resolution for sessions, task creation, and task-status updates. The roadmap and persistence synchronization contracts are tested separately.
