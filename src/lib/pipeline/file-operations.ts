/**
 * 文件操作工具函数
 */

/**
 * 保存文件到 .dv/{projectName}/{category}/{filename}
 */
export async function saveFile(
  projectName: string,
  category: string,
  filename: string,
  content: string
): Promise<void> {
  try {
    const res = await fetch("/api/files/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName, category, filename, content }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to save file");
    }
  } catch (err) {
    console.error("[saveFile] error:", err);
    throw err;
  }
}

/**
 * 读取文件内容
 */
export async function readFile(path: string): Promise<string> {
  const res = await fetch(`/api/files/read?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error("Failed to read file");
  const data = await res.json() as { content: string };
  return data.content;
}

/**
 * 获取项目文件列表
 */
export async function listProjectFiles(projectName: string) {
  const res = await fetch(`/api/files/list?projectName=${encodeURIComponent(projectName)}`);
  if (!res.ok) throw new Error("Failed to list files");
  return res.json();
}
