# Operations Research: PERT & CPM Interactive Analysis System

An interactive Operations Research (OR) application and React component library for Critical Path Method (CPM) and Program Evaluation and Review Technique (PERT) analysis with 3-point estimation, probabilistic scheduling, and topological network visualization.

---

## Project Structure

The project code and dependencies reside in the `react-pert/` directory.

```text
OR-Project/
├── README.md              # Project documentation
├── DESIGN (1).md          # Design specifications and token definitions
└── react-pert/            # Application and component library
    ├── lib/               # Core PERT/CPM calculation engine, types, and hooks
    │   ├── components/    # Reusable SVG chart and task node components
    │   ├── context/       # React context and event dispatchers
    │   ├── types/         # TypeScript interfaces and type definitions
    │   └── utlis/         # PERT mathematical engine, algorithms, and tests
    ├── src/               # Web application interface
    │   ├── components/    # Drawers, sidebar, details panel, style options
    │   ├── constants/     # Centralized strings, theme tokens, and examples
    │   └── lib/           # Local storage persistence and schema validation
    ├── package.json       # Project dependencies and script declarations
    └── vite.config.ts     # Vite build and development configuration
```

---

## Quick Start

All scripts must be executed from inside the `react-pert` directory.

### 1. Navigate to Project Directory

```bash
cd react-pert
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will start locally (typically at `http://localhost:5173/`).

### 4. Run Test Suite

```bash
npm run test
```

Executes the Vitest test suite covering CPM, 3-point estimation, probability evaluations, cycle detection, and edge cases.

### 5. Build for Production

```bash
npm run build
```

Performs TypeScript type checking (`tsc -b`) and bundles the application and library via Vite into `dist/`.

### 6. Run Linter

```bash
npm run lint
```

Executes ESLint across all TypeScript and React files with zero allowed warnings.

---

## Core Capabilities

### 1. Deterministic CPM Mode
- Calculates forward pass: Early Start (ES) and Early Finish (EF).
- Calculates backward pass: Late Start (LS) and Late Finish (LF).
- Computes Total Float (slack) and Free Float per task.
- Traces single and multiple critical paths where Total Float equals zero.

### 2. Probabilistic 3-Point PERT Mode
Accepts three time estimates per task:
- Optimistic time (o)
- Most likely time (m)
- Pessimistic time (p)

Engine calculates:
- Expected duration: `te = (o + 4m + p) / 6`
- Variance: `variance = ((p - o) / 6)^2`
- Standard deviation: `stdDev = sqrt(variance)`

### 3. Project-Level Probability Analysis
- Aggregates expected project duration across critical path tasks.
- Sums task variances along the critical path to derive project variance and standard deviation.
- Calculates completion probability for any user-specified deadline using a self-contained Abramowitz and Stegun error function (`erf`) implementation of the standard Normal CDF.
- Calculates required schedule duration for any target confidence level (e.g. 90%, 95%, 99%) using Acklam's inverse normal cumulative distribution algorithm.

### 4. Multiple Critical Path Resolution
When multiple critical paths are detected, the system identifies all valid paths, calculates the variance of each path, and selects the path with the highest variance for project risk calculations, noting the selection in the analysis output.

### 5. Input Validation
Engine-level validation enforces:
- `0 <= optimistic <= mostLikely <= pessimistic`
- Non-negative finite numbers
- Kahn's algorithm cycle detection (rejects circular dependencies)
- Missing predecessor detection
- Duplicate task key prevention

### 6. Interactive Visualization & Accessibility
- Pan and zoom canvas with mouse drag, wheel scroll, and zoom controls.
- Real-time path highlighting when selecting any task node.
- Dual mode editor (Table grid and raw JSON) with instant synchronization.
- JSON Import and Export for sharing project networks.
- Local storage persistence for tasks, custom styles, and deadline targets.
- Responsive design with collapsible mobile overlay sidebar.
- WCAG AA compliant color contrasts and full `<label htmlFor>` accessibility.

---

## Mathematical Foundations

### 1. Beta Distribution Approximations (PERT)

