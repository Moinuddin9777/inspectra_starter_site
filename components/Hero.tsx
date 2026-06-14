"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Play, Terminal, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
export function Hero() {
  return (
    <section className="relative min-h-screen pt-32 flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/10 text-xs font-medium text-brand-primary mb-6">
          <Terminal className="w-3 h-3" />
          <span>v1.4.0 — Ranked Text Search is here</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-6 leading-[1.1]">
          Debug at the speed of <span className="text-transparent bg-clip-text bg-futuristic-glow text-glow">Thought.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          Production-grade VS Code extension for real-time inspection, debugging, and analysis of modern web apps. 
          The unified developer experience inspired by Flutter DevTools.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <a
            href="https://forms.gle/UbYYteTvAUZSU4Rb8"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group inline-flex items-center justify-center rounded-xl transition-all duration-300 active:scale-95",
              "bg-brand-primary text-rich-black hover:bg-brand-primary/90 shadow-[0_0_30px_rgba(59,130,246,0.6)]",
              "h-14 px-8 text-base font-bold w-full sm:w-auto"
            )}
          >
            Join Waitlist
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="https://youtu.be/xkJnywEfsog"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group inline-flex items-center justify-center rounded-xl transition-all duration-300 active:scale-95",
              "glass text-white hover:bg-white/10 border-white/20",
              "h-14 px-8 text-base font-semibold w-full sm:w-auto"
            )}
          >
            <Play className="w-4 h-4 mr-2 fill-white group-hover:scale-110 transition-transform" />
            Watch Demo
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative w-full max-w-6xl mx-auto"
      >
        <div className="glass rounded-3xl p-2 border-white/10 shadow-2xl relative group overflow-hidden">
          <div className="absolute inset-0 bg-futuristic-glow rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
          <div className="relative aspect-[16/10] w-full bg-slate-900 rounded-2xl z-10 overflow-hidden border border-white/5">
            <img 
              src="/assets/hero.gif" 
              alt="Inspectra Demo" 
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
