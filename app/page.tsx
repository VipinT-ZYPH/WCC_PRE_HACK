'use client';

import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Target, Zap, Shield, Rocket, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/components/ProjectProvider';

export default function LandingPage() {
  const router = useRouter();
  const { createProject } = useProjectStore();

  const handleStart = () => {
    router.push('/create');
  };

  const handleDemo = () => {
    const demoProject = createProject({
      name: "HackMatch AI",
      roughIdea: "I want to build an AI platform that helps college students find the right teammates for hackathons based on skills, interests, availability and working style.",
      targetAudience: "College students, Hackathon participants",
      industry: "EdTech / Collaboration",
      market: "Global",
      goal: "Facilitate better hackathon team formation",
    });
    router.push(`/dashboard/${demoProject.id}`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">BrandForge AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#workflow" className="hover:text-white transition-colors">The Workflow</a>
          </div>
          <button 
            onClick={handleStart}
            className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 inline-block">
              Intelligent Brand Systems
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              From rough idea to brand <br /> that makes sense.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Turn an incomplete product idea into a coherent, validated and launch-ready brand system with an AI workflow that thinks through your brand instead of simply generating text.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-all group shadow-lg shadow-indigo-500/20"
              >
                Build My Brand
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleDemo}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all"
              >
                Try Demo Project
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Multi-Stage AI Workflow</h2>
            <p className="text-slate-400">BrandForge AI doesn&apos;t use a single prompt. It builds your identity layer by layer.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Target, name: "Understand", desc: "Discovery & context", color: "indigo" },
              { icon: Activity, name: "Position", desc: "Strategic direction", color: "purple" },
              { icon: Shield, name: "Shape", desc: "Naming & personality", color: "pink" },
              { icon: Zap, name: "Visualize", desc: "Identity system", color: "blue" },
              { icon: Sparkles, name: "Challenge", desc: "AI Brand Critic", color: "emerald" },
              { icon: Rocket, name: "Launch", desc: "Ready-to-use kit", color: "orange" },
            ].map((step, i) => (
              <motion.div
                key={step.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <step.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-bold mb-2">{step.name}</h3>
                <p className="text-xs text-slate-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-slate-950/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">The AI Brand Critic</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Most AI tools just say "yes" to your ideas. BrandForge AI includes a dedicated Critic stage that challenges your positioning, naming, and visual choices to ensure they aren&apos;t generic or misaligned.
              </p>
              <ul className="space-y-4">
                {[
                  "Checks for audience mismatch",
                  "Identifies generic startup clichés",
                  "Ensures messaging consistency",
                  "Suggests strategic improvements"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
              <div className="relative p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Brand Critic Analysis</span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <h4 className="text-red-400 text-sm font-bold mb-1">Issue: Generic Naming</h4>
                    <p className="text-xs text-slate-400">"MatchMaker" is overused in the recruitment space and lacks a unique emotional hook for college students.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <h4 className="text-indigo-400 text-sm font-bold mb-1">Strength: Clear Value Prop</h4>
                    <p className="text-xs text-slate-400">The "skill-first matching" positioning directly addresses the core student pain point of project failure.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>&copy; 2026 BrandForge AI. Built for the future of identity.</p>
      </footer>
    </div>
  );
}
