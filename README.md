# Operations Research: PERT & CPM Network Analysis Platform

An interactive Operations Research (OR) computational engine and network analysis platform for **Critical Path Method (CPM)** and **Program Evaluation and Review Technique (PERT)** with Beta-distribution 3-point estimation, Gaussian probabilistic schedule risk forecasting, Kahn's algorithm cycle detection, and topological AON (Activity on Node) diagram visualization.

---

## Executive Overview

Project management under uncertainty is one of the foundational problems in Operations Research and Industrial Engineering. Traditional deterministic CPM assumes fixed task durations, while PERT models real-world task durations as random variables following a Beta distribution characterized by three estimates:
1. **Optimistic duration ($o$)**: Minimum time under ideal conditions.
2. **Most likely duration ($m$)**: Modal time under normal operating conditions.
3. **Pessimistic duration ($p$)**: Maximum time under adverse conditions.

This platform provides:
- **Deterministic CPM Engine**: Forward pass ($ES, EF$), backward pass ($LS, LF$), total float (slack), free float, and critical path identification.
- **Probabilistic PERT Engine**: Expected duration ($t_e$), variance ($\sigma^2$), standard deviation ($\sigma$), and critical path variance aggregation.
- **Probabilistic Risk Forecasting**: Evaluates $P(\text{Finish} \le T)$ for any project deadline $T$ via Abramowitz-Stegun numerical error function approximation, and solves required durations for specified confidence quantiles via Acklam's inverse normal CDF.
- **Interactive Topological Network Visualization**: Interactive 2D canvas with mouse/touch panning, wheel zoom, vector SVG & high-res PNG export, real-time node schedule inspection, and dependency isolation.
- **Modular Feature Architecture**: Every analytical, visual, and editing capability is organized into dedicated, single-responsibility feature modules.

---

## Modular Project Architecture

The project has been structured so that every mathematical algorithm, interface component, and user feature resides in its own dedicated, maintainable file:

```text
Project Analyzer
├── package.json                         # Application scripts & dependencies
├── README.md                            # Comprehensive Operations Research documentation
├── DESIGN_SPECIFICATION.md              # Design system and typography specifications
├── lib/                                 # Mathematical & Algorithmic Engine
    │   ├── engine/                      # Algorithmic engine (single feature per file)
    │   │   ├── statisticalDistribution.ts # Abramowitz-Stegun erf, Normal CDF, Acklam Inverse CDF
    │   │   ├── pertEstimation.ts        # 3-Point PERT expected duration, variance, std deviation
    │   │   ├── cpmCalculations.ts       # Forward pass (ES, EF), Backward pass (LS, LF), Floats
    │   │   ├── topologicalLevels.ts     # Topological rank calculation & circular dependency check
    │   │   ├── criticalPathAnalysis.ts  # Critical path tracing & highest variance risk selection
    │   │   ├── pertSolver.ts            # Central solver class orchestrator
    │   │   └── index.ts                 # Clean engine export interface
    │   ├── components/                  # SVG rendering primitives (Task nodes, Bezier arrows, Grid)
    │   │   ├── Pert/                    # SVG Canvas & container
    │   │   ├── task/                    # SVG Task node with ES, EF, LS, LF, Float
    │   │   ├── arrow/                   # Curved & polyline connector arrows
    │   │   └── grid/                    # Canvas background coordinate grid
    │   ├── context/                     # Context providers & task selection dispatchers
    │   ├── types/                       # TypeScript interfaces (TaskInput, Task, PertStyles)
    │   └── utils/                       # Utility re-exports and backward compatibility
├── src/                             # Interactive Web Application
        ├── components/
        │   ├── tasks/                   # Feature: Task Editor & Data Grid
        │   │   ├── taskValidation.ts    # Kahn's algorithm cycle detection & schema validation
        │   │   ├── taskKeyGenerator.ts  # Automatic sequential key and label generator
        │   │   ├── PredecessorPicker.tsx# Multi-select popover for task dependencies
        │   │   ├── TaskTableRow.tsx     # Inline table row editor with validation indicators
        │   │   ├── TaskTableEditor.tsx  # Responsive task data table with sticky headers
        │   │   ├── TaskJsonEditor.tsx   # Direct JSON code editor with formatter
        │   │   ├── TaskImportExport.tsx # File upload, JSON download, and sample preset loaders
        │   │   ├── TaskEditorHeader.tsx # Mode switcher (CPM/PERT) and view tabs (Table/JSON)
        │   │   ├── TasksDrawer.tsx      # Task drawer orchestrator
        │   │   └── index.ts             # Feature export interface
        │   │
        │   ├── analytics/               # Feature: Analytics & Risk Forecasting Dashboard
        │   │   ├── SectionEyebrow.tsx   # Accent section header banner
        │   │   ├── ProjectMetricsCard.tsx # KPI summary (Expected duration, variance, std dev)
        │   │   ├── CriticalPathInspector.tsx # Interactive path sequence chips & variance alert
        │   │   ├── ProbabilityForecaster.tsx # Target deadline probability & confidence duration solver
        │   │   ├── TaskInspector.tsx    # Quick key lookup & node parameter deep dive
        │   │   ├── ScheduleTable.tsx    # Full schedule matrix table (ES, EF, LS, LF, Floats)
        │   │   ├── PertDetails.tsx      # Analytics panel orchestrator
        │   │   └── index.ts             # Feature export interface
        │   │
        │   ├── chart/                   # Feature: Interactive Canvas & Network Diagram
        │   │   ├── useChartPanZoom.ts   # Custom hook managing 2D pan, zoom, scale & bounds
        │   │   ├── ChartToolbar.tsx     # Floating canvas controls (zoom in/out, reset, scale %)
        │   │   ├── ChartExportMenu.tsx  # Vector SVG and high-resolution PNG export actions
        │   │   ├── ChartLegendPopover.tsx # Node anatomy legend (ES, EF, LS, LF, Slack)
        │   │   ├── ChartEmptyState.tsx  # Empty state illustration and call to action
        │   │   ├── PertChart.tsx        # Canvas container orchestrator
        │   │   └── index.ts             # Feature export interface
        │   │
        │   └── styling/                 # Feature: Visual Styling & Theme Customizer
        │       ├── StylingSectionEyebrow.tsx # Styling section accent header
        │       ├── ChartCanvasSettings.tsx # Canvas background color and grid toggles
        │       ├── TaskNodeSettings.tsx # Node dimensions, typography, font size, fills
        │       ├── BorderSettings.tsx   # Border widths, hover states, selection colors
        │       ├── ArrowSettings.tsx    # Arrow width, connector colors, critical path color
        │       ├── LayoutGapSettings.tsx# Horizontal and vertical topological rank spacing
        │       ├── StyleOptions.tsx     # Style panel orchestrator
        │       └── index.ts             # Feature export interface
        │
        ├── constants/                   # Centralized UI strings, design tokens, example datasets
        └── lib/                         # Local storage persistence with schema validation
├── public/                          # Static assets and icons
├── package.json                     # Application dependencies and build scripts
├── vite.config.ts                   # Vite bundler configuration
├── tsconfig.json                    # TypeScript compiler configuration
└── ...
```

---

## Quick Start & Running Instructions

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Execute Vitest test suite
npm run test

# 4. Production build & type-check
npm run build

# 5. Run ESLint code quality checks
npm run lint
```

The application starts locally at `http://localhost:5173/`.

---

## Mathematical Formulations

### 1. 3-Point Beta Distribution Approximations (PERT)

For each activity $i$ with optimistic time $o_i$, most likely time $m_i$, and pessimistic time $p_i$:

$$\text{Expected Duration: } t_{e,i} = \frac{o_i + 4m_i + p_i}{6}$$

$$\text{Task Variance: } \sigma_i^2 = \left(\frac{p_i - o_i}{6}\right)^2$$

