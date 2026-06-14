"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TreePine, MousePointer2, Layout, Edit3,
  FileCode2, Activity, Globe, Lightbulb,
  Paintbrush, Bug
} from "lucide-react";

function LoopingGifPlayer({ gifs }: { gifs: string[] }) {
  const [currentGif, setCurrentGif] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { margin: "0px", amount: 0.1 });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInView && gifs.length > 1) {
      interval = setInterval(() => {
        setCurrentGif((prev) => (prev + 1) % gifs.length);
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInView, gifs.length]);

  return (
    <div ref={containerRef} className="relative aspect-[16/10] md:aspect-[21/9] w-full bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl mb-12 group">
      <div className="absolute inset-0 bg-brand-primary/5 rounded-[2.5rem] blur-xl group-hover:bg-brand-primary/10 transition-colors z-0" />
      {isInView ? (
        <motion.img
          key={gifs[currentGif]}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          src={gifs[currentGif]}
          alt="Feature Demo"
          className="w-full h-full object-cover object-center relative z-10"
        />
      ) : (
        <div className="w-full h-full bg-slate-900 relative z-10" />
      )}
    </div>
  );
}

const section1Features = [
  { title: "Component Tree", description: "Experience a live, hierarchical view of your application's React, Vue, or Svelte components with seamless bidirectional synchronization. As your app updates in real-time, the tree reflects every state change instantly. This eliminates the need for manual refreshing and provides a crystal-clear map of your entire UI architecture directly inside your editor.", icon: TreePine, color: "text-blue-400" },
  { title: "Component to source", description: "Navigate instantly from your application's user interface directly to the underlying source files via an intuitive point-and-click mechanic. Combine this with our powerful ranked text search engine to find exact definitions effortlessly. Say goodbye to hunting through complex directories; just click the element you want to edit and your cursor is immediately there.", icon: MousePointer2, color: "text-brand-primary" },
  { title: "Layout Inspector", description: "Take a deep dive into your application's box models, flexbox containers, CSS grids, and computed properties. The layout inspector visualizes margins, borders, and padding in an interactive, easy-to-understand diagram. It demystifies complex CSS behaviors and ensures your structural styles behave exactly as intended across all viewports.", icon: Layout, color: "text-orange-400" },
  { title: "Prop Editor", description: "Edit component properties and state inline with our robust 3-tier fallback system designed for maximum framework compatibility. Experiment with different data inputs and instantly see the results reflect in the live application preview. This incredibly fast feedback loop allows you to test edge cases without ever leaving your development environment.", icon: Edit3, color: "text-pink-400" },
];
const section1Gifs = [
  "/assets/preview_panel_edited.gif",
  "/assets/inspector_drafted.gif",
  "/assets/debug_drafted.gif"
];

const section2Features = [
  { title: "Code Coverage", description: "Analyze your codebase with Git-aware coverage tracking that parses Istanbul, LCOV, and Cobertura formats natively. Uncover hidden risk hotspots with line-by-line source highlighting directly in your editor. Trend visualizations help your team understand exactly which files need more testing, ensuring your application remains robust and regression-free over time.", icon: FileCode2, color: "text-orange-400" },
  { title: "Perf Profiler", description: "Optimize your application's speed with detailed React render tracking, wasted render detection, and timeline KPIs. The profiler hooks directly into the render cycle to show you exactly which components updated and why. Stop guessing about performance bottlenecks and let the data guide your state management optimizations for a lightning-fast user experience.", icon: Activity, color: "text-red-400" },
  { title: "Network Tab", description: "Intercept fetch and XHR requests natively from the running app with advanced filtering and deep payload inspection. Unlike standard browser dev tools, this inspector isolates the network traffic specific to the components you are actively building. It provides a clean, searchable interface for verifying your API integrations and headers in real-time.", icon: Globe, color: "text-cyan-400" },
  { title: "Code Insights", description: "Leverage advanced AI diagnostics to instantly interpret complex stack traces and runtime errors. Instead of just surfacing raw data, Inspectra automatically provides root-cause analysis and actionable code suggestions. This intelligent copilot accelerates your debugging workflow by pinpointing performance bottlenecks and recommending precise state management optimizations.", icon: Lightbulb, color: "text-yellow-400" },
];
const section2Gifs = [
  "/assets/inspector_drafted.gif",
  "/assets/network_drafted.gif",
  "/assets/performance_drafted.gif",
  "/assets/code_coverage_drafted.gif"
];

const section3Features = [
  { title: "Debug Paint", description: "Enable powerful visual overlays that immediately highlight component boundaries, render depth, and complex layout constraints. This feature paints your UI with visual indicators that expose hidden styling issues and nested structures. It acts as an X-ray vision mode for your frontend, making CSS and layout debugging remarkably straightforward.", icon: Paintbrush, color: "text-purple-400" },
  { title: "CDP Debugger", description: "Experience full Chrome DevTools Protocol (CDP) integration allowing you to set breakpoints and step through code directly in your editor. Seamlessly inspect local scope, call stacks, and variables without switching contexts. It bridges the gap between Node.js backend logic and browser frontend execution for a truly unified debugging environment.", icon: Bug, color: "text-emerald-400" },
];
const section3Gifs = [
  "/assets/debug_drafted.gif",
  "/assets/preview_panel_edited.gif"
];

function FeatureGrid({ features, cols = 2 }: { features: any[], cols?: number }) {
  return (
    <div className={cn("grid gap-6", cols === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2")}>
      {features.map((feature, idx) => (
        <div key={idx} className="glass p-8 rounded-3xl border border-white/5 group hover:border-brand-primary/20 transition-colors flex items-start gap-6">
          <div className={`w-14 h-14 rounded-2xl glass flex items-center justify-center shrink-0 ${feature.color} group-hover:scale-110 transition-transform`}>
            <feature.icon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-white/60 text-base leading-relaxed">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-32 px-6 max-w-6xl mx-auto space-y-32">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          Everything you need to <span className="text-brand-primary">Debug.</span>
        </h2>
        <p className="text-white/50 text-lg max-w-2xl mx-auto">
          Eight powerful modules packed into one seamless extension.
          Zero external libraries, maximum performance.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
        <LoopingGifPlayer gifs={section1Gifs} />
        <FeatureGrid features={section1Features} cols={2} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
        <LoopingGifPlayer gifs={section2Gifs} />
        <FeatureGrid features={section2Features} cols={2} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
        <LoopingGifPlayer gifs={section3Gifs} />
        <FeatureGrid features={section3Features} cols={2} />
      </motion.div>

    </section>
  );
}
