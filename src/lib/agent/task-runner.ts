import type { AgentTask, ChatMessage } from "@/types/pipeline.types";
import type { QuestionForm } from "@/lib/board/data-analysis-model";
import { SKILL_EXECUTORS } from "@/lib/agent/skill-executors";

export interface TaskRunnerCallbacks {
  onTaskStart: (taskId: string) => void;
  onTaskDone: (taskId: string) => void;
  onTaskSkipped: (taskId: string, reason: string) => void;
  onTaskError: (taskId: string, error: string) => void;
  onMessage: (msg: ChatMessage) => void;
  onFormPause: (taskId: string, form: QuestionForm, extractedInfo: unknown) => void;
}

export async function runTasks(
  tasks: AgentTask[],
  projectName: string,
  style: string,
  existingFiles: string[],
  signal: AbortSignal,
  callbacks: TaskRunnerCallbacks,
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>
): Promise<void> {
  // 可变的 existingFiles，每个 task 执行完后更新（供后续 task 的动态文件名计算使用）
  const currentFiles = [...existingFiles];

  for (const task of tasks) {
    if (signal.aborted) return;

    const executor = SKILL_EXECUTORS[task.skill];
    if (!executor) {
      callbacks.onTaskError(task.id, `未知 skill: ${task.skill}`);
      return;
    }

    callbacks.onTaskStart(task.id);

    try {
      let streamingMsgId: string | null = null;

      const ctx = {
        signal,
        projectName,
        style,
        existingFiles: currentFiles,
        conversationHistory,
        onProgress: (partial: string) => {
          if (!streamingMsgId) {
            streamingMsgId = `${task.id}-stream-${Date.now()}`;
          }
          callbacks.onMessage({
            id: streamingMsgId,
            role: "assistant",
            content: partial,
            streaming: true,
          });
        },
      };

      const result = await executor(task.inputs, ctx);

      if (result.type === "form") {
        callbacks.onFormPause(task.id, result.form, result.extractedInfo);
        return;
      }

      callbacks.onTaskDone(task.id);

      // 更新 currentFiles，供后续 task 找到刚生成的文件
      if (result.generatedFiles) {
        result.generatedFiles.forEach((f) => {
          if (!currentFiles.includes(f)) currentFiles.push(f);
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      callbacks.onTaskError(task.id, message);
      return;
    }
  }
}
