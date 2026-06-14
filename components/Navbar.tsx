"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 pointer-events-none"
    >
      <nav className="glass rounded-full px-8 py-3 flex items-center gap-8 pointer-events-auto backdrop-blur-2xl">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Search className="w-5 h-5 text-rich-black" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">INSPECTRA</span>
          <span className="bg-brand-primary/20 text-brand-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ml-1 border border-brand-primary/30">Beta</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
          <Link href="#features" className="hover:text-brand-primary transition-colors">Features</Link>
          <Link href="#specs" className="hover:text-brand-primary transition-colors">Specs</Link>
          <Link href="#frameworks" className="hover:text-brand-primary transition-colors">Frameworks</Link>
        </div>

        <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

        <Link
          href="/docs"
          className={cn(
            "hidden md:inline-flex items-center justify-center rounded-xl transition-all duration-300 active:scale-95",
            "glass text-white hover:bg-white/10 border-white/20",
            "h-9 px-4 text-xs"
          )}
        >
          Docs
        </Link>
      </nav>
    </motion.header>
  );
}
