"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { 
  TreePine, 
  MousePointer2, 
  Paintbrush, 
  Layout, 
  Edit3, 
  Accessibility, 
  Activity, 
  Globe 
} from "lucide-react";

const features = [
  {
    title: "Component Tree",
    description: "Experience a live, hierarchical view of your application's React, Vue, or Svelte components with seamless bidirectional synchronization. As your app updates in real-time, the tree reflects every state change instantly. This eliminates the need for manual refreshing and provides a crystal-clear map of your entire UI architecture directly inside your editor.",
    icon: TreePine,
    color: "text-blue-400",
    image: "/assets/inspector_drafted.gif",
  },
  {
    title: "Click-to-Source",
    description: "Navigate instantly from your application's user interface directly to the underlying source files via an intuitive point-and-click mechanic. Combine this with our powerful ranked text search engine to find exact definitions effortlessly. Say goodbye to hunting through complex directories; just click the element you want to edit and your cursor is immediately there.",
    icon: MousePointer2,
    color: "text-brand-primary",
    image: "/assets/preview_panel_edited.gif",
  },
  {
    title: "Debug Paint",
    description: "Enable powerful visual overlays that immediately highlight component boundaries, render depth, and complex layout constraints. This feature paints your UI with visual indicators that expose hidden styling issues and nested structures. It acts as an X-ray vision mode for your frontend, making CSS and layout debugging remarkably straightforward.",
    icon: Paintbrush,
    color: "text-purple-400",
    image: "/assets/debug_drafted.gif",
  },
  {
    title: "Layout Inspector",
    description: "Take a deep dive into your application's box models, flexbox containers, CSS grids, and computed properties. The layout inspector visualizes margins, borders, and padding in an interactive, easy-to-understand diagram. It demystifies complex CSS behaviors and ensures your structural styles behave exactly as intended across all viewports.",
    icon: Layout,
    color: "text-orange-400",
    image: "/assets/inspector_drafted.gif",
  },
  {
    title: "Live Prop Editing",
    description: "Edit component properties and state inline with our robust 3-tier fallback system designed for maximum framework compatibility. Experiment with different data inputs and instantly see the results reflect in the live application preview. This incredibly fast feedback loop allows you to test edge cases without ever leaving your development environment.",
    icon: Edit3,
    color: "text-pink-400",
    image: "/assets/inspector_drafted.gif",
  },
  {
    title: "A11y Dashboard",
    description: "Ensure your application is accessible to everyone with inline WCAG checks and severity scoring integrated directly into your workflow. The dashboard scans your UI continuously and pipes detailed warnings into the VS Code Problems panel. This allows you to treat accessibility defects just like compiler warnings, fixing them instantly.",
    icon: Accessibility,
    color: "text-emerald-400",
    image: "/assets/accessibility_drafted.gif",
  },
  {
    title: "Perf Profiling",
    description: "Optimize your application's speed with detailed React render tracking, wasted render detection, and timeline KPIs. The profiler hooks directly into the render cycle to show you exactly which components updated and why. Stop guessing about performance bottlenecks and let the data guide your state management optimizations.",
    icon: Activity,
    color: "text-red-400",
    image: "/assets/performance_drafted.gif",
  },
  {
    title: "Network Inspector",
    description: "Intercept fetch and XHR requests natively from the running app with advanced filtering and deep payload inspection. Unlike browser dev tools, this inspector isolates the network traffic specific to the components you are actively building. It provides a clean, searchable interface for verifying your API integrations in real-time.",
    icon: Globe,
    color: "text-cyan-400",
    image: "/assets/network_drafted.gif",
  },
];

export function Features() {
  return (
    <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          Everything you need to <span className="text-brand-primary">Debug.</span>
        </h2>
        <p className="text-white/50 text-lg max-w-2xl mx-auto">
          Eight powerful modules packed into one seamless extension. 
          Zero external libraries, maximum performance.
        </p>
      </div>

      <div className="flex flex-col gap-16">
        {features.map((feature, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={cn(
                "flex flex-col md:flex-row items-center gap-10 lg:gap-16 glass p-8 lg:p-12 rounded-[2.5rem] border border-white/5 group hover:border-brand-primary/20 transition-colors",
                !isEven && "md:flex-row-reverse"
              )}
            >
              <div className="flex-1 space-y-6">
                <div className={`w-16 h-16 rounded-2xl glass flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-white">{feature.title}</h3>
                <p className="text-white/60 text-lg lg:text-xl leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-brand-primary/5 rounded-2xl blur-xl group-hover:bg-brand-primary/10 transition-colors" />
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
