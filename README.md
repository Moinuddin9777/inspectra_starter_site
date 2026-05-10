# 🔍 INSPECTRA — Real-time Web Component Inspector

Inspectra is a production-grade VS Code extension designed for real-time inspection, debugging, and analysis of modern web applications. Inspired by Flutter DevTools, it provides a unified, extensible, and visually rich developer experience across multiple frameworks including React, Vue, and Svelte.

![Inspectra Hero](/hero-mockup.png)

## 🚀 Core Features

- **Component Tree**: Live, hierarchical view of your app's components with bidirectional sync between VS Code and the browser.
- **Click-to-Source**: Point-and-click inspector with ranked text search for instant navigation to data definitions and source files.
- **Debug Paint Overlay**: Visual overlays for component boundaries, layout depth, and flex/grid constraints.
- **Layout Inspector**: Deep dive into the box model, computed CSS, and live property editing.
- **Performance Profiling**: React render tracking, wasted render detection, and a high-fidelity timeline.
- **Accessibility Dashboard**: Inline WCAG checks, severity scoring, and VS Code Problems integration.
- **Zero External Charts**: All visualization is built with raw SVG for maximum performance and zero bundle bloat.

## 🛠️ Framework Support

| Framework | Tree | Props | Source | Edit |
|-----------|------|-------|--------|------|
| React 16+ | ✅ | ✅ | ✅ | ✅ |
| Vue 2/3   | ✅ | ✅ | ✅ | ⚠️ (Planned) |
| Svelte 3+ | ✅ | ⚠️ | ✅ | ⚠️ (Planned) |

## 🏗️ Architecture

Inspectra uses a **Hybrid Bridge** architecture:
1. **Agent**: A lightweight IIFE injected into the browser for framework hooking and DOM overlays.
2. **Server**: A WebSocket bridge for type-safe, real-time communication.
3. **UI**: A modern React-based dashboard embedded within VS Code.

## 📦 Getting Started

This repository contains the landing page and documentation for the Inspectra project.

### Local Development

1. **Clone the repo**:
   ```bash
   git clone [repository-url]
   cd inspectra_starter_site
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the site**:
   ```bash
   npm run dev
   ```

## 📜 Changelog

Notable updates in **v1.4.0**:
- 🔍 **Ranked Text Search**: Intelligent engine for mapping browser text to CMS/config definitions.
- ⚡ **Pre-resolution**: Batch resolution of ancestor hierarchies for flicker-free context menus.
- 🛡️ **Stability Hardening**: Improved WebSocket reconnect logic and error boundary handling.

---

Built for the next generation of web developers. 🚀
