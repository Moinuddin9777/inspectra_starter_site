# Web Component Inspector — Feature Architecture Guide

> **Audience:** Engineers and technical reviewers who need a precise, feature-by-feature understanding of how the Web Component Inspector (WCI) VS Code extension is built.
>
> **Scope:** This guide documents the system *as it exists in the source tree* (`packages/ext-web-component-inspector`). Where a capability is partially implemented, dormant, or planned, that status is called out explicitly so the document does not overstate behavior.
>
> **Companion document:** [`Feature-Flow-Diagrams.md`](./Feature-Flow-Diagrams.md) contains the Mermaid sequence/flow diagrams referenced throughout.

---

## Table of Contents

1. [Inspector Tab](#1-inspector-tab)
2. [Cookies Tab](#2-cookies-tab)
3. [Console Tab](#3-console-tab)
4. [Network Tab](#4-network-tab)
5. [Performance Tab](#5-performance-tab)
6. [Code Coverage Tab](#6-code-coverage-tab)
7. [Debug Tab](#7-debug-tab)
8. [Preview Panel](#8-preview-panel)
9. [Accessibility](#9-accessibility)
10. [Settings](#10-settings)
11. [System Architecture](#11-system-architecture)

---

## How to read this guide

Every feature in WCI rides on the **same three-tier transport**, so it helps to internalize it once before diving into individual tabs:

| Tier | Where it runs | Bundle | Responsibility |
| --- | --- | --- | --- |
| **Browser Agent** | Inside the user's app (the proxied page loaded in the Preview iframe) | `dist/agent.js` | Introspect the DOM/framework, intercept console/network/cookies, paint overlays, send `agent:*` messages |
| **Extension Host** | VS Code Node.js process | `dist/extension.js` | WebSocket hub, HTTP proxy + script injection, message routing, VS Code integration (tree view, Problems panel, commands), filesystem/git/test-runner work |
| **DevTools UI** | A standalone browser page served at `/__devtools__` | `dist/devtools.js` (+ a legacy inline IIFE) | React panels for every tab, the Preview iframe host, and the `window.__wci_cmd()` command bridge |

The two recurring data paths are:

- **Command path (UI → Agent):** `window.__wci_cmd(command, args)` → WebSocket `viewer:command` → `handleWebviewCommand()` (`src/core/commandHandler.ts`) → `host:*` message → agent `handleHostMessage()` (`src/agent/host-handlers.ts`).
- **Event path (Agent → UI):** agent `sendMessage({ type: 'agent:*' })` → `handleAgentMessage()` (`src/core/message-handler/message-router.ts`) → `wsServer.sendToViewers({ type: 'extension:*' })` → IIFE bridge dispatches `CustomEvent('wci:*')` (`src/core/scripts/websocket.ts`) → React hook updates state.

Keep this mental model handy; each tab section below only documents what is *specific* to that feature.

---

## 1. Inspector Tab

**UI location:** `src/devtools/inspector/`
**Agent location:** `src/agent/` (tree builder, overlays, adapters)

The Inspector is the flagship feature: a Flutter-DevTools-style component tree on the left and a multi-tab detail panel on the right, kept in two-way sync with the live application.

> **Why it exists — and how it differs from Chrome DevTools.** Chrome's *Elements* panel shows the **rendered DOM** — a tree of `<div>`s and `<span>`s, not your `<UserCard>` or `<NavBar>` components. The React/Vue/Svelte browser extensions *do* show components, but they live in the browser, detached from your editor: they can't reliably jump to the exact source file and line, and any prop you tweak is lost the moment you switch back to code. WCI reconstructs the **framework component tree** (not the DOM), ties every node back to its `fileName:line:column`, mirrors the same tree into the VS Code sidebar, lets you **edit props live** against the running app, and overlays an accurate box model — all without leaving the editor or installing a browser extension. The problem being solved is the constant context-switch between "the component I see in the browser" and "the file I edit in my IDE."

### 1.1 Component tree construction

The tree is built **in the browser agent** by `buildComponentTree()` in `src/agent/tree-builder.ts`:

- It scans `document.querySelectorAll('*')` with a hard cap of **500 nodes**.
- WCI's own injected elements (overlays, tooltips) are excluded via `isSkippableElement()` (`src/core/agent/dom-helpers.ts`) — they carry a `data-wci-injected` marker.
- Zero-size elements are skipped.
- For each element, `getAdapter()` (`src/core/agent/adapters.ts`) resolves the active framework adapter and `buildTreeNode()` produces a `ComponentNode` carrying `name`, `props`, `source`, `bounds`, `layout`, and inline `a11yIssues`.
- `attachToParent()` walks up the DOM, using a `WeakMap` (`elementToId`) to nest children under the correct parent. A synthetic root `{ id: 'wci-root', name: 'App' }` anchors the tree.
- Node IDs are assigned by `getNodeId()` as `wci-{counter}`, with bidirectional maps `elementToId` / `nodeIdToElement` so the host can later ask the agent to act on a specific node.

**When the tree rebuilds:**

- Once on WebSocket connect (`init()` in `src/agent/browser-agent/index.ts`).
- `pollForTree()` retries every 500 ms up to 10 times if the first scan is empty (covers React hydration timing).
- A `MutationObserver` on `document.body` with an **800 ms debounce** rebuilds on real structural change. `structuralHash()` (`src/agent/browser-agent/dom-observer.ts`) suppresses noise from scroll/layout-only mutations.

The `ComponentNode` shape is defined in `src/shared/protocol.ts` and shared between agent and host (`countComponentNodes()` is the shared recursive counter, guarded to `MAX_COUNT_DEPTH = 1000`).

### 1.2 Two destinations for the tree

A single `agent:tree-update` message feeds **two** UIs:

1. **VS Code sidebar** — `ComponentTreeProvider` (`src/views/componentTreeProvider.ts`) implements `vscode.TreeDataProvider`, rendering framework icons, inline props, source in the description/tooltip, and an accessibility warning icon when a node has `a11yIssues`.
2. **DevTools Inspector panel** — relayed to viewers as `extension:tree`, **throttled to at most one update per second** (`throttledTreeRelay` in the message router) to keep the React UI responsive.

### 1.3 React UI structure

| File | Component | Role |
| --- | --- | --- |
| `InspectorTab.tsx` | `InspectorTab` | Split layout: tree panel, drag handle, detail panel; owns `selectedId` |
| `TreePanel.tsx` | `TreePanel` | Search filter + scroll + empty state |
| `TreeNode.tsx` | `TreeNode` | Memoized recursive row; emits hover/select |
| `DetailPanel.tsx` | `DetailPanel` | Tabbed: Props / Layout / Computed / Source |
| `PropsSection.tsx` | `PropsSection` | Editable props, plus state/handlers/accessibility |
| `LayoutSection.tsx` | `LayoutSection` | Nested box-model diagram |
| `ComputedSection.tsx` | `ComputedSection` | Computed/matched styles |
| `SourceSection.tsx` | `SourceSection` | File / line / column |

Tree and detail data arrive through `useWebSocket()` (`src/devtools/hooks/useWebSocket.ts`), which listens for `wci:tree` / `wci:detail` / `wci:state` CustomEvents and also reads `window.__wci_last_*` caches to avoid a mount-time race.

### 1.4 Bidirectional sync

**Browser → DevTools (select mode / click):**

1. User enables select mode (Preview toolbar button or `wci.toggleSelectMode` command).
2. `host:toggle-select-mode` → `enableSelectMode()` (`src/agent/overlays/select-mode.ts`) installs a crosshair cursor and capture-phase listeners.
3. Clicking an element emits `agent:component-selected` with an enriched payload (props, layout, bounds, source, a11y, computed styles).
4. The host forwards it as `extension:component-detail` → `wci:detail`; `InspectorTab` updates `selectedId` from `detail.nodeId`.

**DevTools → Browser (tree selection / hover):**

| User action | Command | Host message | Agent handler |
| --- | --- | --- | --- |
| Click a tree row | `selectComponent` | `host:select-component` | `handleSelectComponent()` — scrolls element into view + flash overlay |
| Hover a tree row | `highlightComponent` | `host:highlight-component` | `handleHighlightComponent()` → `createTreeHighlightOverlay()` |
| Mouse leaves row | `highlightComponent(null)` | `{ nodeId: null }` | Removes the tree-hover overlay |

### 1.5 Live prop editing

`PropsSection.tsx` renders editable rows (`PropRowItem`); Enter or blur commits. The command path is:

```
cmd('updateProp', [nodeId, propName, newValue])
  → host:update-prop
  → handleUpdateProp() (src/agent/host-handlers.ts)
```

Apply logic (`src/agent/prop-edit.ts`):

- **React:** `mutateFiberProps()` → `tryOverrideProps()` (via the React DevTools hook) → `forceUpdate()`, with `tryDomFallback()` as a backstop.
- **Vue/Svelte:** `adapter.updateProp()` then a DOM fallback.

The result is reported back as an `agent:console` info/warn entry so the user gets feedback.

### 1.6 Box model display

- **In the page:** `src/agent/overlays/chrome-overlay.ts` draws an SVG box model (`createChromeOverlay()` with margin/border/padding/content layers + a dimension label and optional Chrome-style tooltip). Tree hover uses `createTreeHighlightOverlay()` (same minus tooltip).
- **In the UI:** `LayoutSection.tsx` renders the nested margin → border → padding → content diagram from `detail.layout` / `detail.bounds` (computed by `computeLayout()` in `dom-helpers.ts`).

### 1.7 Source navigation (click-to-source)

Multiple routes converge on the extension host opening the file:

1. **Select-mode click** carrying React `_debugSource` → host opens it via `openSourceFile()`, or runs `rankedTextSearch()` (`src/core/message-handler/text-search.ts`, `MIN_TEXT_SEARCH_LEN = 5`) to find the definition for clicked text.
2. **Ctrl+right-click context menu** (`src/agent/overlays/context-menu.ts`) → `agent:open-source` or `agent:find-text-definition`.
3. **Source tab / sidebar item** → the `wci.goToSource` command → `openSourceFile()`.

`openSourceFile()` also re-focuses the editor window using the OS protocol handler (macOS `open`, Windows `start`, Linux `xdg-open`).

### 1.8 Framework detection (React / Vue / Svelte)

`getAdapter()` (`src/core/agent/adapters.ts`) tries each adapter's `detect()` and caches the winner:

| Framework | Detection signals | Instance / source |
| --- | --- | --- |
| **React** | `__REACT_DEVTOOLS_GLOBAL_HOOK__`, `[data-reactroot]`, `__reactFiber$*` keys | Walks the fiber chain (`getComponentFiber()`), filters internals; source from `fiber._debugSource` |
| **Vue** | `[data-v-app]`, `__vue__` / `__vueParentComponent` | `getVueInstance()`; source from `$options.__file` / `type.__file` |
| **Svelte** | `__svelte_meta` on elements | `el.__svelte_meta`; source from `instance.loc.file` |

To make React's hook reliable, the proxy injects an **early `<head>` patch** (see [§11.3](#113-proxy--script-injection)) that ensures `__REACT_DEVTOOLS_GLOBAL_HOOK__.inject()` captures renderers before app code runs.

---

## 2. Cookies Tab

**UI location:** `src/devtools/cookies/`
**Agent handlers:** `src/agent/host-handlers.ts`

> **Why it exists — and how it differs from Chrome DevTools.** Chrome's *Application → Cookies* view is perfectly capable, but it only exists inside Chrome's DevTools, in a separate window from your code. While building an app you frequently need to inspect, fake, or clear an auth token, a session id, or a feature-flag cookie and immediately re-test — and doing that means leaving the editor. WCI brings the same-origin cookie store of the app you're actively developing **into the editor's DevTools page**, with search/set/delete, so you can manipulate cookies in the same place you write code. The trade-off is identical to any `document.cookie`-based tool: **`HttpOnly` cookies are invisible** (Chrome can show them because it reads them at the network layer; WCI reads them from the page).

### 2.1 Why cookies go through the agent

The DevTools page lives on a *different origin* than the inspected app, so it cannot read the app's cookies directly. Cookie access therefore happens **inside the injected browser agent**, which runs at the app's origin and uses the standard `document.cookie` API. This means only cookies visible to that document are accessible — **`HttpOnly` cookies are not reachable** (a fundamental `document.cookie` limitation).

`handleHostMessage()` implements three commands:

| Host message | Behavior |
| --- | --- |
| `host:get-cookies` | Reads `document.cookie`, replies `agent:cookies-data { cookies }` |
| `host:set-cookie` | `document.cookie = name=encodeURIComponent(value); path=/; max-age=31536000`, then re-sends cookies |
| `host:delete-cookie` | Expires via `name=; path=/; max-age=0`, then re-sends cookies |

### 2.2 UI and CRUD

`CookiesTab.tsx` has three sections (Search, Set/Update, All Cookies). State lives in `useCookies.ts`:

| Operation | UI function | Command |
| --- | --- | --- |
| List | `refreshCookies()` / auto-load on mount | `getCookies` |
| Search by name | `searchCookie()` (checks cache first) | `getCookies` |
| Create / update | `saveCookie()` | `setCookie [name, value]` |
| Delete | `deleteCookie()` | `deleteCookie [name]` |

Helpers: `parseCookies()` splits the raw `document.cookie` string into `{ name, value }` pairs; `isValidToken()` heuristically flags JWT-like / hex / mixed-alnum values so the "All Cookies" list highlights interesting tokens. After a write, the UI reloads the preview iframe and refreshes the list after ~1.5 s.

### 2.3 Data flow

```
[Agent] document.cookie  --agent:cookies-data-->
[Host]  message-router    --extension:cookies-data-->
[UI]    websocket.ts       --wci:cookies-data CustomEvent--> useCookies → CookiesTab
```

> **Type note:** `extension:cookies-data` is used at runtime but is not yet declared in the `ExtensionMessage` union in `protocol.ts` — a known type-coverage gap, not a functional one.

---

## 3. Console Tab

**UI location:** `src/devtools/console/`

The Console aggregates logs from **three sources** into one panel.

> **Why it exists — and how it differs from Chrome DevTools.** When you run a modern dev server (Next.js, Vite, etc.), your logs are split across **two unrelated places**: the browser console (client-side `console.*`) and the terminal where the dev server prints SSR/build output. Chrome's Console only ever sees the first. Debugging a hydration mismatch or an SSR error means mentally stitching together the browser tab and the terminal. WCI **merges both streams** — intercepted browser console output *and* forwarded dev-server stdout/stderr (tagged `[Server]`) — into a single searchable, level-filtered panel inside the editor, so a server-side error and the client warning it triggers appear together in chronological context.

### 3.1 Log sources

1. **Browser app logs** — `interceptConsole()` (`src/agent/browser-agent/console-interceptor.ts`) wraps `console.log/warn/error`, formats args (`JSON.stringify` for objects), skips WCI's own `[WCI …]` messages, and emits `agent:console { level, message, timestamp }`. `console.log` maps to level `info`. **`console.info` and `console.debug` are not intercepted** and therefore do not appear.
2. **Dev-server process logs** — `serverLauncher.ts` pipes the child process stdout/stderr into `forwardServerLog()` (`src/server/logForwarder.ts`), which strips ANSI codes, debounces ~80 ms, groups pino-pretty / HTTP-summary lines, infers a level (`determineLogLevel()` — 4xx→warn, 5xx→error, stderr→error), and emits `extension:console` with the message prefixed `[Server]`. These bypass the agent entirely and carry **no timestamp**.
3. **Internal IIFE logs** — `addLog()` (`src/core/scripts/logger.ts`) dispatches `wci:log` for connection/disconnect status messages.

### 3.2 UI behavior (`useConsole.ts` / `ConsolePanel.tsx`)

- Buffer cap: **`MAX_ENTRIES = 200`**.
- Level filter dropdown: All / Info / Warn / Error (no Debug). Any non-warn/non-error level counts as **info**.
- Search: case-insensitive substring match with `<HighlightMark>` highlighting and Enter-to-navigate between matches (`activeMatchIndex of count`).
- Auto-scroll to bottom unless the user has scrolled up (30 px threshold).
- `[Server]` entries render with preformatted whitespace, dimmed color, and no timestamp.
- Copy/Clear are UI-only (Clear does not clear the agent's console).

### 3.3 Data flow

```
[App]    console.* → interceptConsole → agent:console → extension:console → wci:console ┐
[Server] stdout/stderr → forwardServerLog → extension:console (─[Server]─, no agent hop) ┼→ useConsole → ConsolePanel
[IIFE]   addLog → wci:log ───────────────────────────────────────────────────────────────┘
```

---

## 4. Network Tab

**UI location:** `src/devtools/network/`
**Agent capture:** `src/agent/network.ts`

> **Why it exists — and how it differs from Chrome DevTools.** Chrome's *Network* panel is excellent but lives in the browser and shows raw transport-level requests for whichever tab is focused. While developing, the question you actually want answered is "what API call did *this* component just make, and what came back?" — and answering it means leaving the editor for the browser. WCI intercepts `fetch`/XHR **from inside the running app** via the agent and renders them in an in-editor panel with method/status/type filters and a request/response detail drawer, so network activity sits next to the component tree and source you're editing. (It is request-level, not a full transport waterfall — the timing bar is intentionally simplified.)

### 4.1 Interception (agent)

`installNetworkInterceptor(sendMessage)` is called on WebSocket open and monkey-patches both transports:

- **`fetch`** — saves the original, wraps it; `extractFetchMeta()` captures method/URL/request headers+body; on success it clones the response and reads the body for text-like content types, **truncating at 100 KB** (`MAX_BODY_SIZE`); on failure it emits status `0` with an `error` and re-throws.
- **`XMLHttpRequest`** — patches `open` / `setRequestHeader` / `send`, stashing metadata on the instance and building an entry on `loadend` from `status`, `getAllResponseHeaders()`, and `responseText`.

`emitEntry()` pushes to an agent-side buffer with **500-entry FIFO eviction**, and (when not paused) sends `agent:network-entry`.

### 4.2 Pause / resume / clear

Handled by `host:network-pause` / `host:network-resume` / `host:network-clear`. When paused, the agent **still captures locally** but stops emitting over the WebSocket; clear empties the agent buffer.

### 4.3 UI (`useNetwork.ts` / `NetworkTab.tsx`)

- A **second 500-entry FIFO** cap on the React side; the UI reassigns IDs (`wci-{ts}-{counter}`) to avoid collisions after agent reloads.
- **Filters:** toolbar search (URL/method), plus Status (2xx/3xx/4xx/5xx/failed), Method (GET…HEAD), and Type (json/html/js/css/image/font/xml/text/other, via `normalizeType()`).
- **Detail drawer** (resizable) with tabs Overview / Headers / Request / Response:
  - Overview: URL, method, status, type, sizes (`formatBytes()`), timing, and a simplified `TimingBar` (a 50/50 placeholder, **not** a real waterfall).
  - Headers: table or raw JSON of request + response headers.
  - Request/Response: Pretty (JSON `syntaxHighlight()`) or Raw.
- Font-size slider and Pause/Clear controls.

### 4.4 Data flow

```
[App] fetch/XHR → network.ts emitEntry → agent:network-entry
   → extension:network-entry → wci:network-entry → useNetwork → NetworkTab (table + drawer)
```

---

## 5. Performance Tab

**UI location:** `src/devtools/performance/`
**Agent capture:** `src/agent/performance.ts`

> **Why it exists — and how it differs from Chrome DevTools.** Chrome's *Performance* panel records low-level flame charts of scripting/layout/paint, and the React Profiler captures commit-by-commit timelines — both powerful, both requiring you to record a trace and interpret it in the browser. But the single most common React performance question is far simpler: **"what re-rendered, how many times, and was that render wasted?"** WCI answers exactly that. By tapping the React DevTools commit hook it surfaces per-component render counts, timing, and a *wasted-render trigger* (props / state / context / parent) as plain KPIs and a timeline inside the editor — no trace recording, no flame-chart reading. It is deliberately narrower and more actionable than Chrome's general-purpose profiler.

### 5.1 How render data is captured

Capture is **React-only** and uses the **React DevTools global hook**, *not* the React `<Profiler>` API:

1. `hookReactRenderers()` patches `__REACT_DEVTOOLS_GLOBAL_HOOK__.inject` to catch current and future renderers.
2. `patchRenderer()` wraps `onCommitFiberRoot`; on every commit (while tracking) it calls `walkFiberTree()`.
3. `walkFiberTree()` recurses the fiber tree, and for user-defined components records `nodeId` (`getFiberId()`), `componentName` (`getFiberName()`), and `duration` from `fiber.actualDuration` (populated when DevTools profiling data is present). Data accumulates in `renderMap`.
4. A `setInterval` flushes every **2000 ms**, emitting only renders new since the last flush as `agent:performance { renders, events, timestamp }`.

Public API: `startPerformanceTracking()`, `stopPerformanceTracking()`, `clearPerformanceData()`, `isPerformanceTracking()`.

### 5.2 Wasted-render detection

`detectTrigger()` compares a fiber to `fiber.alternate`:

- **state** — `memoizedState` reference changed.
- **props** — `memoizedProps` reference changed; a shallow key diff (ignoring `children`) decides whether real props changed or it was a `parent` re-render.
- **context** — `fiber.dependencies?.firstContext` present.
- Default → `parent`.

`isWastedRender()` returns true when the trigger is `parent` — i.e. the component re-rendered only because an ancestor did, without its own prop/state/context change. Trigger union: `props | state | context | parent | unknown`.

### 5.3 KPIs and UI

Computed in `usePerformance.ts`:

| KPI | Computation |
| --- | --- |
| Total Renders | Σ `renderCount` |
| Wasted Renders | Σ `renderCount` where `wasted` + percentage |
| Avg Render Time | `totalTime / totalRenders` |
| Slowest Component | Max `lastDuration` among components seen within the last 5 s |

Severity coloring uses ~60 fps budgets: wasted % (>30 bad, >10 warn), render time (>16 ms bad, >5 ms warn). A timeline shows up to **100** events (`getSpeed()`: fast ≤5 ms / moderate ≤16 ms / slow >16 ms). The sortable table lists Component, Renders, Total/Avg/Last time, and Trigger. **Recording is on-demand** — `wci:performance` events are ignored unless Record is toggled on. Export downloads `{ renders, timeline }` as JSON.

> **Type note:** `AgentPerformanceMessage` in `protocol.ts` documents `renders` but omits the `events` array the agent actually sends and the UI consumes.

---

## 6. Code Coverage Tab

**UI location:** `src/devtools/code_coverage/` (with `components/`, `hooks/`, `host/`, `shared/`)

Unlike Performance, Code Coverage is almost entirely **extension-host-side** — it touches the filesystem, git, and test subprocesses. The browser agent is not involved.

> **Why it exists — and how it differs from Chrome DevTools.** Chrome *does* have a "Coverage" tab, but it measures **unused CSS/JS at runtime** — not test coverage. Test coverage normally means: run a CLI (`jest --coverage`, `vitest --coverage`, …), wait for an HTML report to be generated, open it in a browser, and then mentally map files back to your editor. WCI collapses that loop: it **runs or loads** coverage, parses Istanbul / LCOV / Cobertura into one model, and renders KPIs, a donut, a persisted trend chart, risk-scored hotspots, and **per-line source highlighting** inside the editor. Crucially it is **git-branch aware** — switching branches re-runs coverage — which no browser-based tool offers, because coverage is fundamentally about *your repository*, not the page in a tab.

### 6.1 Format parsing (`host/coverage.parser.ts`)

All formats normalize to a shared `CoverageReport` schema:

- `parseIstanbulJson()` — aggregates `statementMap`/`s`, `branchMap`/`b`, `fnMap`/`f`; paths made workspace-relative.
- `parseLcov()` — parses `SF:`/`DA:`/`FN:`/`FNDA:`/`BRDA:` records split on `end_of_record`.
- `parseCoberturaXml()` — regex-based (no XML library); reads `line-rate`/`branch-rate` and per-line/per-method data.
- `autoDetectAndParse()` — sniffs JSON → Istanbul, XML → Cobertura, `SF:`+`end_of_record` → LCOV.
- `buildReport()` aggregates totals and builds a folder tree (`buildFolderTree()` / `aggregateFolder()`).

### 6.2 File discovery

`findCoverageFiles()` checks, in order: `coverage/coverage-final.json`, `coverage/lcov.info`, `coverage/cobertura-coverage.xml`, `coverage/coverage.xml`, `.nyc_output/coverage-final.json`, `lcov.info`, `coverage-final.json`, `coverage/clover.xml`. `loadCoverageFromWorkspace()` parses the **first** match.

> Note: `clover.xml` is in the search list but there is no dedicated Clover parser; it only works if `autoDetectAndParse` can read it as Cobertura.

### 6.3 Test runner (`host/coverage.runner.ts`)

`detectTestFramework()` inspects `package.json` and picks a command (priority: `test:coverage` script → `coverage` script → vitest → jest/react-scripts/next → mocha+nyc → karma). `runCoverage()` spawns it (120 s timeout), streams progress lines, then loads the generated coverage files. If no framework is detected it falls back to loading existing files with a warning.

### 6.4 Git integration (`src/core/git.ts`)

- `getGitInfo()` attaches `gitBranch` / `gitCommit` to every coverage payload.
- `sendGitBranches()` lists branches (`extension:git-branches`).
- `switchGitBranch()` validates the name, checks out, auto-pulls, **then re-runs coverage** for the new branch.
- `pullGitBranch()` runs `git pull` (`extension:git-pull-result`).

### 6.5 UI dashboard

| Concern | Where |
| --- | --- |
| KPI cards (6, with SVG rings) | `KpiGrid.tsx` |
| Line-coverage donut | `DonutChart.tsx` |
| Trend chart | `TrendChart.tsx` — inline SVG, history in `localStorage` key `wci-cov-history` (max 100), `overall = 50% line + 30% branch + 20% method`, 80% threshold line, 2–12 month range |
| Branch selector | `GitBranchContext.tsx` |
| File grid / risk hotspots | `FileTable.tsx` / `HotspotsTable.tsx` |
| Per-file source + methods | `DetailDrawer.tsx` |

**Hotspot risk score** (client-side, top 20):

```
risk = (100 − lineCov)*0.5 + (100 − branchCov)*0.3 + min(uncoveredLines, 200)*0.1
```

with `riskLevel`: high >50, med >25, else low.

### 6.6 Host vs UI split & messages

The summary payload (`extension:coverage-data`) carries file-level aggregates only; full per-file detail (`sourceLines`, `lineDetail`, `methods`, `branches`) is fetched on demand via `getCoverageFile` → `extension:coverage-file-detail`. Commands: `loadCoverage`, `runCoverage`, `getCoverageFile`, `getGitBranches`, `switchGitBranch`, `pullGitBranch`. The `DetailDrawer` colors lines by hit count (`>0` covered, `0` uncovered, `undefined/-1` not executable).

> **Type note:** the `extension:coverage-*` and `extension:git-*` messages are string literals in the host/UI code and are not declared in `protocol.ts`.

---

## 7. Debug Tab

**UI location:** `src/devtools/debug/`
**CDP services:** `src/cdp/`
**Host orchestration:** `src/extension.ts`

The Debug tab is an **editor + panels** surface (file explorer, Monaco editor with a breakpoint gutter, and a bottom panel of Frames / Variables / Watch / Breakpoints / Console). By design, the running app stays in the Preview iframe — the Debug tab does **not** host a second live-app surface.

> **Why it exists — and how it differs from Chrome DevTools.** Today, debugging a full-stack app is split across two tools that don't talk to each other: you debug client-side JavaScript in **Chrome DevTools** (Sources panel) and server-side Node/SSR code in the **VS Code debugger** — and neither sees the other's breakpoints or the live UI. WCI attaches the **Node Inspector (CDP)** to the exact dev-server process that backs the live preview, resolves breakpoints through source maps to your *original* files (even for not-yet-loaded scripts, via a line-0 "trap" strategy), and keeps the running app visible in the Preview panel. The problem solved is unifying "edit code", "set a breakpoint", and "see the live app" on one screen. (True client-side V8 debugging — the *Inspectra V2 BrowserTab* concept — is documented but not yet wired up; see [§7.6](#76-inspectra-v2-browsertab--status).)

### 7.1 Runtime modes (`wci.debug.runtime`)

| Mode | Behavior |
| --- | --- |
| **`node`** (default) | Attaches the Node Inspector (CDP) to the dev-server process backing the Preview iframe |
| **`browser`** | **Disabled** — `startBrowserDebug()` returns a failure rather than launching a second app instance |
| **`dual`** | Tries browser (fails) then node (succeeds); reports a warning on partial attach |

`wci.debug.verboseLogs` gates detailed CDP pipeline logging; `webComponentInspector.debugPort` (default 9222) is documented for Chrome attach, though Node probing actually uses 9229/9230/9228.

### 7.2 Node Inspector attachment

`attachNodeInspector(port)` (`src/extension.ts`) connects `chrome-remote-interface` to the Node `--inspect` port and:

1. `DebugService.enable()` registers event handlers **before** `Debugger.enable()`.
2. `Runtime.enable()`.
3. `syncNodeBreakpoints()` pushes all existing `vscode.debug.breakpoints` to CDP.
4. `resolvePendingNodeBreakpoints()` polls up to 3 s for `scriptParsed`.
5. `invalidateNextServerRouteCache()` clears the Next.js `.next/server` require cache.
6. `sendNodeDebugNavigationMode(true)` + `requestDebugReload()` force SSR navigations and a hard reload so server-side breakpoints can fire.

The inspect port is discovered from the dev server (`injector.inspectPort`) or probed (`probeInspectPort()` against `/json/version`).

### 7.3 Breakpoint strategies (`src/cdp/DebugService.ts`)

`DebugService` maintains maps for file breakpoints, line-0 "trap" breakpoints, parsed scripts, and source-map reverse mappings. Two strategies work together:

1. **`scriptParsed` resolution (primary):** when a script loads, pending `filePath:line` breakpoints are matched by URL suffix or source-map `sources`, translated editor-line → compiled-line via `originalToGenerated()`, snapped to a valid location with `getPossibleBreakpoints()`, and set via `Debugger.setBreakpoint`.
2. **Line-0 trap (fallback):** for scripts not yet loaded (or after HMR), `setBreakpointByUrl({ urlRegex, lineNumber: 0 })` traps the next load; `handleTrapPause()` resolves the real breakpoints while paused and then **always resumes** in a `finally`. A safety valve auto-resumes unexpected line-0 pauses to avoid hanging SSR. `node_modules`, webpack/turbopack runtime, and eval frames are blackboxed.

### 7.4 Source maps (`src/cdp/sourceMap.ts`)

A dependency-free Base64-VLQ decoder. `originalToGenerated()` maps editor lines to compiled lines for setting breakpoints; `generatedToOriginal()` maps a pause location back to the original file/line for the UI.

### 7.5 Pipeline & UI sync

```
Connect → useDebug.attachDebugger → startDebug([{ mode:'node' }])
  → attachNodeInspector → DebugService events
     cdp:paused → wci:cdp-paused (frames mapped to original file/line, editor opens)
     cdp:resumed / cdp:console / cdp:breakpoint-* → corresponding wci:* events
```

Breakpoints set in the gutter become `vscode.SourceBreakpoint`s; a debounced `onDidChangeBreakpoints` listener bridges them to CDP. Step controls (`debugContinue`, `debugStepOver`, …) prefer the Node Inspector, then headless Chrome, then VS Code DAP.

### 7.6 Inspectra V2 BrowserTab — status

The **"Inspectra V2 BrowserTab"** concept (true client-side V8 debugging via VS Code's proposed `browser` API and `openBrowserTab`) is **architectural intent only** — there are no `vscode.window.openBrowserTab` calls in the source. The build tooling (`scripts/package-with-flavor.mjs`) can produce a sideload VSIX with `enabledApiProposals: ['browser']` (`WCI_PROPOSED_API=true`) to prepare for it. A dormant **headless Chrome path** (`launchCdp`, `ScreencastService`, `InputService`, `ScreencastCanvas`) is implemented but not wired into the primary UI; the live, user-facing path is Node Inspector only.

---

## 8. Preview Panel

**UI location:** `src/devtools/preview/` (the legacy `src/preview/` is superseded)

The Preview panel is the iframe that hosts the user's app (proxied so the agent can be injected), plus a browser-style toolbar and a responsive device toolbar.

> **Why it exists — and how it differs from Chrome DevTools.** Chrome *is* the browser, with its responsive "device mode" built in — but it is a separate application from your editor. Every other WCI feature (inspect, prop-edit, network, a11y) needs a live app to act on, and shuttling between the editor and a browser window breaks the loop. The Preview panel embeds the running app **inside the editor**, served through WCI's proxy so the agent can be injected (which a plain `<iframe>` to a third-party app could not achieve, due to `X-Frame-Options`/CSP). It carries its own responsive **device toolbar** (presets, custom width/height, DPR, rotate), so component selection, prop edits, and responsive testing all happen on one screen without ever opening Chrome.

### 8.1 Proxy & agent injection

The `AgentInjector` (`src/server/agentInjector.ts`) runs two HTTP servers — a tiny agent-file server (`/agent.js`, with WS/agent ports prepended) and the main proxy. On HTML responses the proxy:

1. Injects an **early `<head>` hook patch** (fixes the React DevTools hook, registers the navigation service worker).
2. Injects the **agent bootstrap** before `</body>`: port globals plus `<script src="http://127.0.0.1:{agentPort}/agent.js" defer>`.
3. Relaxes CSP (`script-src`/`connect-src`) and removes `X-Frame-Options` / `frame-ancestors` so the page can render inside the iframe.
4. Blocks HMR WebSocket upgrades to prevent reload storms, and disables timeouts (a paused debugger can stall SSR indefinitely).

Special routes: `/__devtools__` (the DevTools page), `/__devtools__/devtools.js`, `/__wci-sw.js` (service worker), `/__ext__?url=` (external-URL proxy).

### 8.2 Navigation (`usePreview.ts`)

URL translation swaps the app origin and proxy origin (`toProxyUrl` / `toDisplayUrl`); external URLs route through `/__ext__`. It tracks a nav stack and history (max 30), exposes `window.__wci_previewUrl`, and listens for `wci:url-changed`, `wci:ext-nav-url`, `wci:disconnect`, `wci:server-stopped`, handoff events, and `wci:sw-ready`. The select/paint toolbar buttons call `__wci_cmd('toggleSelectMode' | 'toggleDebugPaint')`.

### 8.3 Device toolbar (`useDeviceMode.ts`, `devices.ts`)

Device presets (grouped phone/tablet/laptop/desktop), width/height inputs, DPR, zoom, and rotate. `ViewportContainer.tsx` applies CSS-transform scaling with `ResizeObserver`-based auto-fit and drag handles (200–5120 px, responsive mode only). When device mode is on, DPR is injected via `Object.defineProperty(iframe.contentWindow, 'devicePixelRatio', …)` (same-origin only).

### 8.4 Screencast / CDP mode — status

`ScreencastCanvas.tsx` (CDP frame rendering + input forwarding) is fully implemented but **not currently mounted** in `PreviewPanel`. Today the panel always renders the iframe; when a CDP session is connected it shows a banner linking to the Debug tab rather than switching to a screencast. The screencast pipeline (`Page.startScreencast` → `cdp:screencast-frame` → canvas) only runs under the dormant `cdp:launch` headless-Chrome path.

---

## 9. Accessibility

**Engine:** `src/agent/a11y.ts`
**Problems integration:** `src/core/message-handler/a11y-handler.ts`

Accessibility is a **custom inline DOM rule engine** in the browser agent — *not* axe-core or Lighthouse. It references WCAG AA contrast thresholds (4.5:1 normal, 3:1 large/bold) but is intentionally lightweight.

> **Why it exists — and how it differs from Chrome DevTools.** Chrome surfaces a11y through **Lighthouse** and the axe-powered *Issues* tab — both on-demand audits that report **in the browser**, disconnected from your source. The result is a list of DOM problems you then have to trace back to the component and file that produced them. WCI takes the opposite stance: it runs lightweight, **WCAG-AA-aware checks continuously** as it builds the component tree, annotates the offending component inline in the Inspector, and — most importantly — pipes each issue (with its source `fileName:line`) into the **VS Code Problems panel**. That turns accessibility defects into click-to-navigate entries that behave like compiler warnings, right where you fix them. It is intentionally a focused rule set, not a full Lighthouse replacement.

### 9.1 Rules

| Check | `type` | Severity | Rule |
| --- | --- | --- | --- |
| `checkMissingAlt` | `missing-alt` | error | `<img>` without `alt` |
| `checkInteractiveLabel` | `missing-label` | warning | Button/link/`role=button` without an accessible name |
| `checkInteractiveLabel` | `generic-label` | warning | Non-descriptive text ("click here", "read more"…) |
| `checkFormLabel` | `missing-label` | warning | Input/textarea/select without label/aria/placeholder |
| `checkContrast` | `low-contrast` | warning | Below WCAG AA ratio (`relativeLuminance` / `contrastRatio`) |
| `checkHeadingOrder` | `heading-order` | warning | Skipped heading levels |
| `checkAriaAttributes` | `invalid-role` / `empty-aria-label` / `aria-hidden-focusable` | error | Invalid role, empty `aria-label`, `aria-hidden` on focusable |
| `checkKeyboard` | `link-no-href` / `positive-tabindex` | warning | `<a>` without `href`; `tabindex > 0` |
| `checkDocumentA11y` | `missing-lang` | error | `<html>` missing `lang` (document-level) |

### 9.2 Three trigger paths

1. **Full document scan** — toolbar A11y button → `requestA11yReport` → `host:request-a11y-report` → `handleRequestA11yReport()` resets state, runs document + per-element checks (only elements with a framework instance), attaches `nodeId` + `source`, emits `agent:a11y-report`.
2. **Continuous** — `buildTreeNode()` sets `a11yIssues` on every tree node, surfacing warning icons in the sidebar.
3. **On selection** — select-mode payloads include the selected element's issues, shown inline in the Inspector's `PropsSection`.

### 9.3 VS Code Problems panel

`handleA11yReport()` clears the `wci-a11y` `DiagnosticCollection`, then for each issue **with a `source.fileName`** creates a `vscode.Diagnostic` (error/warning), tagged `source = 'WCI A11y'`, `code = issue.type`, grouped per file. Issues without a source location (e.g. document-level `missing-lang`) appear in the DevTools UI but **not** in Problems.

### 9.4 Severity score (display only)

The legacy A11y panel computes `score = max(0, 100 − errors*10 − warnings*3)` and colors it (≥80 green, ≥50 orange, else red). This score is purely visual and does not feed diagnostics.

---

## 10. Settings

**UI location:** `src/devtools/settings/SettingsPanel.tsx`

> **Why it exists — and how it differs from Chrome DevTools.** Chrome DevTools settings tune a *browser* tool and live in a browser profile. WCI's DevTools page runs inside your editor, so its settings (theme, reduced motion, high contrast) exist to make the in-editor surface feel native to *your* environment and accessible to *you* — persisted locally per developer rather than tied to a browser. It is deliberately minimal; deeper behavior (ports, debug runtime, auto-start) lives in VS Code's own settings under `contributes.configuration` (see [§11.8](#118-configuration-keys)).

The Settings panel configures the **DevTools page** (separate from VS Code workspace settings). The model is small:

```ts
interface WciSettings {
  themeMode: 'dark' | 'light' | 'system'
  reduceMotion: boolean
  highContrast: boolean
}
```

Sections: Theme (dark/light/system), Accessibility (reduce motion, high contrast), a static Keyboard Shortcuts reference, and Configuration (export/import JSON).

### 10.1 Theming (dual layer)

1. **Legacy CSS variables** — `:root` vars from `DARK_VARS`/`LIGHT_VARS` (`tokens.ts`), applied by `themeBridge.ts`.
2. **React styled-components** — a `ThemeProvider` fed by `darkTheme`/`lightTheme` (`theme.ts`).

`initThemeBridge()` runs first at mount, reads `localStorage`, and applies the theme + global classes. Saving the panel dispatches `wci:settings-changed`; `themeBridge.ts` re-applies. System mode tracks `matchMedia('(prefers-color-scheme: light)')`. `applyGlobalClasses()` toggles `high-contrast` and `reduce-motion` on `<html>`.

### 10.2 Persistence

Settings are stored in **`localStorage`** under `wci-devtools-settings` (the DevTools page origin — not VS Code `globalState`). Edits use a draft + `isDirty` pattern, committed via an explicit Save button. Import merges with defaults; Export downloads `wci-settings.json`.

---

## 11. System Architecture

> **Why it exists — and how it differs from Chrome DevTools.** This is not a tab users click, but it is the reason every feature above can live *inside the editor* when Chrome DevTools cannot. Chrome DevTools is one process bolted onto one browser tab, with privileged access to that tab and nothing else. WCI has no such privilege, so it manufactures equivalent reach through architecture: a **proxy** injects an agent into your real app (granting the DOM/framework access Chrome gets for free), a **WebSocket hub** fans data out to *both* a native VS Code sidebar and an in-editor React UI, and the **extension host** bridges to capabilities a browser tool simply does not have — the filesystem, git, test runners, and the Node debugger. Understanding these three tiers explains both the power (editor-native, full-stack) and the constraints (single agent at a time, same-origin cookie limits, proxy-dependent injection) documented throughout this guide.

### 11.1 Three tiers

WCI is a three-tier system connected by a single WebSocket hub:

- **Browser Agent** (`src/agent/`, bundled to `dist/agent.js`) — injected into the proxied app.
- **Extension Host** (`src/extension.ts`, `src/server/`, `src/core/`, bundled to `dist/extension.js`) — WebSocket server, proxy/injection, routing, VS Code integration.
- **DevTools UI** (`src/devtools/`, `dist/devtools.js` + an inline IIFE from `src/views/browserDevTools/`) — React panels + the Preview iframe + command bridge.

A fourth surface, the **VS Code sidebar tree** (`ComponentTreeProvider`), is fed by the same agent tree updates.

### 11.2 WebSocket protocol (`src/server/wsServer.ts`, `src/shared/protocol.ts`)

`WCIWebSocketServer` binds to `127.0.0.1` (ports 9200–9300 or `wci.wsPort`) and distinguishes connection roles by query param:

- **Agent** — the app inside the Preview iframe (`wciRole=iframe`, the default). Only **one** agent at a time; a second iframe agent replaces the first (`extension:agent-replaced`). A `wciAgentSession` id detects duplicates.
- **CDP agent** — `wciRole=cdp` (the dormant headless-Chrome path), treated as additive.
- **Viewer** — `?viewer=1`, the DevTools page; multiple allowed, addressed via `sendToViewers()`.

Message unions are defined in `protocol.ts`:

| Union | Direction | Examples |
| --- | --- | --- |
| `AgentMessage` | Agent → Host | `agent:handshake`, `agent:tree-update`, `agent:component-selected`, `agent:network-entry`, `agent:cookies-data`, `agent:console`, `agent:performance`, `agent:a11y-report`, `agent:url-changed` |
| `HostMessage` | Host → Agent | `host:toggle-select-mode`, `host:toggle-debug-paint`, `host:select-component`, `host:highlight-component`, `host:update-prop`, `host:request-tree`, network/cookies/performance/debug messages |
| `ExtensionMessage` | Host → Viewers | `extension:state`, `extension:tree`, `extension:component-detail`, `extension:console`, `extension:network-entry`, `extension:a11y-report` |
| `ViewerMessage` / `WebviewMessage` | UI → Host | `viewer:handshake`, `viewer:command` |

> Several runtime messages (`extension:cookies-data`, `extension:coverage-*`, `extension:git-*`) exist as string literals but are not yet in the typed unions — type coverage trails the implementation.

Routing entry points: `handleAgentMessage()` (`src/core/message-handler/message-router.ts`) for agent traffic, and `handleWebviewCommand()` (`src/core/commandHandler.ts`, 80+ command cases) for viewer commands.

### 11.3 Proxy & script injection

The architecture is **user-facing port → proxy → internal upstream port**. `serverLauncher.ts` starts the dev server on a random internal port (optionally with `--inspect`) and `AgentInjector` proxies it on the user-facing port, injecting the agent (see [§8.1](#81-proxy--agent-injection)). The DevTools page is served at `http://localhost:{proxyPort}/__devtools__`.

### 11.4 DevTools bridge (IIFE + React)

The DevTools page opens a **single viewer WebSocket** in a legacy IIFE (`src/core/scripts/websocket.ts`). Incoming `extension:*` messages are re-dispatched as `window` `CustomEvent('wci:*')`, and `window.__wci_cmd(cmd, args)` sends `viewer:command`. React panels (mounted from `src/devtools/index.tsx` into `#*-root` divs) subscribe via hooks like `useWebSocket()`.

### 11.5 Build system (`esbuild.config.mjs`)

Three parallel esbuild targets:

| Target | Entry | Output | Format / Platform |
| --- | --- | --- | --- |
| Extension host | `src/extension.ts` | `dist/extension.js` | CJS / node18 (`vscode` external) |
| Browser agent | `src/agent/browser-agent/index.ts` | `dist/agent.js` | IIFE (`__WCI_AGENT__`) / browser |
| DevTools app | `src/devtools/index.tsx` | `dist/devtools.js` | IIFE / browser (automatic JSX) |

`tsconfig.json` **excludes** `src/agent/**` and `src/core/agent/**` from `tsc` (esbuild bundles them; shared code like `protocol.ts` is inlined into the agent IIFE). Scripts: `build`, `dev` (watch), `lint` (`tsc --noEmit`), and the flavor packagers below.

### 11.6 Packaging flavors (`scripts/package-with-flavor.mjs`)

Because the Marketplace rejects `enabledApiProposals`, the packager mutates `package.json` per flavor and always restores it:

| Command | Flavor | `enabledApiProposals` |
| --- | --- | --- |
| `npm run build:marketplace` | marketplace | stripped |
| `npm run build:sideload` (`WCI_PROPOSED_API=true`) | sideload | adds `"browser"` |

Output: `{name}-{version}-{flavor}.vsix`, packaged with `--no-dependencies` (the pre-bundled `dist/` is shipped; `src/**` is excluded via `.vscodeignore`).

### 11.7 Commands & views

VS Code commands are registered directly in `src/extension.ts` (there is no `src/commands/` directory):

| Command | Effect |
| --- | --- |
| `wci.run` | Detect framework, start dev server + proxy, print the DevTools URL |
| `wci.toggleDebugPaint` | Toggle the debug-paint overlay (`host:toggle-debug-paint`) |
| `wci.toggleSelectMode` | Toggle select mode (`host:toggle-select-mode`) |
| `wci.refreshTree` | Force a tree rebuild (`host:request-tree`) |
| `wci.goToSource` | Open the selected component's source |

The activity-bar container `wci-inspector` hosts the `wci.componentTree` tree view.

> Known gap: the status bar references `wci.openDevTools`, but that command is not registered anywhere.

### 11.8 Configuration keys

| Key | Default | Purpose |
| --- | --- | --- |
| `wci.editor` | `vscode` | Preferred editor for opening sources |
| `wci.proxyPort` | `0` | Fixed proxy port (0 = auto) |
| `wci.wsPort` | `0` | Fixed WebSocket port (0 = auto in 9200–9300) |
| `wci.autoStart` | `true` | Auto-start when a dev server is detected |
| `wci.debugPaintDefault` | `false` | Debug paint on by default |
| `wci.debug.runtime` | `node` | Debug attach strategy (node/browser/dual) |
| `wci.debug.verboseLogs` | `false` | Verbose CDP pipeline logging |
| `webComponentInspector.debugPort` | `9222` | Documented Chrome remote-debug port |
| `webComponentInspector.debugMode.whitelistedDirectories` | `[]` | Extra dirs the Debug file explorer may read/write |

---

## Appendix: notable implementation gaps

These are documented for accuracy so future work (and the auth/multi-session phases) starts from reality:

1. **Inspectra V2 BrowserTab** is planned/intent only — no `openBrowserTab` calls; live debugging is Node Inspector.
2. **`ScreencastCanvas`** is implemented but not mounted in the Preview/Debug React tree.
3. **`browser` debug runtime mode** intentionally returns failure (no second app instance).
4. **Type-coverage gaps** in `protocol.ts`: `extension:cookies-data`, `extension:coverage-*`, `extension:git-*`, and the Performance `events` array are runtime-only.
5. **`wci.openDevTools`** is referenced by the status bar but never registered.
6. **`console.info` / `console.debug`** are not intercepted by the Console tab.
7. **Accessibility** is a custom WCAG-AA-aware rule set, not axe/Lighthouse; document-level issues are excluded from the Problems panel.