For each task $i$:

$$t_{e,i} = \frac{o_i + 4m_i + p_i}{6}$$

$$\sigma_i^2 = \left(\frac{p_i - o_i}{6}\right)^2$$

$$\sigma_i = \sqrt{\sigma_i^2}$$

### 2. Critical Path Pass Scheduling

Forward Pass:
- $ES_i = \max_{j \in Pred(i)} \{ EF_j \}$ (with $ES_{start} = 0$)
- $EF_i = ES_i + t_{e,i}$

Backward Pass:
- $LF_i = \min_{k \in Succ(i)} \{ LS_k \}$ (with $LF_{finish} = EF_{finish}$)
- $LS_i = LF_i - t_{e,i}$

Floats:
- $\text{Total Float}_i = LF_i - EF_i = LS_i - ES_i$
- $\text{Free Float}_i = \min_{k \in Succ(i)} \{ ES_k \} - EF_i$

### 3. Project-Level Risk Metrics

For critical path $CP = \{t_1, t_2, \dots, t_k\}$:

$$\mu_{\text{project}} = \sum_{i \in CP} t_{e,i}$$

$$\sigma_{\text{project}}^2 = \sum_{i \in CP} \sigma_i^2$$

$$\sigma_{\text{project}} = \sqrt{\sigma_{\text{project}}^2}$$

### 4. Completion Probability

Given a target deadline $T$:

$$Z = \frac{T - \mu_{\text{project}}}{\sigma_{\text{project}}}$$

$$P(\text{Finish} \le T) = \Phi(Z) = \frac{1}{2} \left[ 1 + \text{erf}\left(\frac{Z}{\sqrt{2}}\right) \right]$$

The error function is computed via numerical polynomial approximation (Abramowitz & Stegun 7.1.26):

$$\text{erf}(x) \approx 1 - (a_1 t + a_2 t^2 + a_3 t^3 + a_4 t^4 + a_5 t^5) e^{-x^2}, \quad t = \frac{1}{1 + p x}$$

---

## Library Usage

`react-pert` can be embedded directly into React applications.

### Basic Implementation

```tsx
import React from "react";
import { Pert, type TaskInput } from "react-pert";

const tasks: TaskInput[] = [
  { key: "1", text: "Design Architecture", optimistic: 2, mostLikely: 4, pessimistic: 6 },
  { key: "2", text: "Core Engine", optimistic: 3, mostLikely: 5, pessimistic: 9, dependsOn: ["1"] },
  { key: "3", text: "Interface", optimistic: 1, mostLikely: 2, pessimistic: 5, dependsOn: ["1"] },
  { key: "4", text: "Testing", optimistic: 2, mostLikely: 3, pessimistic: 4, dependsOn: ["2", "3"] },
];

export default function ProjectSchedule() {
  return (
    <div style={{ width: "100%", height: "600px" }}>
      <Pert
        tasks={tasks}
        styles={{
          taskSize: 90,
          chartBackground: "#ffffff",
          criticalColor: "#ff9147",
        }}
        onSelect={(task) => {
          console.log("Selected task:", task.text, "Float:", task.totalFloat);
        }}
      />
    </div>
  );
}
```

### Using the Calculation Engine Programmatically

```ts
import Pert from "react-pert/utlis/Pert";

const engine = new Pert([
  { key: "A", text: "Requirements", duration: 3 },
  { key: "B", text: "Implementation", duration: 5, dependsOn: ["A"] },
  { key: "C", text: "Deployment", duration: 2, dependsOn: ["B"] },
]);

const results = engine.solve();

console.log("Duration:", results.projectDuration);
console.log("Critical Paths:", results.criticalPaths);
```

---

## Quality Assurance & Verification

- Test coverage executed via Vitest with 11 test suites.
- Validates 5-task CPM baseline, 3-point mathematical calculations, normal CDF limits, cycle prevention, missing keys, and duplicate keys.
- Code style and TypeScript typing validated with ESLint (`--max-warnings 0`) and TypeScript compiler (`tsc -b`).