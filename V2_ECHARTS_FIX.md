# V2 ECharts 渲染错误修复

## 问题描述

运行时错误：
```
TypeError: Cannot read properties of undefined (reading 'graphic')
at SimpleJsxRenderer (src/components/v2/simple-jsx-renderer.tsx:88:12)
```

## 根本原因

AI 生成的代码尝试使用 ECharts 相关的功能（如 `graphic`），但执行环境中没有提供 ECharts 依赖。

## 解决方案

### 1. 增强 SimpleJsxRenderer

**文件**: `src/components/v2/simple-jsx-renderer.tsx`

#### 添加的功能：

1. **导入 ECharts**
   ```typescript
   import * as echarts from "echarts";
   ```

2. **创建 EChartsWrapper 组件**
   - 封装 ECharts 图表的初始化和渲染逻辑
   - 自动处理图表实例的创建和销毁
   - 支持窗口大小变化时自动调整图表大小

3. **注入更多依赖到执行环境**
   ```typescript
   const ComponentFactory = new Function(
     "React",
     "useState", 
     "useEffect", 
     "useMemo", 
     "useCallback", 
     "useRef",
     "echarts",           // ← 新增
     "EChartsWrapper",    // ← 新增
     fullCode
   );
   ```

4. **改进错误显示**
   - 显示详细的错误堆栈
   - 添加"查看详细错误信息"折叠面板
   - 提供重试按钮

### 2. 更新 API Prompt

**文件**: `src/app/api/board/v2/generate-jsx/route.ts`

添加了关于 ECharts 使用的详细说明：

```javascript
// 正确的使用方式
React.createElement(EChartsWrapper, {
  option: {
    title: { text: '销售趋势' },
    xAxis: { type: 'category', data: ['1月', '2月', '3月'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      data: [120, 200, 150]
    }]
  },
  style: { width: 400, height: 300 }
})
```

⚠️ **重要**：不要直接使用 `echarts.init()`，使用 `EChartsWrapper` 组件。

## EChartsWrapper 组件详解

### 功能特性

1. **自动初始化**
   - 在组件挂载时自动初始化 ECharts 实例
   - 使用 `useRef` 保持实例引用

2. **配置更新**
   - 当 `option` prop 变化时自动更新图表
   - 使用 `setOption(option, true)` 确保完全替换配置

3. **响应式**
   - 监听窗口大小变化
   - 自动调用 `resize()` 方法调整图表大小

4. **资源清理**
   - 组件卸载时自动调用 `dispose()` 释放资源
   - 防止内存泄漏

### 使用示例

```javascript
// 在 AI 生成的代码中
function Dashboard() {
  const chartOption = {
    title: { text: 'GMV 趋势' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}万' }
    },
    series: [{
      name: 'GMV',
      type: 'line',
      data: [120, 200, 150, 180, 220, 250],
      smooth: true,
      lineStyle: { width: 3 },
      itemStyle: { color: '#3b82f6' }
    }]
  };

  return React.createElement("div", {
    style: { width: 1920, height: 1080, padding: 20 }
  },
    React.createElement("h1", null, "销售数据看板"),
    React.createElement(EChartsWrapper, {
      option: chartOption,
      style: { width: 800, height: 400 }
    })
  );
}
```

## 可用的依赖列表

AI 生成的代码可以使用以下依赖：

### React 相关
- `React` - React 核心库
- `useState` - 状态管理 Hook
- `useEffect` - 副作用 Hook
- `useMemo` - 记忆化 Hook
- `useCallback` - 回调记忆化 Hook
- `useRef` - 引用 Hook

### 图表相关
- `echarts` - ECharts 库（完整功能）
- `EChartsWrapper` - 图表包装组件（推荐使用）

## 测试验证

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 生成看板
输入包含图表的需求，例如：
```
一个电商销售数据仪表盘，包含 GMV 趋势图、品类占比饼图、TOP10 商品表格
```

### 3. 检查渲染结果

**成功标志**：
- ✅ 右侧显示完整的看板
- ✅ 图表正常渲染
- ✅ 没有 "Cannot read properties of undefined" 错误

**如果仍有错误**：
1. 打开浏览器控制台（F12）
2. 查看详细的错误堆栈
3. 点击"查看详细错误信息"查看完整错误
4. 检查 AI 生成的代码是否使用了未注入的依赖

## 常见问题

### Q1: 图表不显示

**可能原因**：
- 图表容器没有设置宽高
- option 配置不正确
- 数据格式错误

**解决方案**：
- 确保 EChartsWrapper 的 style 包含 width 和 height
- 检查 option 配置是否符合 ECharts 规范
- 验证数据数组不为空

### Q2: 图表显示但样式不对

**可能原因**：
- VI 系统的颜色没有正确应用
- 字体大小不合适

**解决方案**：
- 在 option 中明确指定颜色（使用 VI token）
- 调整 title、legend、axis 的字体大小

### Q3: 多个图表时性能问题

**解决方案**：
- 使用 `useMemo` 缓存 option 对象
- 避免在每次渲染时创建新的 option
- 考虑使用 ECharts 的 `notMerge: false` 选项

## 代码改进建议

### 优化 1: 缓存图表配置

```javascript
function Dashboard() {
  const chartOption = useMemo(() => ({
    // ... option 配置
  }), []); // 依赖数组为空，只创建一次

  return React.createElement(EChartsWrapper, {
    option: chartOption,
    style: { width: 800, height: 400 }
  });
}
```

### 优化 2: 响应式图表大小

```javascript
React.createElement(EChartsWrapper, {
  option: chartOption,
  style: { 
    width: "100%",  // 使用百分比
    height: 400,
    minWidth: 300   // 设置最小宽度
  }
})
```

### 优化 3: 主题适配

```javascript
const chartOption = {
  backgroundColor: viSystem.colors.card,
  textStyle: {
    color: viSystem.colors.foreground,
    fontFamily: viSystem.typography.fontFamily.body
  },
  // ... 其他配置
};
```

## 下一步优化

如果基本渲染正常，可以考虑：

1. **添加更多图表类型支持**
   - 地图（需要额外的地图数据）
   - 3D 图表（需要 echarts-gl）
   - 关系图、树图等

2. **添加图表交互**
   - 点击事件
   - 数据联动
   - 工具栏（保存图片、数据视图等）

3. **性能优化**
   - 大数据量时使用数据采样
   - 虚拟滚动
   - 按需加载图表

4. **主题定制**
   - 根据 VI 系统自动生成 ECharts 主题
   - 支持亮色/暗色主题切换

---

**修复时间**: 2026-05-02  
**状态**: ✅ 完成  
**影响范围**: SimpleJsxRenderer, generate-jsx API
