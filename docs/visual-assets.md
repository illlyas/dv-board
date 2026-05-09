# 视觉素材配置（visualAssets）

## 与 dashboard.jsx 的关系（方案 A）

- `dashboard.jsx` 保留 AI/开发者写入的默认 props（如 `BoardHeroBackdrop id="…"`、`titleBackdrop`）。
- **`project.config.json` 内 `visualAssets` 在运行时优先生效**：可关闭底纹或切换已注册的实现 id，**不自动改写 JSX**。

## 版本

- `project.config.json` 的 `configVersion`：含 `visualAssets` 时为 **2**（仅含旧字段时可为 1，读取时会补全默认 `visualAssets` 并写回）。
- `visualAssets.version`：描述 `items` 结构版本，当前为 **1**。

## role 命名

- 使用点分层：`domain.category`，例如 `hero.header`、`chart.title`。
- 新素材类型新增新 `role` 字符串即可，须在服务端注册表登记 `allowedImplementationIds`。

## itemKey

- 在单项目内唯一，用于稳定更新与扫描合并。
- 约定：`hero:main`（顶栏主背景一条）、`chart:title:global`（图表标题底纹全局策略）。

## scope（可选，预留）

- `items[].scope` 可为 `{ pageIndex?, slotId?, widgetType? }`，用于未来按页/按组件覆盖；当前可不填，表示全局。

## options（可选，预留）

- `Record<string, unknown>`，由各 `implementationId` 自行约定，用于强度、外链资源引用键等。

## 校验

- PATCH 时：未知 `role`、或 `implementationId` 不在该 role 的允许列表 → 400。
