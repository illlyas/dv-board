import { readFile } from "fs/promises";
import { isValidProjectKey, projectConfigPath, type ProjectConfig } from "@/lib/projects/project-config";
import {
  parseProjectConfigJson,
  ensureProjectVisualAssets,
  ensureProjectBoardDefaults,
} from "@/lib/projects/parse-project-config";

export async function loadProjectConfigResolved(
  cwd: string,
  projectKey: string
): Promise<ProjectConfig | null> {
  if (!isValidProjectKey(projectKey)) return null;
  try {
    const raw = await readFile(projectConfigPath(cwd, projectKey), "utf-8");
    const cfg = parseProjectConfigJson(raw);
    if (!cfg || cfg.id !== projectKey) return null;
    return ensureProjectBoardDefaults(ensureProjectVisualAssets(cfg));
  } catch {
    return null;
  }
}
