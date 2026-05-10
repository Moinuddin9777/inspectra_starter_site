# Changelog

All notable changes to the **Web Component Inspector** VS Code extension are documented here.

This project follows [Semantic Versioning](https://semver.org/). Pre-1.0 versions represent the development/beta phase.

---

## [1.4.0] — 2026-04-19

**Major feature release** — intelligent click-to-source with ranked text search, context menu pre-resolution, WebSocket stability hardening, and comprehensive code quality cleanup.

### Added
- **Ranked text search engine** (`src/core/message-handler/text-search.ts`).
  - Workspace-wide text search with multi-signal scoring: path classification, substring matching, exact quoted strings, JSX attribute detection, prop assignment recognition, query-to-content ratio, full-line match bonus, line bloat penalty.
  - Dynamic `qWeight = clamp(qLen/20, 0.5, 3.0)` multiplier scales all scoring signals proportionally to query length.
  - Whitespace-normalized fallback matching (Phase 1.5) for queries that don't match verbatim.
  - Dynamic partial matching: 50% of query length, minimum 20 characters.
  - Exports: `scoreMatch`, `rankedTextSearch`, `escapeRegex`, `normalizeSourcePath`, `MIN_TEXT_SEARCH_LEN`, `MIN_FALLBACK_SEARCH_LEN`.
- **Click-to-source for text definitions** — clicking visible text in the inspector now navigates to the data definition file (constants, config, CMS) rather than the rendering component.
  - `agent:open-source` handler runs text search first, falls back to source map.
  - `agent:component-selected` handler uses text search for long text, with component name fallback.
  - `agent:find-text-definition` handler for direct text definition lookup.
- **Context menu pre-resolution** — ancestor hierarchy context menu (Ctrl+right-click) now resolves all text locations *before* opening the popup, eliminating UI blink/flicker.
  - `agent:resolve-text-location` batch message resolves multiple search keys in parallel.
  - `host:text-location-resolved` response carries resolved `{ path, line, column }` per key.
  - Direct element and no-source ancestor rows show `file:line:col` citation immediately.
  - Component ancestors with source maps navigate to their own source, not the text definition.
- **Column-level navigation** — `openFileAtLine()` now accepts and applies column offsets for precise cursor placement.
- **File navigation module** (`src/core/message-handler/file-navigation.ts`) — extracted file opening logic with window foreground activation.

### Changed
- **Protocol types expanded** (`src/shared/protocol.ts`).
  - `AgentOpenSourceMessage` now includes optional `clickedText` field.
  - `AgentFindTextDefinitionMessage` now includes optional `componentName` field.
  - New `AgentResolveTextLocationMessage` and `HostTextLocationResolvedMessage` types added to unions.
- **Message router fully type-safe** — eliminated all `(msg as any)` casts; switch cases now leverage TypeScript discriminated union narrowing.
- **Text extraction uncapped** — `extractVisibleText` in select-mode no longer truncates at 120/200 characters; returns full collapsed-whitespace text.
- All 30 unused `React` default imports removed across TSX files (leveraging `jsx: "react-jsx"` / esbuild `jsx: 'automatic'`).

### Fixed
- **WebSocket reconnection loop** — two root causes identified and resolved:
  1. Unhandled promise rejections in `agent:resolve-text-location` handler could crash the extension host, killing the WebSocket server. All 5 `void (async ...)` blocks in the message router now have `try/catch` with graceful fallbacks.
  2. Stale WebSocket connections in the browser agent — `connect()` now explicitly closes and nullifies any existing socket (with `onclose = null` to prevent cascading reconnect triggers) before creating a new one.
- **Variable shadowing bugs** (3 instances):
  - `chrome-overlay.ts`: `swatch` → `swatchEl`, `fontSize`/`font` → `csFontSize`/`csFont` to avoid shadowing imported theme tokens.
  - `host-handlers.ts`: `flash` → `flashEl` to avoid shadowing imported function.
- **Dead code removed** — `onTabSwitch()` function in `useDebug.ts` (replaced by MutationObserver), unused `getComponentCount` destructuring, unused `wsServer`/`wciLog` destructurings in server launcher, unused `detailRef` in NetworkTab, unused `Fragment` import in ConsolePanel.
- **Data file typo** — stray `z` character in `apps/nextjs-demo/data/constants.js` line 116.

### Code Quality
- Zero TypeScript errors with `--noUnusedLocals --noUnusedParameters` strict checks.
- JSDoc documentation added to all exported public functions in core modules.
- All catch blocks have meaningful fallback logic or explanatory comments.
- Removed 200-file cap on workspace text search (no `maxResults` on `findFiles`).

---

## [1.3.0] — 2026-04-17

**Stable release** — consolidates all v1.1.0–v1.2.x features, fixes, and iterative refinements after extensive multi-round testing.

### Added
- **Preview panel — React + styled-components** (`src/devtools/preview/`).
  - `PreviewPanel.tsx` — full browser-like preview with iframe viewport, loading states, error handling.
  - `BrowserBar.tsx` — address bar with protocol icon, URL input, history dropdown, navigation buttons (back/forward/home/refresh), select mode toggle, paint mode toggle, device toolbar toggle, more menu.
  - `DeviceToolbar.tsx` — responsive design mode toolbar with device presets, custom width/height inputs, zoom controls, orientation toggle.
  - `ViewportContainer.tsx` — scaled iframe viewport with device frame, notch/dynamic island rendering, status bar.
  - `StatusBar.tsx` — viewport dimension and zoom indicator.
  - `usePreview.ts` — preview state hook with URL management, history tracking, navigation, select mode, paint mode, loading state.
  - `useDeviceMode.ts` — device emulation hook with preset devices, custom dimensions, zoom, orientation.
  - `devices.ts` — device preset catalog (iPhone, iPad, Pixel, Galaxy, desktop, etc.).
  - `preview.styled.ts` — 50+ styled-components for browser bar, address pill, viewport, device frame, toolbar.
- **Settings panel** (`src/devtools/settings/SettingsPanel.tsx`).
  - Theme selection (Dark, Light, System Default) with live preview.
  - Accessibility toggles (High Contrast, Reduce Motion).
  - Keyboard shortcuts reference section.
  - Export/Import configuration with clipboard integration.
  - Explicit Save button with dirty state tracking and confirmation toast.
- **Computed section — cascade expansion** (`src/devtools/inspector/ComputedSection.tsx`).
  - Dedicated component for computed styles with expandable cascade view showing which CSS rules set each property.
- **Theme bridge — full light/dark/system theming** (`src/devtools/themeBridge.ts`).
  - Runtime `:root` CSS variable synchronization between React ThemeProvider and legacy CSS.
  - `DARK_VARS` and `LIGHT_VARS` maps with 30+ CSS variables for each theme.
  - `initThemeBridge()` applies stored theme on load, listens for settings changes and `prefers-color-scheme` media query.
  - `useThemeBridge()` React hook for dynamic theme reactivity across all 7 feature panels.
- **Light theme** (`src/devtools/theme.ts`) — `lightTheme` object with full color mapping.
- **High contrast CSS** — `.high-contrast` class overrides with boosted borders, contrast, and focus-visible outlines.
- **Reduce motion CSS** — `.reduce-motion` class disabling all transitions and animations.
- **Tab tooltips** — all 6 main tabs (Inspector, Network, Performance, Cookies, Accessibility, Coverage) now have descriptive hover tooltips.
- **Click-to-source diagnostic logging** — full step-by-step logging to WCI DevTools output channel.

### Changed
- All 7 React panels use dynamic `useThemeBridge()` hook instead of static dark theme.
- Settings panel rewritten from auto-save to explicit draft + Save button pattern.
- `tokens.ts` updated with `DARK_VARS`/`LIGHT_VARS` maps and scrollbar CSS variables.
- `base.styles.ts` scrollbar styles now use CSS custom properties for theme awareness.
- `TabDef` interface extended with optional `tooltip` field; `tabBar()` renders `title=` attributes.

### Fixed
- Computed tab cascade not expanding — `seenProps` guard in `extractMatchedStyles()` removed.
- Context menu restyled from white/flat to dark theme with color-coded elements.
- Preview URL bar false overlay from high-contrast `focus-visible` rule — scoped exclusion added.
- Click-to-source window focus — now uses OS protocol handler (`vscode://file`) for correct multi-window navigation.

---

## [1.2.3] — 2026-04-17

**Iterative debugging release** — multiple rounds of testing and log-driven debugging to resolve the click-to-source window focus issue across multi-window VS Code setups.

### Challenges & Iterations
This version went through 4 iterative fix attempts for the click-to-source window activation:

1. **Attempt 1 — `workbench.action.focusWindow`**: Discovered via diagnostic logging that this VS Code command **does not exist** (error: `command 'workbench.action.focusWindow' not found`). The error killed the entire try-catch block, preventing any fallback from executing.
2. **Attempt 2 — `vscode.env.openExternal()` with `vscode://file` URI**: Colons in the file:line:col path were URL-encoded (`%3A122%3A9` instead of `:122:9`) by `encodeURI()`, so VS Code couldn't parse the line/column. Additionally, `openExternal()` handled the URI internally within VS Code without triggering OS-level window activation.
3. **Attempt 3 — `open <workspace-folder>`**: macOS `open` command on a folder path opened **Finder** instead of VS Code.
4. **Attempt 4 — `open "vscode://file/..."`**: Invoking the `vscode://` URI through the OS shell (`open` on macOS, `start` on Windows, `xdg-open` on Linux) routes through the OS protocol handler — the same path the npm package uses via `window.location.assign()` from the browser. This correctly identifies and activates the VS Code window that owns the workspace.

### Added
- Diagnostic logging throughout `openSourceFile()` — logs workspace folder, platform, exact command dispatched, and each step result to WCI DevTools output channel.
- `setSourceLogger()` function to inject shared `wciLog` from extension.ts into componentTreeProvider.ts.

### Fixed
- **Click-to-source window focus** — replaced non-existent `workbench.action.focusWindow` with OS-level protocol handler invocation (`open "vscode://file/path:line:col"` on macOS). Cross-platform support for Windows (`start`) and Linux (`xdg-open`).
- Separated document opening and window activation into independent try-catch blocks so failures in one don't block the other.

---

## [1.2.2] — 2026-04-17

**Cross-platform compatibility and UX polish release.**

### Added
- **Tab tooltips** for all 6 main feature tabs:
  - Inspector: "Inspect DOM elements, view computed styles, and navigate to component source code"
  - Network: "Monitor HTTP requests, responses, headers, and payload details in real time"
  - Performance: "Analyze component render times, re-render counts, and React performance metrics"
  - Cookies: "View, edit, and delete browser cookies for the current domain"
  - Accessibility: "Run accessibility audits and detect WCAG compliance issues in your components"
  - Coverage: "Measure code coverage and identify unused CSS and JavaScript on the page"
- `tooltip` optional field added to `TabDef` interface in `shared.ts`.

### Changed
- **Cross-platform OS window focus** — added Windows (`code --reuse-window`) and Linux (`wmctrl`/`xdotool` fallback) support alongside existing macOS `open -a` command.

### Verified
- **Browser compatibility audit** — confirmed agent code is compatible with Chrome, Firefox, and Safari. Navigation API (`globalThis.navigation`) is Chrome-only but gracefully feature-detected with fallback interception methods. No `chrome.*` APIs, no `-webkit-` CSS, no `adoptedStyleSheets` usage found.

---

## [1.2.1] — 2026-04-17

**Bug fix release** addressing 6 issues reported from v1.2.0 testing.

### Fixed
- **Computed tab cascade not expanding** — root cause: `seenProps.has(prop)` guard in `extractMatchedStyles()` skipped any CSS property already seen from an earlier rule. Only 1 entry per property was ever emitted, so `cascadeMap` length was always 1 and expand arrows never rendered. Fix: removed the guard in the stylesheet walk loop.
- **Context menu styling** — restyled from white background with jarring blue hover to dark theme (`#1C2024`), color-coded component markup (tag name `#D97BF2` purple, prop keys `#9BBBDC` blue, source path `#6e7681` dim), smooth 0.15s hover transitions, 3-layer box-shadow, fade-in animation.
- **Settings panel missing Save button** — previously auto-saved silently on every toggle. Rewritten with draft/settings separation, explicit Save button with dirty state visual feedback (accent when dirty, gray when saved), 2-second green "Settings saved" toast confirmation.
- **High contrast accessibility not working** — toggle stored the boolean but nothing consumed it. Added `applyGlobalClasses()` to toggle `.high-contrast` CSS class on `<html>`, plus corresponding CSS overrides (boosted borders, `--fg-dim`, `focus-visible` outlines).
- **Reduce motion not working** — same pattern as high contrast. Added `.reduce-motion` class with `transition-duration: 0.001ms !important` on all elements.
- **Light and System Default theme not applying globally** — React ThemeProvider updated but legacy CSS custom properties on `:root` stayed static dark-only. Created theme bridge (`themeBridge.ts`) that updates `:root` CSS variables at runtime AND notifies React ThemeProvider via callback subscription. All 7 React panels now use `useThemeBridge()` hook.

### Added
- `src/devtools/themeBridge.ts` — new module bridging React and legacy CSS theming.
- `DARK_VARS` / `LIGHT_VARS` in `tokens.ts` — 30+ CSS variable values for each theme.
- `highContrastStyles` and `reduceMotionStyles` in `base.styles.ts`.
- `applyGlobalClasses()` in `SettingsPanel.tsx` for accessibility class management.
- Scrollbar CSS variables (`--scrollbar-thumb`, `--scrollbar-thumb-hover`) for theme-aware scrollbars.

---

## [1.2.0] — 2026-04-17

**Feature release** — Preview panel, Settings page, Inspector enhancements.

### Added
- **Preview panel** — full browser-like preview with React + styled-components:
  - BrowserBar with navigation controls, address pill, URL history, select/paint mode toggles.
  - DeviceToolbar with responsive design presets, custom dimensions, zoom, orientation.
  - ViewportContainer with scaled iframe, device frames, and notch rendering.
- **Settings page** — theme selection (Dark/Light/System), accessibility toggles, keyboard shortcuts reference, config export/import.
- **Computed CSS section** — dedicated ComputedSection component with Chrome-parity UI layout.
- `lightTheme` object in `theme.ts` for light theme support.

### Changed
- Inspector enriched with groupProps for categorized prop display.
- SVG z-index management improved to prevent overlay clipping.
- Ctrl key modifier support for enhanced interaction patterns.

### Fixed
- Stale props rendering in Inspector detail panel.

---

## [1.1.0] — 2026-04-16

**Bug fix and stabilization release** based on v1.0.10 testing feedback.

### Fixed
- Inspector tree expand/collapse state management edge cases.
- Detail panel rendering race conditions on rapid component selection.
- WebSocket reconnection stability improvements.
- Console panel log entry formatting inconsistencies.

---

## [1.0.10] — 2026-04-10

### Added
- **Network tab — React + styled-components refactor** (`src/devtools/network/`).
  - `NetworkTab.tsx` — toolbar (pause/clear/font-size/search/help), filter bar (status/method/type), split-view with drag-resizable detail drawer (Overview/Headers/Request/Response tabs).
  - `useNetwork.ts` — hook with 500-entry cap, 3 filter dimensions, content-type normalization via `normalizeType()`, method normalization (uppercase + trim), locally unique IDs (`wci-{timestamp}-{counter}`) to prevent duplicate ID collisions across agent reloads.
  - `network.styled.ts` — 55+ styled-components: toolbar, filter bar, request table, method/status badges with color maps, split-view resize handle, detail drawer, timing bar, Pretty/Raw format toggles, help tooltip.
- **Performance tab — React + styled-components refactor** (`src/devtools/performance/`).
  - `PerformanceTab.tsx` — toolbar (Record/Clear/Export), 4 KPI cards, timeline bar visualization, sortable data table with trigger/wasted badges.
  - `usePerformance.ts` — hook with recording state, render accumulation per component by `nodeId`, 100-event timeline cap, `lastSeen` timestamp for recency-aware slowest KPI, sort column/direction.
  - `performance.styled.ts` — styled-components: RecordBtn with pulse animation, KpiRow/KpiCard with severity coloring, TimelineBar/TimelineBlock, PerfTable with sortable headers, WastedBadge, TriggerBadge.
- Module READMEs for `src/devtools/network/` and `src/devtools/performance/` documenting React architecture, data flow, file inventory, and refactoring history.
- React mount points for Network (`#network-root`) and Performance (`#performance-root`) in `views/browserDevTools/components.ts`.
- Network and Performance wired into `src/devtools/index.tsx` multi-root mounting.

### Changed
- **Phase D cleanup — complete legacy removal** of `src/network/` and `src/performance/` directories.
- Deleted `network.script.ts`, `network.styles.ts`, `network.components.ts`, `performance.script.ts`, `performance.styles.ts`, `performance.components.ts`, and legacy READMEs (8 files).
- Removed `networkScript()` and `performanceScript()` from IIFE script composition (`script.ts`).
- Removed `networkStyles` and `performanceStyles` from CSS composition (`styles.ts`).
- Removed 17 dead network/performance DOM refs and 4 network state variables from `init.ts`.
- Removed Network Detail Resize Handle and Network Column Resize IIFEs (~70 lines) from `resize.ts`.
- Build size reduced from 846 KB to 734 KB (~112 KB dead IIFE code eliminated).

### Fixed
- **Network filter glitch** — method filter now normalizes to uppercase + trim at ingestion; content-type filter uses `normalizeType()` mapping for consistent categories.
- **Network multi-row selection** — replaced agent-provided IDs (which collide across iframe reloads) with locally unique IDs preventing duplicate ID rendering.
- **Network split-view drag** — detail panel width controlled via inline style from drag handler instead of fixed styled-component width.
- **Console React-native drag resize** — replaced IIFE resize dependency with pure React `ConsoleResizeBar` drag handler manipulating `.console-panel` ancestor height.
- **Console Enter key search** — Enter navigates forward (1→2→3), Shift+Enter navigates backward; added search match count display with navigation arrows.
- **Console badges** — warn/error count badges with ⚠/✕ icons in toolbar.
- **Performance KPI slowest card** — uses `lastSeen` timestamp to show slowest component from current page (within 5s recency window), not stale history from previous pages.
- **Inspector tree auto-expand** — rewrote expand logic: unconditionally expands ALL nodes with children on every tree update, `userCollapsedRef` tracks manual user collapses to respect overrides.
- **Inspector tree race condition** — IIFE WebSocket dispatches `wci:tree` before React mounts; added `window.__wci_last_tree/detail/state` caching in IIFE and `useState` initializers reading from cache in `useWebSocket`.
- **Inspector tree animation** — removed `overflow: hidden` and max-height cap from `TreeNodeChildren`; `expandIn` animation uses opacity only.
- **Inspector root-level arrows** — depth=0 expandable nodes now render expand/collapse arrows.

---

## [1.0.6] — 2026-04-10

### Changed
- **Phase D cleanup — complete legacy removal** of `src/cookies/` and `src/console/` directories.
- Deleted `cookies.script.ts`, `cookies.styles.ts`, `cookies.components.ts`, `console.script.ts`, `console.styles.ts`, `console.components.ts`, and legacy READMEs.
- Inlined `cookiesTab()` and `consolePanel()` HTML mount functions directly into `views/browserDevTools/components.ts`.
- Refactored `logger.ts` — removed all DOM manipulation; `addLog()` now only dispatches `wci:log` CustomEvent.
- Removed `onCookiesData()` IIFE call from `websocket.ts`; kept `wci:cookies-data` CustomEvent dispatch.
- Removed `consoleScript()` and `cookiesScript()` from IIFE script composition (`script.ts`).
- Removed `cookiesStyles` and `consoleStyles` from CSS composition (`styles.ts`).
- Removed 12 cookie DOM refs and 3 console DOM refs (`consoleEl`, `btnConsoleCopy`, `btnConsoleClear`) from `init.ts`.
- Build size reduced from 886 KB to 846 KB (~40 KB dead IIFE code eliminated).

### Fixed
- Cookies panel horizontal overflow after cleanup — restored `flex-direction: column; overflow: auto` on `#panel-cookies` mount div and added `min-width: 0; overflow: hidden` on `#cookies-root`.

---

## [1.0.5] — 2026-04-09

### Added
- **Cookies tab — React + styled-components refactor** (`src/devtools/cookies/`).
  - `CookiesTab.tsx` — three-section layout: Search Cookies, Set/Update Cookie, All Cookies.
  - `useCookies.ts` — hook with CustomEvent bridge (`wci:cookies-data`), search resolution via `pendingSearchRef`, form state management, `parseCookies()` and `isValidToken()` utilities.
  - `cookies.styled.ts` — full styled-components with theme tokens, `reducedMotion` support, `focus-visible` rings, `scale(0.97)` active press feedback, and `ResultName` bold component.
- **Console panel — React + styled-components refactor** (`src/devtools/console/`).
  - `ConsolePanel.tsx` — header toolbar with level filter dropdown, search input, warn/error count badges, copy/clear buttons, and scrollable log list with auto-scroll.
  - `useConsole.ts` — hook listening to dual CustomEvents (`wci:console` for agent logs, `wci:log` for internal IIFE logs), log-level filtering, search, max 200 entries.
  - `console.styled.ts` — styled-components with level-based coloring, `HighlightMark` search highlighting, `CountBadge` severity badges.
- Module READMEs for `src/devtools/cookies/` and `src/devtools/console/` documenting architecture, CustomEvent bridges, and file inventory.

### Fixed
- **Search result disappearing** — all search status updates now use `autoClear = false`; results persist until user explicitly clears the search field.
- **Search populating All Cookies on failure** — search no longer unconditionally calls `cmd('getCookies')` on miss; uses `pendingSearchRef` to defer resolution only when fetching fresh data.
- **All Cookies showing results on wrong input** — All Cookies section only populates when search name matches exactly AND cookie value passes `isValidToken()` validation (JWT, 8+ alphanumeric, or 16+ hex).
- **Input fields stretching on search** — added `width: 100%`, `box-sizing: border-box`, `min-width: 0` constraints to `CookiePanel`, `Section`, `SearchRow`, `ValueRow`, `CookieInput`, and `ResultBox`.
- **Search auto-populating form fields** — removed `setFormName`/`setFormValue` from search resolution; Set/Update form only populated via explicit click in All Cookies list.
- **Form validation not clearing on input** — `updateFormValue()` wraps `setFormValue` + clears `formStatus` when user types, matching original IIFE behaviour.
- **Bold cookie name lost in search results** — `StatusMsg` extended with `foundName`/`foundValue`; `ResultContent` renders `<ResultName>` (bold) for found variant.
- **Theme token inconsistency** — replaced all `var(--*)` in styled-components with `${({ theme }) => theme.*}` pattern matching Coverage/Inspector modules.

---

## [1.0.4] — 2026-04-08

### Fixed
- **Coverage tab data flow crash** — removed 6 undefined IIFE function calls (`onCoverageData`, `onCoverageStatus`, etc.) in `websocket.ts` that crashed before CustomEvent dispatch; errors were silently swallowed by catch block.
- **Coverage auto-load** — added `useEffect` in `useCoverage` hook that auto-triggers `loadCoverage` when WebSocket connection is established via `wci:state` event.
- **Search bar placeholder** — replaced `\u2026` literal with actual `…` character in `CoverageToolbar.tsx` placeholder attribute.
- Changed "no coverage files" status from `error` to `not-found`.

---

## [1.0.3] — 2026-04-08

### Fixed
- **SonarQube compliance** — resolved 126 issues across code coverage and inspector modules:
  - Readonly interface props, cognitive complexity reduction, nested ternary elimination.
  - Preferred `.at()` over bracket access, `RegExp.exec()` over `String.match()`.
  - `globalThis` over `window`, `Math.hypot()` over manual calculation.

---

## [1.0.1] — 2026-04-05

### Added
- Inspector module — React + styled-components refactor (`src/devtools/inspector/`).
- Code coverage module — React + styled-components refactor (`src/devtools/code_coverage/`).
- React 18 DevTools entry point (`src/devtools/index.tsx`) with ThemeProvider and multi-root mounting.
- Shared theme tokens (`src/devtools/theme.ts`) mirroring CSS custom properties.

---

## [1.0.0] — 2026-04-04

### Added
- Full production audit: JSDoc inline documentation across all ~60 source files.
- Module-level README.md for every major directory (14 READMEs).
- Proprietary LICENSE.txt (All Rights Reserved).
- Extension-level README.md with architecture docs, commands, config, and project structure.
- This CHANGELOG.md.
- `repository`, `homepage`, `bugs`, and `galleryBanner` in `package.json`.

### Changed
- Restructured agent directory: generic utilities (`types.ts`, `adapters.ts`, `dom-helpers.ts`) moved to `core/agent/`.
- Updated `tsconfig.json` excludes to cover `src/core/agent/**`.
- Publisher set to `hemandroid`.
- License changed from ISC to proprietary (All Rights Reserved).

---

## [0.18.1] — 2026-03-31

### Changed
- Moved `resizeScript` and `addLog` utilities from inline code to `core/scripts/` and `core/scripts/logger.ts`.
- Renamed `coverage/` directory to `codeCoverage/` for consistency with the feature module naming convention.
- Reduced `extension.ts` from 839 lines to 382 lines via modular extraction.

---

## [0.18.0] — 2026-03-28

### Added
- Feature-first module architecture: 8 feature modules (inspector, network, performance, accessibility, codeCoverage, cookies, console, preview) each with `.components.ts`, `.script.ts`, `.styles.ts`.
- Core module with shared scripts, styles, components, and utilities.
- `commandHandler.ts` and `messageHandler.ts` extracted from `extension.ts`.

### Changed
- Migrated all inline CSS/HTML/JS from monolithic files to feature-specific modules.
- Extracted browser DevTools page assembly to `views/browserDevTools/`.

---

## [0.17.0] — 2026-03-21

### Added
- Code coverage dashboard with Istanbul JSON, LCOV, and Cobertura XML parser support.
- Git branch integration: switch branches, auto-pull, re-run coverage.
- Test framework auto-detection (Jest, Vitest, Mocha, c8, nyc).
- `codeCoverage.commands.ts` for load/run/send coverage workflows.
- `codeCoverage.runner.ts` for executing coverage commands.

---

## [0.16.0] — 2026-03-14

### Added
- Network inspector: `fetch` and `XMLHttpRequest` interception.
- Network panel UI with request table, detail drawer, timing bars, status badges.
- Pause/resume and clear functionality.
- Request/response header and body inspection.

---

## [0.15.0] — 2026-03-07

### Added
- Performance profiling panel for React render tracking.
- Hooks into React DevTools' `__REACT_DEVTOOLS_GLOBAL_HOOK__` renderers.
- Render count table with avg/total duration and wasted render detection.
- Start/stop/clear controls.

---

## [0.14.0] — 2026-02-28

### Added
- Cookie inspector: read, create, edit, and delete browser cookies.
- Console panel: forwards dev-server stdout/stderr and browser `console.*` output.
- Log forwarding infrastructure (`logForwarder.ts`) with pino-pretty log block parsing.
- Server launcher extraction (`serverLauncher.ts`) from `extension.ts`.

---

## [0.13.0] — 2026-02-21

### Added
- Standalone browser DevTools page served at `/__devtools__`.
- Two-pane layout: left (Inspector + A11y tabs + Console) and right (Preview iframe).
- Draggable resize handles with `requestAnimationFrame` throttling.
- Disconnect overlay (Flutter DevTools style) when agent connection is lost.
- Viewer WebSocket connections (`?viewer=1` query parameter).
- Dark theme CSS design tokens (`tokens.ts`).

---

## [0.12.0] — 2026-02-14

### Added
- Context menu integration: `Alt+Right-Click` in preview opens component ancestor path.
- Context menu popup with component hierarchy, source links, and props.

### Changed
- Select mode auto-disables after click (Flutter DevTools behaviour).

---

## [0.11.0] — 2026-02-07

### Added
- Accessibility dashboard: inline a11y checks (contrast, alt text, ARIA, labels, heading hierarchy, `lang`).
- Score calculation (0–100) with severity breakdown.
- Issues pushed to VS Code Problems panel via Diagnostics API.
- `checkA11y()` and `checkDocumentA11y()` in the browser agent.

---

## [0.10.0] — 2026-01-31

### Added
- Live prop editing for React components.
- Three-strategy prop update: React DevTools hook → fiber mutation + forceUpdate → DOM fallback.
- Inline `<input>` editor in the prop table with type-aware value parsing.
- Vue and Svelte prop editing via framework adapter `updateProp()`.

---

## [0.9.0] — 2026-01-24

### Added
- Layout Inspector tab: CSS box model diagram (margin → padding → content).
- Computed style display: `display`, `position`, `flexDirection`, `gridTemplateColumns`, `zIndex`.
- `computeLayout()` in `dom-helpers.ts`.

---

## [0.8.0] — 2026-01-17

### Added
- Debug paint overlay: depth-hued semi-transparent overlays with component names and dimensions.
- Toolbar toggle button in both webview and browser DevTools.
- `showDebugPaint()` / `removeDebugPaint()` in the browser agent.

---

## [0.7.0] — 2026-01-10

### Added
- Click-to-source (Select Component mode): hover highlight → click → opens source file in editor.
- Capture-phase event listeners with auto-disable after selection.
- `enableSelectMode()` / `disableSelectMode()` in the browser agent.

---

## [0.6.0] — 2026-01-03

### Added
- Embedded app preview: iframe loading the proxied URL with navigation controls (back, forward, home, URL bar).
- URL bar with `toProxyUrl` / `toDisplayUrl` translation.
- Refresh button.

---

## [0.5.0] — 2025-12-20

### Added
- DevTools WebView panel with split layout and tab bar.
- Component tree rendering in the webview (rich view with depth indentation, framework icons).
- Details panel with Props / Layout / Source sub-tabs.
- `postMessage` bridge between webview and extension host.

---

## [0.4.0] — 2025-12-13

### Added
- Status bar integration: connection state, framework name, component count.
- States: connected, disconnected, connecting, waiting, ready, error.
- Click status bar → opens DevTools panel.

---

## [0.3.0] — 2025-12-06

### Added
- Component tree sidebar (`TreeDataProvider`) with framework-specific icons.
- `getParent()` for `reveal()` support.
- Markdown tooltips with props, a11y issues, and source location.
- `goToSource` command.

---

## [0.2.0] — 2025-11-29

### Added
- Agent injector: HTTP proxy that intercepts HTML responses and injects the agent `<script>` tag.
- Handles gzip/brotli/deflate decompression.
- Dev server detector: auto-detection of 7 frameworks and 3 package managers.
- Port polling across common dev server ports (3000, 5173, 8080, etc.).

---

## [0.1.0] — 2025-11-22

### Added
- Initial extension scaffold with VS Code manifest, TypeScript, and esbuild.
- WebSocket server with typed protocol messages and auto port allocation (9200–9300).
- Browser agent (IIFE): framework adapters (React, Vue, Svelte), MutationObserver, WebSocket client.
- Exponential-backoff reconnect (20 attempts, 1s–10s).
- Shared protocol types (`protocol.ts`).
