import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, User, ArrowRight, ArrowLeft, CheckCircle2, Info } from "lucide-react";
import { cn } from "../lib/utils";

interface OnboardingProps {
  onComplete: (data: { dob: string; name: string }) => void;
  onBack: () => void;
}

export function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [dob, setDob] = useState("");
  const [name, setName] = useState("");

  const handleNext = () => {
    if (step === 1 && dob) {
      setStep(2);
    } else if (step === 2 && name.length > 3) {
      onComplete({ dob, name });
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onBack();
    }
  };

  return (
    <div className="w-full max-w-md h-full min-h-screen relative flex flex-col bg-[#191022] overflow-hidden shadow-2xl mx-auto">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Header / Progress */}
      <header className="relative z-10 pt-8 pb-2 px-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-xs font-medium text-slate-400 uppercase tracking-widest">Paso {step} de 4</div>
          <button className="text-slate-400 hover:text-white transition-colors">
            <Info className="w-6 h-6" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="flex w-full flex-row items-center justify-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-accent purple-glow"></div>
          <div className={cn("h-1.5 flex-1 rounded-full border border-white/5", step >= 2 ? "bg-accent purple-glow" : "bg-[#231e30]")}></div>
          <div className="h-1.5 flex-1 rounded-full bg-[#231e30] border border-white/5"></div>
          <div className="h-1.5 flex-1 rounded-full bg-[#231e30] border border-white/5"></div>
        </div>
      </header>

      {/* Main Content Scrollable Area */}
      <main className="flex-1 overflow-y-auto relative z-10 px-6 py-4 flex flex-col gap-8 no-scrollbar">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.section
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col"
            >
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 border border-accent/20 purple-glow">
                  <Calendar className="text-accent w-8 h-8" />
                </div>
                <h1 className="text-slate-100 text-2xl font-bold text-center tracking-tight mb-2">Tu Origen Cósmico</h1>
                <p className="text-slate-400 text-sm text-center max-w-[280px] leading-relaxed">
                  La vibración de tu nacimiento define tu mapa espiritual. Ingresa la fecha exacta.
                </p>
              </div>
              
              <div className="glass-panel rounded-2xl p-6 shadow-lg mb-8 bg-[#231e30]/60">
                <label className="block text-sm font-medium text-slate-300 mb-2">Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-[#191022] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all [color-scheme:dark]"
                />
              </div>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col"
            >
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#231e30] flex items-center justify-center mb-4 border border-white/5">
                  <User className="text-slate-400 w-8 h-8" />
                </div>
                <h2 className="text-slate-200 text-xl font-bold text-center tracking-tight mb-2">Tu Identidad Terrenal</h2>
                <p className="text-slate-500 text-sm text-center max-w-[280px] leading-relaxed">
                  Tu nombre completo tal como aparece en tu acta de nacimiento.
                </p>
              </div>
              
              <div className="relative w-full mb-2">
                <label className="sr-only" htmlFor="fullname">Nombre Completo</label>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-slate-500 w-5 h-5" />
                </div>
                <input 
                  id="fullname"
                  name="fullname"
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. María Josefa García"
                  className="block w-full pl-12 pr-12 py-4 bg-[#231e30]/50 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 backdrop-blur-sm"
                />
                {name.length > 3 && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <CheckCircle2 className="text-amber-500 w-5 h-5 animate-pulse" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 px-2 mt-2">
                <Info className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-amber-500/80">Recuerda incluir ambos apellidos.</p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Action */}
      <div className="relative z-20 p-6 pt-4 bg-gradient-to-t from-[#191022] via-[#191022] to-transparent">
        <button 
          onClick={handleNext}
          disabled={(step === 1 && !dob) || (step === 2 && name.length < 3)}
          className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl purple-glow transition-all duration-300 flex items-center justify-center gap-2 group transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continuar</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-center text-[10px] text-slate-600 mt-4">
          La información es confidencial y usada solo para tu carta astral.
        </p>
      </div>
    </div>
  );
}
