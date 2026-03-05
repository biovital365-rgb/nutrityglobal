import { motion } from "motion/react";
import { Heart, Mountain, Badge, Calendar, Gift, Sparkles, Bell, Infinity, FileText } from "lucide-react";

interface DashboardProps {
  results: any;
  onViewDetail: (pillar: string) => void;
  onGeneratePDF: () => void;
}

export function Dashboard({ results, onViewDetail, onGeneratePDF }: DashboardProps) {
  return (
    <div className="relative w-full max-w-md h-full min-h-screen bg-[#050505] flex flex-col shadow-2xl overflow-hidden mx-auto">
      <div className="flex items-center justify-between px-6 pt-12 pb-4 bg-black/40 backdrop-blur-md z-10 sticky top-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-magenta/10 flex items-center justify-center border border-magenta/20 overflow-hidden">
            <img src="/logo.png" alt="Mandalapp" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-white text-lg font-bold leading-tight">Mandalapp</h1>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest opacity-70">Frecuencia de {results.name.split(' ')[0]}</p>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition border border-white/5">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
        <div className="mb-8 mt-6 relative overflow-hidden rounded-[2rem] glass-panel p-8 border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-magenta/10 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan/10 rounded-full blur-[60px] pointer-events-none"></div>

          <div className="flex flex-col items-center text-center gap-4 relative z-10">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-dashed border-magenta/30 rounded-full animate-[spin_30s_linear_infinite]"></div>
              <div className="absolute inset-4 border border-cyan/20 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
              <img src="/logo.png" alt="Mandalapp" className="relative z-10 w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(219,39,119,0.5)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Tu Mandala Vibracional</h2>
              <p className="text-slate-400 text-sm mt-1">Conexión universal activada</p>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-magenta via-gold to-cyan w-full rounded-full shadow-[0_0_15px_rgba(219,39,119,0.4)]"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-white text-xl font-bold tracking-tight">5 Pilares Sagrados</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-green/10 border border-green/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></div>
            <span className="text-green text-[10px] font-black uppercase tracking-widest">Activo</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Esencia - Magenta */}
          <div
            onClick={() => onViewDetail('esencia')}
            className="glass-panel rounded-2xl p-5 flex flex-col gap-4 group relative overflow-hidden cursor-pointer hover:border-magenta/40 transition-all hover:bg-magenta/5 shadow-xl"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition">
              <Heart className="w-12 h-12 text-magenta" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-magenta/10 flex items-center justify-center text-magenta border border-magenta/10 group-hover:bg-magenta/20 transition-colors">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Esencia</p>
              <h3 className="text-white text-4xl font-bold font-display mt-1 drop-shadow-glow">{results.essence}</h3>
            </div>
          </div>

          {/* Misión - Gold */}
          <div
            onClick={() => onViewDetail('mision')}
            className="glass-panel rounded-2xl p-5 flex flex-col gap-4 group relative overflow-hidden cursor-pointer hover:border-gold/40 transition-all hover:bg-gold/5 shadow-xl"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition">
              <Mountain className="w-12 h-12 text-gold" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/10 group-hover:bg-gold/20 transition-colors">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Misión</p>
              <h3 className="text-white text-4xl font-bold font-display mt-1 drop-shadow-[0_0_10px_rgba(235,179,5,0.3)]">{results.lifePath}</h3>
            </div>
          </div>

          {/* Vibración del Nombre - Cyan */}
          <div
            onClick={() => onViewDetail('nombre')}
            className="glass-panel col-span-2 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden cursor-pointer hover:border-cyan/40 transition-all hover:bg-cyan/5 shadow-xl"
          >
            <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-cyan to-transparent"></div>
            <div className="flex gap-5 items-center z-10">
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center text-cyan shrink-0 border border-cyan/10">
                <Badge className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Vibración del Nombre</p>
                <h3 className="text-white text-xl font-bold mt-0.5">Expresión Personal</h3>
              </div>
            </div>
            <div className="flex items-center justify-center bg-black/60 rounded-xl px-5 py-2 border border-cyan/20 shadow-2xl">
              <span className="text-cyan text-3xl font-bold drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">{results.nameVibration}</span>
            </div>
          </div>

          {/* Año Personal - Orange */}
          <div
            onClick={() => onViewDetail('ano')}
            className="glass-panel rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden cursor-pointer hover:border-orange/40 transition-all hover:bg-orange/5 shadow-xl group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition">
              <Calendar className="w-12 h-12 text-orange" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-orange border border-orange/10">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Año Personal</p>
              <h3 className="text-white text-4xl font-bold font-display mt-1 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">{results.personalYear}</h3>
            </div>
          </div>

          {/* Regalo Divino - Green */}
          <div
            onClick={() => onViewDetail('regalo')}
            className="glass-panel rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden cursor-pointer hover:border-green/40 transition-all hover:bg-green/5 shadow-xl group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition">
              <Gift className="w-12 h-12 text-green" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center text-green border border-green/10">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Regalo Divino</p>
              <h3 className="text-white text-4xl font-bold font-display mt-1 drop-shadow-[0_0_10px_rgba(132,204,22,0.3)]">{results.divineGift}</h3>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] bg-gradient-to-br from-magenta/10 via-gold/5 to-cyan/10 border border-white/10 p-6 flex items-start gap-4 shadow-inner">
          <div className="bg-black/60 p-3 rounded-xl border border-white/10 shrink-0 shadow-2xl">
            <Sparkles className="text-gold w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-white font-bold text-base">Consejo del día</h4>
            <p className="text-slate-400 text-sm mt-1.5 leading-relaxed font-medium">
              La vibración <span className="text-magenta font-bold">{results.essence}</span> de tu alma brilla con fuerza hoy. Aprovecha esta energía para manifestar tus deseos más profundos.
            </p>
          </div>
        </div>

        <div className="h-32"></div>
      </div>

      <div className="absolute bottom-8 left-0 w-full px-6 flex justify-center pointer-events-none z-30">
        <button
          onClick={onGeneratePDF}
          className="pointer-events-auto w-full max-w-[340px] bg-gradient-to-r from-magenta via-orange to-gold hover:scale-[1.02] text-white font-black py-4.5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-[0_15px_40px_rgba(219,39,119,0.3)] border border-white/20"
        >
          <FileText className="w-6 h-6" />
          <span className="text-lg uppercase tracking-wider">Obtener Reporte PDF</span>
        </button>
      </div>
    </div>
  );
}
