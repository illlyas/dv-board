import { isValidProjectKey, type ProjectConfig } from "@/lib/projects/project-config";
import {
  parseProjectConfigJson,
  ensureProjectVisualAssets,
  ensureProjectBoardDefaults,
} from "@/lib/projects/parse-project-config";
import { storage, dvPath } from "@/lib/storage";
import { PROJECT_CONFIG_FILENAME } from "@/lib/projects/project-config";

export async function loadProjectConfigResolved(
  _cwd: string,
  projectKey: string
): Promise<ProjectConfig | null> {
  if (!isValidProjectKey(projectKey)) return null;
  const raw = await storage.tryReadText(dvPath(projectKey, PROJECT_CONFIG_FILENAME));
  if (raw === null) return null;
  const cfg = parseProjectConfigJson(raw);
  if (!cfg || cfg.id !== projectKey) return null;
  return ensureProjectBoardDefaults(ensureProjectVisualAssets(cfg));
}
