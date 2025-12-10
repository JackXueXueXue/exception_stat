# CrashSight 崩溃监控平台 - 界面设计规范 (Design Spec)

**项目名称：** CrashSight
**产品定位：** 移动端应用稳定性监控平台 (类似 Firebase Crashlytics / Sentry)
**目标用户：** 移动端开发工程师 (Android/iOS)、测试工程师、技术经理
**核心体验：** 高效筛选、清晰的堆栈分析、聚合归类

---

## 1. 设计理念 (Design Philosophy)

*   **信息密度 (High Density)**：作为开发者工具，首屏需要展示尽可能多的关键指标（趋势、版本分布、崩溃次数），减少滚动。
*   **层级清晰 (Hierarchy)**：严格遵循 `Issue Group (问题组)` -> `Variant (变体)` -> `Event (具体事件)` 的三层数据结构。
*   **代码优先 (Code First)**：堆栈跟踪（Stack Trace）是核心资产，必须使用等宽字体，并高亮应用自身代码，弱化系统堆栈。

---

## 2. 色彩系统 (Color System)

采用了冷色调为主的工程化配色，确保长时间注视不疲劳，同时用醒目的警示色标记问题。

| 用途 | 颜色 | 色值 (Hex) | 说明 |
| :--- | :--- | :--- | :--- |
| **主品牌色** | **Google Blue** | `#1A73E8` | 顶部导航栏、主要按钮、选中状态 |
| **强调色** | Blue Hover | `#1557B0` | 按钮悬停、深色交互态 |
| **背景色** | Cool Gray | `#F3F4F6` | 页面整体背景，区分内容区块 |
| **内容白** | White | `#FFFFFF` | 卡片、列表容器背景 |
| **严重/崩溃** | **Error Red** | `#D93025` | 崩溃图标、Sparkline 趋势线、Open 状态 |
| **安全/已修复**| Success Green | `#188038` | Closed 状态、修复标记 |
| **代码高亮** | Syntax Blue | `#2b6cb0` | 堆栈中的应用包名/方法名 |
| **代码背景** | Terminal Dark | `#0d1117` | 堆栈区域深色背景 (GitHub Dimmed 风格) |

---

## 3. 字体规范 (Typography)

*   **UI 字体**: `Inter`, system-ui, sans-serif
    *   用于界面标签、标题、普通文本。
    *   字重：Regular (400), Medium (500), Semibold (600)。
*   **代码字体**: `JetBrains Mono`, Menlo, monospace
    *   **强制用于**：堆栈跟踪、类名、方法名、Build Number、UUID。
    *   特性：带连字 (Ligatures)，0 和 O 区分明显，提升排查效率。

---

## 4. 核心页面交互规范

### 4.1 顶部筛选栏 (Global Toolbar)
*   **位置**：吸顶固定 (Sticky Top)。
*   **层级**：位于导航栏下方，内容区上方。
*   **组件构成**：
    1.  **版本筛选 (Version Filter)**：
        *   采用双栏级联设计（外部版本 VersionName -> 内部版本 BuildNumber）。
        *   支持“全选/半选”状态。
        *   交互：点击展开下拉浮层，点击外部自动关闭。
    2.  **时间筛选 (Time Filter)**：
        *   混合模式：左侧快捷预设（近24小时、7天），右侧日历+精确时间录入。
        *   交互：预设与自定义时间双向联动。
    3.  **搜索栏**：
        *   支持搜索：Class Name, Method Name, Exception Message。

### 4.2 列表页 (Dashboard List)
*   **布局**：卡片式表格 (Table in Card)。
*   **列定义**：
    *   **问题 (Issue)**：图标(红) + 包名(灰) + **类名.方法名(黑/粗/等宽)** + 异常摘要。
    *   **版本范围**：显示 `First Seen` - `Last Seen` 版本号。
    *   **趋势 (Trend)**：最近 14 天的 Sparkline 迷你折线图 (Red)，直观展示爆发趋势。
    *   **指标**：事件数 (Event Count) 和 影响用户数 (Users)，右对齐，加粗数字。
*   **空状态**：当筛选无结果时，展示灰色 Check 图标和提示文案。

### 4.3 详情页 (Issue Detail)
*   **导航**：面包屑 "返回列表 / Issue #ID"。
*   **头部 (Header)**：
    *   左侧：超大号方法名标题，状态标签 (Open/Closed)。
    *   右侧：操作区（关闭问题、添加备注）。
    *   **备注交互**：Hover 触发 Popover 显示历史备注，点击按钮弹出模态框 (Modal) 添加新备注。
*   **分布条 (Breakdown Bars)**：
    *   交互式横向滚动条。
    *   **首项**：“所有事件”聚合统计。
    *   **后续项**：按异常信息 (Variant) 分组的统计卡片。
    *   **选中态**：蓝色边框高亮，驱动下方堆栈内容切换。
*   **堆栈浏览器 (Stack Trace Explorer)**：
    *   **视觉风格**：深色 IDE 风格 (`bg-[#0d1117]`)。
    *   **行样式**：
        *   **App 代码**：蓝色半透明背景高亮，左侧蓝色竖线标记，文字高亮。
        *   **系统代码**：灰色文字，降低视觉干扰。
    *   **翻页器**：在当前 Variant 下切换具体的 Event 实例 (1/20)，查看不同设备的具体堆栈。

---

## 5. 组件细节

### 5.1 迷你图 (Sparkline)
*   **库**：Recharts
*   **尺寸**：固定高度 40px，宽度 96px。
*   **样式**：隐藏坐标轴，仅保留曲线，红色描边 `strokeWidth={2}`。

### 5.2 状态徽章 (Badges)
*   **样式**：柔和背景色 +深色文字 + 1px 边框。
    *   Open: `bg-red-100 text-red-800`
    *   Closed: `bg-green-100 text-green-800`
    *   New: `bg-blue-100 text-blue-800`

### 5.3 弹窗与模态框
*   **背景**：黑色半透明遮罩 (`bg-black/50`)。
*   **动画**：`animate-fade-in` 简单的透明度渐变。
*   **阴影**：`shadow-xl` 提升层级感。

