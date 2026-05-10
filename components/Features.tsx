"use client";

import { motion } from "framer-motion";
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
    description: "Live, hierarchical view of your app's components with bidirectional sync.",
    icon: TreePine,
    color: "text-blue-400",
  },
  {
    title: "Click-to-Source",
    description: "Instant navigation to source files via point-and-click or ranked text search.",
    icon: MousePointer2,
    color: "text-brand-primary",
  },
  {
    title: "Debug Paint",
    description: "Visual overlays for component boundaries, depth, and layout constraints.",
    icon: Paintbrush,
    color: "text-purple-400",
  },
  {
    title: "Layout Inspector",
    description: "Deep dive into box models, flex, grid, and computed CSS properties.",
    icon: Layout,
    color: "text-orange-400",
  },
  {
    title: "Live Prop Editing",
    description: "Edit props inline with 3-tier fallback for maximum compatibility.",
    icon: Edit3,
    color: "text-pink-400",
  },
  {
    title: "A11y Dashboard",
    description: "Inline WCAG checks, severity scoring, and VS Code integration.",
    icon: Accessibility,
    color: "text-emerald-400",
  },
  {
    title: "Perf Profiling",
    description: "React render tracking, wasted render detection, and timeline KPIs.",
    icon: Activity,
    color: "text-red-400",
  },
  {
    title: "Network Inspector",
    description: "Intercept fetch/XHR, display payloads, and advanced filtering.",
    icon: Globe,
    color: "text-cyan-400",
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full group hover:translate-y-[-8px] transition-all duration-300">
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl glass flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
