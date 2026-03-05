import { motion } from "motion/react";
import { ChevronLeft, Share, Calculator, Sparkles, Zap, Gift, ChevronDown } from "lucide-react";
import { getDetailedInterpretation, getCalculationSteps } from "../lib/interpretations";

interface DetailViewProps {
  pillar: string;
  results: any;
  onBack: () => void;
}

export function DetailView({ pillar, results, onBack }: DetailViewProps) {
  const data = (() => {
    const numberMap: Record<string, any> = {
      esencia: results.essence,
      mision: results.lifePath,
      nombre: results.nameVibration,
      ano: results.personalYear,
      regalo: results.divineGift
    };

    const pillarNum = numberMap[pillar] || results.essence;
    const interpretation = getDetailedInterpretation(pillar, pillarNum);

    // Fix para evitar desfase de zona horaria en la visualización
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "--/--/----";
      const [y, m, d] = dateStr.split('-').map(Number);
      return `${d}/${m}/${y}`;
    };

    const titles: Record<string, string> = {
      esencia: "Esencia (Alma)",
      mision: "Misión de Vida",
      nombre: "Vibración del Nombre",
      ano: "Año Personal",
      regalo: "Regalo Divino"
    };

    const colorMap: Record<string, string> = {
      esencia: '#db2777', // Magenta
      mision: '#ebb305',  // Gold
      nombre: '#06b6d4',  // Cyan
      ano: '#f97316',     // Orange
      regalo: '#84cc16'   // Green
    };

    const currentColor = colorMap[pillar] || '#db2777';

    return {
      title: titles[pillar] || "Análisis",
      number: numberMap[pillar] || "?",
      subtitle: interpretation.subtitle,
      desc: interpretation.desc,
      essence: interpretation.essence,
      pillarNuance: interpretation.pillarNuance,
      challenges: interpretation.challenges,
      giftText: interpretation.gift,
      calc: results.dob ? formatDate(results.dob) : "--/--/----",
      calcSteps: getCalculationSteps(pillar, results),
      color: currentColor,
      icon: <Sparkles className="w-5 h-5" />
    };
  })();

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto overflow-hidden bg-[#050505] shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-[#090518] via-[#050505] to-[#010102] pointer-events-none z-0"></div>

      {/* Background effects */}
      <div
        className="absolute top-[-10%] left-[-10%] right-[-10%] h-[500px] pointer-events-none z-0 opacity-40"
        style={{ background: `radial-gradient(circle at 50% 40%, ${data.color}40, transparent 70%)` }}
      ></div>
      <div
        className="absolute -top-[50px] -right-[50px] w-[200px] h-[200px] rounded-full blur-[100px] pointer-events-none z-0 opacity-30"
        style={{ backgroundColor: data.color }}
      ></div>

      <header className="sticky top-0 z-50 flex items-center justify-between p-5 bg-black/60 backdrop-blur-2xl border-b border-white/5">
        <button onClick={onBack} aria-label="Volver" className="flex w-10 h-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white border border-white/5">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/60">{data.title}</h2>
        <div className="w-10 h-10"></div>
      </header>

      <main className="flex-1 flex flex-col relative z-10 pb-32">
        <section className="relative flex flex-col items-center justify-center pt-8 pb-10 px-6">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              className="w-[400px] h-[400px] rounded-full border animate-[spin_60s_linear_infinite] opacity-10"
              style={{ borderColor: data.color }}
            ></div>
            <div
              className="absolute w-[300px] h-[300px] rounded-full border border-dashed animate-[spin_40s_linear_infinite_reverse] opacity-20"
              style={{ borderColor: data.color }}
            ></div>
          </div>

          <div className="relative z-10 mb-4 flex items-center justify-center">
            <h1
              className="text-[150px] font-black leading-none tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]"
              style={{ textShadow: `0 0 40px ${data.color}80` }}
            >
              {data.number}
            </h1>
          </div>

          <div className="text-center relative z-10 space-y-4 px-6">
            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-2xl">{data.subtitle}</h2>
            <p className="text-slate-300 text-base font-medium leading-relaxed max-w-[300px] mx-auto opacity-80">
              {data.desc}
            </p>
          </div>
        </section>

        <section className="px-5 mb-8">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1.5 h-full opacity-70"
              style={{ backgroundColor: data.color }}
            ></div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <Calculator className="w-5 h-5 text-white/60" />
              </div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cálculo Vibracional</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Nacimiento</span>
                <span className="font-mono text-white text-lg font-bold tracking-widest">{data.calc}</span>
              </div>
              <div className="h-px bg-white/5 w-full"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Reducción</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-slate-400 font-bold">{data.calcSteps}</span>
                  <div className="w-px h-6 bg-white/10"></div>
                  <span
                    className="text-2xl font-black italic drop-shadow-glow"
                    style={{ color: data.color }}
                  >
                    {data.number}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 space-y-5">
          {/* Significado accordion */}
          <details className="group glass-panel rounded-3xl overflow-hidden border border-white/5 transition-all duration-500 open:border-white/15" open>
            <summary className="flex cursor-pointer items-center justify-between p-6 list-none group-open:bg-white/5">
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-2xl border bg-opacity-10"
                  style={{ backgroundColor: `${data.color}15`, borderColor: `${data.color}30`, color: data.color }}
                >
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white tracking-wide text-base uppercase tracking-widest">Sabiduría</h3>
                </div>
              </div>
              <ChevronDown className="w-6 h-6 text-slate-500 transition-transform duration-500 group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-8 pt-2">
              <div className="w-full h-px bg-white/5 mb-6"></div>
              <div className="space-y-5 text-slate-300 text-base leading-[1.8] font-medium">
                <p
                  className="pl-5 border-l-2 py-3 bg-white/5 rounded-r-2xl shadow-inner italic"
                  style={{ borderLeftColor: data.color }}
                >
                  {data.pillarNuance}
                </p>
                <p className="opacity-90">
                  {data.essence}
                </p>
              </div>
            </div>
          </details>

          {/* Sombra accordion */}
          <details className="group glass-panel rounded-3xl overflow-hidden border border-white/5 transition-all duration-500 open:border-red-500/20">
            <summary className="flex cursor-pointer items-center justify-between p-6 list-none group-open:bg-red-500/5">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-black text-white tracking-wide text-base uppercase tracking-widest">Desafíos</h3>
              </div>
              <ChevronDown className="w-6 h-6 text-slate-500 transition-transform duration-500 group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-8 pt-2">
              <div className="w-full h-px bg-white/5 mb-6"></div>
              <ul className="space-y-5">
                {data.challenges.map((challenge: string, i: number) => (
                  <li key={i} className="flex gap-4 text-base text-slate-300 leading-relaxed font-medium">
                    <div className="mt-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] shrink-0"></div>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>

          {/* Regalo accordion */}
          <details className="group glass-panel rounded-3xl overflow-hidden border border-white/5 transition-all duration-500 open:border-green/20">
            <summary className="flex cursor-pointer items-center justify-between p-6 list-none group-open:bg-green/5">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl border border-green/20 bg-green/10 text-green">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="font-black text-white tracking-wide text-base uppercase tracking-widest">Dones</h3>
              </div>
              <ChevronDown className="w-6 h-6 text-slate-500 transition-transform duration-500 group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-8 pt-2">
              <div className="w-full h-px bg-white/5 mb-6"></div>
              <div
                className="p-6 rounded-2xl border border-white/10 mb-5 relative overflow-hidden"
                style={{ backgroundColor: '#ffffff03' }}
              >
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ background: `radial-gradient(circle at 70% 30%, ${data.color}, transparent 100%)` }}
                ></div>
                <p className="text-white text-[17px] font-black tracking-tight leading-snug">{data.giftText}</p>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium opacity-80">
                Al integrar tu sombra, accedes a una capacidad única para manifestar tus talentos. Tu vibración se convierte en un puente entre tus ideales y la realidad física.
              </p>
            </div>
          </details>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-50 flex flex-col gap-4 max-w-md mx-auto">
        <button
          className="w-full h-16 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 shadow-2xl transition-all transform active:scale-95 border border-white/20"
          style={{ background: `linear-gradient(135deg, ${data.color}, ${data.color}dd)`, boxShadow: `0 15px 40px ${data.color}30` }}
        >
          <Share className="w-6 h-6" />
          <span className="uppercase tracking-widest">Compartir Guía</span>
        </button>
        <button
          onClick={onBack}
          className="w-full py-2 text-xs text-slate-500 font-black uppercase tracking-[0.3em] hover:text-white transition-colors"
        >
          Explorar Otros Pilares
        </button>
      </div>
    </div>
  );
}
