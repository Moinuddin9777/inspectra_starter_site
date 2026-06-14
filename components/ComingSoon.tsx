"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { 
  Bot, 
  Lightbulb, 
  ShieldCheck, 
  FlaskConical, 
  Users, 
  Network, 
  LineChart, 
  Blocks 
} from "lucide-react";

const comingSoonFeatures = [
  {
    title: "AI Diagnostics",
    description: "Instead of just surfacing data, Inspectra will interpret it. Automated root-cause analysis for renders and errors.",
    icon: Bot,
    color: "text-blue-400",
  },
  {
    title: "Automated Recommendations",
    description: "Actionable code suggestions for performance bottlenecks and state management optimizations.",
    icon: Lightbulb,
    color: "text-yellow-400",
  },
  {
    title: "Deep Audit Mode",
    description: "Enterprise-grade accessibility scanning powered by axe-core, seamlessly integrated into your IDE.",
    icon: ShieldCheck,
    color: "text-emerald-400",
  },
  {
    title: "Test Generation",
    description: "AI-assisted test generation based on runtime coverage gaps and observed component behavior.",
    icon: FlaskConical,
    color: "text-purple-400",
  },
  {
    title: "Team Session Sharing",
    description: "Export diagnostics, compare branch snapshots, and share inspection sessions with your team.",
    icon: Users,
    color: "text-pink-400",
  },
  {
    title: "Engineering Knowledge Graph",
    description: "Map hidden relationships between your UI components, source code, and runtime behavior.",
    icon: Network,
    color: "text-brand-primary",
  },
  {
    title: "Application Observability",
    description: "Track error trends, API failure rates, and runtime exceptions directly from the development environment.",
    icon: LineChart,
    color: "text-orange-400",
  },
  {
    title: "Expanded Framework Support",
    description: "First-class inspection support for Angular, SolidJS, Qwik, Lit, and native Web Components.",
    icon: Blocks,
    color: "text-cyan-400",
  },
];

export function ComingSoon() {
  return (
    <section id="coming-soon" className="py-32 px-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="text-center mb-20 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-brand-primary/20 text-xs font-medium text-brand-primary mb-6">
          <span>Roadmap</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          The Future of <span className="text-transparent bg-clip-text bg-futuristic-glow text-glow">Application Intelligence.</span>
        </h2>
        <p className="text-white/50 text-lg max-w-2xl mx-auto">
          We&apos;re evolving from an inspector into an AI-powered Engineering Copilot. 
          Here&apos;s what is coming next to your workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {comingSoonFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full group hover:translate-y-[-8px] hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all duration-300 relative overflow-hidden border-white/5">
              <div className="absolute top-0 right-0 p-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-white/20">Soon</span>
              </div>
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl glass flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg text-white/90">{feature.title}</CardTitle>
                <CardDescription className="leading-relaxed text-white/50">
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
