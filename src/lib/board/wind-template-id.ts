/** 管线默认装配的看板模板 ID（与 board-templates 目录名一致） */
export const WIND_POWER_EMERALD_OPS_TEMPLATE_ID = "wind-power-emerald-ops" as const;

/** 与 board-templates/wind-power-emerald-ops/meta.json 的 screenPresetId 一致（新建项目默认画布） */
export const WIND_TEMPLATE_SCREEN_PRESET_ID = "2560x900" as const;

/** 写入 dashboard.jsx 首行注释，用于识别项目是否由风电运营模板装配 */
export const WIND_TEMPLATE_MARKER = `/** @dv-template: ${WIND_POWER_EMERALD_OPS_TEMPLATE_ID} */`;