$$\text{Standard Deviation: } \sigma_i = \sqrt{\sigma_i^2} = \frac{p_i - o_i}{6}$$

### 2. Forward Pass (Early Event Times)

Traversing the topological ordering from start to finish:

$$ES_i = \max_{j \in \text{Predecessors}(i)} \{ EF_j \}, \quad \text{with } ES_{\text{start}} = 0$$

$$EF_i = ES_i + t_{e,i}$$

Project duration is given by the maximum early finish time:

$$T_{\text{project}} = \max_i \{ EF_i \}$$

### 3. Backward Pass (Late Event Times)

Traversing reverse topological ordering from finish to start:

$$LF_i = \min_{k \in \text{Successors}(i)} \{ LS_k \}, \quad \text{with } LF_{\text{finish}} = T_{\text{project}}$$

$$LS_i = LF_i - t_{e,i}$$

### 4. Float (Slack) Calculations

- **Total Float ($TF$)**: Maximum delay permissible for an activity without delaying the overall project finish:
  $$TF_i = LF_i - EF_i = LS_i - ES_i$$

- **Free Float ($FF$)**: Maximum delay permissible without delaying the early start of any immediate successor:
  $$FF_i = \min_{k \in \text{Successors}(i)} \{ ES_k \} - EF_i$$

- **Criticality Condition**: An activity is on the critical path if and only if:
  $$TF_i = 0$$

### 5. Project Risk & Normal Distribution Analysis

Assuming activities along the critical path $CP = \{a_1, a_2, \dots, a_k\}$ are statistically independent, the Central Limit Theorem dictates that total project completion time follows a Gaussian distribution:

$$\mu_{\text{project}} = \sum_{i \in CP} t_{e,i}$$

$$\sigma_{\text{project}}^2 = \sum_{i \in CP} \sigma_i^2, \quad \sigma_{\text{project}} = \sqrt{\sigma_{\text{project}}^2}$$

For any deadline $T$:

$$Z = \frac{T - \mu_{\text{project}}}{\sigma_{\text{project}}}$$

$$P(\text{Finish} \le T) = \Phi(Z) = \frac{1}{2}\left[1 + \text{erf}\left(\frac{Z}{\sqrt{2}}\right)\right]$$

The error function $\text{erf}(x)$ is computed via the Abramowitz & Stegun polynomial approximation (maximum error $< 1.5 \times 10^{-7}$). Required durations for target probabilities are inverted via Peter J. Acklam's rational approximation.

### 6. Cycle Detection (Kahn's Algorithm)

Topological validity is verified in $O(V + E)$ time:
1. Compute in-degree for all task nodes.
2. Maintain a queue of nodes with in-degree 0.
3. Dequeue nodes, incrementing a processed counter, and decrementing in-degrees of successors.
4. If the count of processed nodes $< |V|$, a circular dependency cycle exists and is flagged to the user.

---

## Interactive Feature Guide

