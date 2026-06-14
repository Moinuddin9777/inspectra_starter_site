"use client";

import { motion } from "framer-motion";

const frameworks = [
  { name: "React", logo: "⚛️", status: "Full Support" },
  { name: "Next.js", logo: "▲", status: "Full Support" },
  { name: "Vue.js", logo: "🖖", status: "Tree + Source" },
  { name: "Nuxt", logo: "🟢", status: "Tree + Source" },
  { name: "Svelte", logo: "🔥", status: "Beta" },
  { name: "Angular", logo: "🅰️", status: "Detection" },
];

export function Frameworks() {
  return (
    <section id="frameworks" className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Multi-Framework by <span className="text-brand-primary">Design.</span></h2>
          <p className="text-white/40">Inspectra supports the ecosystem you already use.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {frameworks.map((fw, i) => (
            <motion.div
              key={fw.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-125">
                {fw.logo}
              </div>
              <div className="text-white font-bold text-sm mb-1">{fw.name}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-white/20 group-hover:text-brand-primary transition-colors">
                {fw.status}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-brand-primary" />
          <span className="text-lg font-bold tracking-tighter text-white uppercase">Inspectra</span>
          <span className="bg-brand-primary/20 text-brand-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ml-1 border border-brand-primary/30">Beta</span>
        </div>
        
        <nav className="flex gap-10 text-sm font-medium text-white/40" aria-label="Footer">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#specs" className="hover:text-white transition-colors">Specs</a>
          <a href="#frameworks" className="hover:text-white transition-colors">Frameworks</a>
          <a href="/" className="hover:text-white transition-colors">Home</a>
        </nav>

        <div className="text-xs text-white/20 font-mono">
          © 2026 INSPECTRA. BUILT FOR THE NEXT GENERATION.
        </div>
      </div>
    </footer>
  );
}
