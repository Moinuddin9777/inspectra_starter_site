# PRODUCT DOCUMENTATION — [PROJECT NAME TBD]

**Date:** 20 April 2026

---

## 1. Overview
A next-generation, production-grade VS Code extension for real-time inspection, debugging, and analysis of modern web apps (React, Vue, Svelte, and more). Inspired by Flutter DevTools, it delivers a unified, extensible, and visually rich developer experience.

---

## 2. Core Features
- **Component Tree**: Live, hierarchical view of app's components. Bidirectional sync between VS Code and browser.
- **Click-to-Source**: Point-and-click inspector, context menu, and text search for instant navigation to source files.
- **Debug Paint Overlay**: Visual overlays for component boundaries, depth, and layout.
- **Layout Inspector**: Box model, flex/grid, computed CSS, and live property display.
- **Live Prop Editing**: Edit props inline with 3-tier fallback (DevTools hook, fiber mutation, DOM attributes).
- **Accessibility Dashboard**: Inline WCAG checks, severity scoring, and VS Code Problems integration.
- **Performance Profiling**: React render tracking, wasted render detection, timeline, and KPIs.
- **Network Inspector**: Intercepts fetch/XHR, displays requests/responses, filtering, and search.
- **Code Coverage Dashboard**: Istanbul/LCOV/Cobertura parsing, git integration, risk hotspots, and trends.
- **Cookie Inspector**: CRUD for browser cookies with validation.
- **Console Panel**: Dev server and browser logs, severity badges, and search.
- **Embedded Preview**: Live iframe preview with device toolbar and responsive controls.
- **Chrome DevTools Protocol Debugging**: Breakpoints, screencast, stepping, and scope inspection.
- **Settings & Theming**: Dark/light/system themes, accessibility toggles, and config import/export.

---

## 3. Architecture
- **Hybrid Bridge**: React + legacy IIFE agent, unified via CustomEvents and typed WebSocket protocol.
- **3-Way Build**: Extension (Node.js), Agent (IIFE/Browser), DevTools (React/Browser) via esbuild.
- **Typed Protocol**: 25+ discriminated union messages for robust, type-safe communication.
- **8 Feature Modules**: Inspector, Coverage, Network, Performance, Cookies, Console, Preview, Debug.
- **Zero External Charts**: All SVG charts are hand-built for performance and bundle size.

---

## 4. Supported Frameworks
| Framework | Tree | Props | Source | Edit |
|-----------|------|-------|--------|------|
| React 16+ | ✅ | ✅ | ✅ | ✅ |
| Vue 2/3   | ✅ | ✅ | ✅ | ❌ (planned) |
| Svelte 3+ | ✅ | ⚠️ | ✅ | ❌ (planned) |

---

## 5. Technical Achievements
- **Ranked Text Search Engine**: Multi-signal scoring for source navigation.
- **Live Prop Editing**: 3-tier fallback for maximum compatibility.
- **Performance Profiling**: React renderer hook interception and wasted render detection.
- **Coverage Dashboard**: Git integration, risk analysis, and trend visualization.
- **Breakpoint Debugging**: Full CDP integration for Node.js and browser.
- **Accessibility Auditing**: Inline WCAG checks and severity scoring.

---

## 6. Version History (Highlights)
- **v1.5.3**: Cross-platform window focus, bug fixes, improved debug attach.
- **v1.4.0**: Ranked text search, click-to-source for text definitions.
- **v1.3.0**: Preview panel, settings, full theming.
- **v1.2.x**: Network & Performance tabs, React refactor.
- **v1.0.x**: Inspector & Coverage, React refactor, production audit.

---

## 7. Source Structure (Key Modules)
- **src/agent/**: Browser IIFE agent (framework adapters, overlays, a11y, network, performance, prop edit).
- **src/server/**: WebSocket server, HTTP proxy, dev server detection, log forwarding.
- **src/core/**: Shared scripts, message routing, text search, file explorer, git helpers.
- **src/devtools/**: React UI (Inspector, Coverage, Network, Performance, Cookies, Console, Preview, Settings, Debug).
- **src/shared/**: Protocol types and message definitions.
- **src/views/**: VS Code panels (TreeView, StatusBar, DevTools webview).
- **src/accessibility/**: A11y checks and UI (legacy IIFE, React refactor planned).
- **src/cdp/**: Chrome DevTools Protocol integration (launch, screencast, debug).
- **src/preview/**: Embedded preview (React + legacy IIFE).

---

## 8. Documentation & Quality
- **JSDoc** on all exports, 14 module READMEs, 10 docs in /docs.
- **TypeScript strict mode** (`--noUnusedLocals --noUnusedParameters`).
- **Integration tests**: 24 assertions, Jest setup in demo app.
- **SonarQube**: 126 issues resolved (v1.0.3).

---

## 9. Known Limitations & Roadmap
- **Vue/Svelte prop editing**: React-only for now.
- **Angular**: Detection only, no tree/props.
- **Phase 4**: Static analysis, CodeLens, editor decorations (planned).
- **Phase 5**: Multi-framework dashboard, CI/CD, full Marketplace polish (partial).

---

## 10. Naming Suggestions
- **FUSE** (Framework Unified Software Environment)
- **CODEX** (Contextual Development Explorer)
- **VISTA** (Versatile Inspector & State Transition Assistant)
- **FLEX** (Framework-Linked Experience)
- **SYNTH** (Synchronized Inspector for Next-gen Tooling & Harmony)
- **LUMEN** (Lightweight Unified Monitoring & Exploration Nexus)
- **REFLEX** (Real-time Extensible Framework Inspector)
- **NEXUS** (Next-gen Unified eXplorer for User Software)

---

## 11. Why This Product is Unique
- **First** to combine Flutter DevTools-style overlays, live prop editing, and code coverage in a single VS Code extension.
- **Zero external chart libraries**: All SVG, no bloat.
- **Hybrid protocol**: Typed, extensible, and robust for multi-framework support.
- **Production-grade**: Used in real-world monorepos, supports Next.js, Vite, Nuxt, SvelteKit, and more.
- **Extensible**: Modular architecture for adding new frameworks and features.

---

## 12. How to Use This Document
- Pass this file to any AI or product naming tool for creative, market-ready suggestions.
- Use the architecture and feature breakdown for marketing, documentation, or onboarding.
- Replace [PROJECT NAME TBD] with your chosen product name/title after review.

---

*Generated by GitHub Copilot (GPT-4.1) — 20 April 2026*