| Feature | Description | Implementation File |
| :--- | :--- | :--- |
| **Interactive Canvas** | Smooth 2D drag-to-pan, mouse wheel zooming (25% - 300%), view reset | [`useChartPanZoom.ts`](file:///d:/OR%20PROJECT/react-pert/src/components/chart/useChartPanZoom.ts) |
| **Diagram Export** | Export high-res PNG or scalable vector SVG diagrams directly to disk | [`ChartExportMenu.tsx`](file:///d:/OR%20PROJECT/react-pert/src/components/chart/ChartExportMenu.tsx) |
| **Node Anatomy Legend** | Detailed visual diagram illustrating ES, EF, LS, LF, Float, and Name | [`ChartLegendPopover.tsx`](file:///d:/OR%20PROJECT/react-pert/src/components/chart/ChartLegendPopover.tsx) |
| **Data Grid Editor** | Interactive table with inline cell editing, dynamic columns, and delete actions | [`TaskTableEditor.tsx`](file:///d:/OR%20PROJECT/react-pert/src/components/tasks/TaskTableEditor.tsx) |
| **Predecessor Picker** | Multi-select popover with real-time dependency toggles and tag pills | [`PredecessorPicker.tsx`](file:///d:/OR%20PROJECT/react-pert/src/components/tasks/PredecessorPicker.tsx) |
| **JSON Code Editor** | Raw JSON array editor with format button and real-time syntax checking | [`TaskJsonEditor.tsx`](file:///d:/OR%20PROJECT/react-pert/src/components/tasks/TaskJsonEditor.tsx) |
| **Import / Export** | Download and upload project files in `.json` format | [`TaskImportExport.tsx`](file:///d:/OR%20PROJECT/react-pert/src/components/tasks/TaskImportExport.tsx) |
| **Sample Presets** | Instant loaders for deterministic CPM and probabilistic PERT benchmarks | [`TaskImportExport.tsx`](file:///d:/OR%20PROJECT/react-pert/src/components/tasks/TaskImportExport.tsx) |
| **Risk Forecaster** | On-time completion probability $P(T \le D)$ and confidence duration quantile | [`ProbabilityForecaster.tsx`](file:///d:/OR%20PROJECT/react-pert/src/components/analytics/ProbabilityForecaster.tsx) |
| **Schedule Matrix** | Full schedule table displaying ES, EF, LS, LF, Float, and Critical status | [`ScheduleTable.tsx`](file:///d:/OR%20PROJECT/react-pert/src/components/analytics/ScheduleTable.tsx) |
| **Task Inspector** | Search by key or click any node to view predecessors, dates, and float | [`TaskInspector.tsx`](file:///d:/OR%20PROJECT/react-pert/src/components/analytics/TaskInspector.tsx) |
| **Theme Customizer** | Customize font sizes, colors, node borders, arrow widths, and layout spacing | [`StyleOptions.tsx`](file:///d:/OR%20PROJECT/react-pert/src/components/styling/StyleOptions.tsx) |
| **Local Persistence** | Automatic localStorage synchronization for tasks, styles, and settings | [`storage.ts`](file:///d:/OR%20PROJECT/react-pert/src/lib/storage.ts) |

---

## Verification & Testing Suite

The computational engine and statistical distributions are validated using Vitest:

```bash
npm run test
```

Test coverage includes:
1. **5-Task Baseline CPM Model**: Verifies early/late times, float, and critical path `1-3-5` (`A-C-E`).
2. **Deterministic Float Validation**: Confirms zero slack for critical activities and positive slack for non-critical activities.
3. **3-Point Beta Calculations**: Validates expected duration $t_e = (o + 4m + p) / 6$, variance, and standard deviation.
4. **Statistical Distribution Bounds**: Verifies Abramowitz-Stegun `normalCdf` limits ($\Phi(0) = 0.5$, $\Phi(3) \approx 0.9987$) and `inverseNormalCdf`.
5. **Cycle Detection**: Validates immediate rejection of circular references ($A \to B \to A$).
6. **Error Enforcements**: Validates detection of duplicate task keys, missing predecessor keys, and invalid 3-point ordering ($o > m$ or $m > p$).

---

## Academic References

1. **Hillier, F. S., & Lieberman, G. J.** (2021). *Introduction to Operations Research* (11th ed.). McGraw-Hill Education.
2. **Taha, H. A.** (2017). *Operations Research: An Introduction* (10th ed.). Pearson.
3. **Wiest, J. D., & Levy, F. K.** (1977). *A Management Guide to PERT/CPM: With GERT/PDM/DCPM and Other Networks*. Prentice-Hall.
4. **Abramowitz, M., & Stegun, I. A.** (1972). *Handbook of Mathematical Functions with Formulas, Graphs, and Mathematical Tables*. National Bureau of Standards Applied Mathematics Series 55.
5. **Acklam, P. J.** (2003). *An algorithm for computing the inverse normal cumulative distribution function*.
