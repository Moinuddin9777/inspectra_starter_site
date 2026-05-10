"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import {
  Zap,
  BarChart3,
  ShieldCheck,
  GitBranch,
  MonitorSmartphone,
} from "lucide-react";

const achievements = [
  {
    title: "Ranked Search Engine",
    value: "100ms",
    label: "Avg. Resolution",
    icon: Zap,
    className: "lg:col-span-2",
  },
  {
    title: "SVG Chart System",
    value: "0.0kb",
    label: "External Libs",
    icon: BarChart3,
    className: "lg:col-span-1",
  },
  {
    title: "A11y Audit",
    value: "WCAG 2.1",
    label: "Compliance Ready",
    icon: ShieldCheck,
    className: "lg:col-span-1",
  },
  {
    title: "Source Integration",
    value: "Git/VVS",
    label: "Deep Link Source",
    icon: GitBranch,
    className: "lg:col-span-1",
  },
  {
    title: "Framework Support",
    value: "React/Vue/Svelte",
    label: "Universal Agent",
    icon: MonitorSmartphone,
    className: "lg:col-span-2",
  },
];

export function TechnicalAchievements() {
  return (
    <section id="specs" className="py-32 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-white">Technical <span className="text-brand-secondary">Powerhouse.</span></h2>
          <p className="text-white/40 mt-4">Built for performance-critical monorepos and enterprise applications.</p>
        </div>

        {achievements.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={item.className}
          >
            <Card className="h-full group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <item.icon className="w-24 h-24" />
              </div>
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-white/60 text-sm font-bold uppercase tracking-widest mb-2">{item.title}</h4>
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">{item.value}</div>
                  <div className="text-brand-primary text-sm font-medium">{item.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
