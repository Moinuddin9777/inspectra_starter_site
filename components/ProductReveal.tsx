"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Search, Zap, Code2 } from "lucide-react";

export function ProductReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [45, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section id="product" ref={containerRef} className="py-40 perspective-[1200px] overflow-hidden">
      <motion.div 
        style={{ scale, rotateX, opacity }}
        className="max-w-6xl mx-auto px-6"
      >
        <div className="glass rounded-[40px] p-8 md:p-12 border-white/10 shadow-[0_0_100px_rgba(79,248,210,0.1)] relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                Inspect components <br /> 
                <span className="text-brand-primary">Directly</span> in the browser.
              </h2>
              
              <div className="space-y-6">
                {[
                  { icon: Search, title: "Ranked Text Search", text: "Proprietary engine for instant source navigation." },
                  { icon: Zap, title: "Zero Lag Bridge", text: "Optimized WebSocket protocol for real-time updates." },
                  { icon: Code2, title: "Hybrid Architecture", text: "React + Legacy IIFE agent for max framework support." },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg glass flex items-center justify-center text-brand-primary shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{item.title}</h4>
                      <p className="text-white/50 text-sm">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 bg-brand-primary/20 blur-[100px] rounded-full animate-pulse-slow" />
              <Card className="aspect-video relative z-10 p-0 overflow-hidden border-white/20 bg-rich-black/50 backdrop-blur-3xl">
                {/* Mock code editor UI */}
                <div className="flex flex-col h-full">
                  <div className="h-10 bg-white/5 flex items-center px-4 gap-2 border-b border-white/10">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-4">
                      App.tsx — Inspectra Agent Active
                    </div>
                  </div>
                  <div className="flex-1 p-6 font-mono text-sm leading-relaxed">
                    <div className="text-brand-secondary">import</div> <div className="text-white">React</div> <div className="text-brand-secondary">from</div> <div className="text-brand-primary">&apos;react&apos;</div>;
                    <br />
                    <div className="text-brand-secondary">export function</div> <div className="text-yellow-400">Dashboard</div>() {"{"}
                    <div className="pl-4">
                      <div className="text-brand-secondary">return</div> (
                      <div className="pl-4">
                        <div className="text-white/40">&lt;</div><div className="text-brand-primary">main</div> <div className="text-white/40">className=</div><div className="text-brand-primary">&quot;flex h-screen&quot;</div><div className="text-white/40">&gt;</div>
                        <div className="pl-4 border-l border-brand-primary/30 my-1 bg-brand-primary/5">
                           <div className="text-white/40">&lt;</div><div className="text-brand-primary">Sidebar</div> <div className="text-white/40">/&gt;</div>
                           <div className="text-xs bg-brand-primary text-rich-black px-1.5 rounded absolute right-6 -mt-4 font-bold">Selected</div>
                        </div>
                        <div className="text-white/40">&lt;/</div><div className="text-brand-primary">main</div><div className="text-white/40">&gt;</div>
                      </div>
                      );
                    </div>
                    {"}"}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
