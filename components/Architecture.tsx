"use client";

import { motion } from "framer-motion";
import { Cpu, Network, Layout, Share2 } from "lucide-react";

const steps = [
  {
    title: "The Agent",
    desc: "A lightweight IIFE injected into the browser context. It hooks into React/Vue/Svelte internals via devtools hooks and fibers.",
    icon: Cpu,
    color: "bg-brand-primary",
  },
  {
    title: "The Bridge",
    desc: "A high-performance WebSocket bridge that maintains a typed protocol between the browser and VS Code.",
    icon: Network,
    color: "bg-brand-secondary",
  },
  {
    title: "The Dashboard",
    desc: "A rich React UI embedded in a VS Code Webview, providing the unified developer experience.",
    icon: Layout,
    color: "bg-brand-accent",
  },
];

export function Architecture() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
          How it <span className="text-brand-secondary">Works.</span>
        </h2>
        <p className="text-white/40 max-w-2xl mx-auto">
          Inspectra uses a hybrid bridge architecture to deliver zero-lag, frame-accurate inspection.
        </p>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2 hidden lg:block" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass p-8 rounded-[32px] border-white/10 text-center flex flex-col items-center group"
            >
              <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform`}>
                <step.icon className="w-8 h-8 text-rich-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              
              {i < steps.length - 1 && (
                <div className="mt-8 lg:hidden">
                  <Share2 className="w-6 h-6 text-white/10 rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
