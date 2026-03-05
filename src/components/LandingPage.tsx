import { motion } from "motion/react";
import { Sparkles, Lock, Star, Shield, Brain, User as UserIcon, Heart, Mountain, Badge, Calendar, Gift, Infinity, ChevronRight, Zap } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
  onAuthClick: () => void;
  user: any;
}

export function LandingPage({ onStart, onAuthClick, user }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-md mx-auto relative z-10 bg-[#050505] text-white overflow-x-hidden">
      {/* Abstract Background Graphic */}
      <div className="absolute top-0 left-0 w-full h-[800px] pointer-events-none -z-10 opacity-40 overflow-hidden">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 sticky top-0">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Mandalapp" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(235,179,5,0.4)]" />
            <h2 className="text-white text-base font-bold tracking-tight">Mandalapp</h2>
          </div>
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
              <UserIcon className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-white font-semibold">{user.name || user.email.split('@')[0]}</span>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="text-primary text-xs font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
              INGRESAR
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col py-10 px-6 w-full gap-16">
        {/* Hero Section */}
        <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-3 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-magenta to-cyan opacity-0 group-hover:opacity-10 transition-opacity rounded-3xl blur-xl"></div>
            <Sparkles className="w-10 h-10 text-gold shadow-[0_0_20px_rgba(235,179,5,0.4)]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black text-white leading-tight tracking-tighter mb-4"
          >
            BioVital <span className="text-magenta">365</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg font-medium leading-relaxed mb-10 max-w-[280px]"
          >
            Decodifica tu frecuencia y activa tu <span className="text-cyan font-bold">misión de vida</span> con el Mapa Mandala.
          </motion.p>

          <div className="w-full space-y-4 mb-16">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="w-full bg-gradient-to-r from-magenta to-gold hover:from-pink-500 hover:to-amber-400 text-white font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(219,39,119,0.3)] transition-all transform border border-white/20 text-lg uppercase tracking-widest"
            >
              <Zap className="w-6 h-6" />
              Empezar Análisis
            </motion.button>

            {!user && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAuthClick}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/10 backdrop-blur-md"
              >
                Iniciar sesión / Registrarse
              </motion.button>
            )}

            {user && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-magenta/20 flex items-center justify-center text-magenta font-black text-xl border border-magenta/20 shadow-glow">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Conectado como</p>
                  <p className="text-white font-bold">{user.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Floating Pillars Preview */}
          <div className="grid grid-cols-2 gap-4 w-full opacity-60 pointer-events-none scale-90 grayscale-[0.2]">
            <div className="glass-panel p-4 rounded-2xl border-magenta/20 flex flex-col items-center gap-2">
              <Heart className="w-6 h-6 text-magenta" />
              <span className="text-[10px] text-white font-black uppercase tracking-widest">Esencia</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border-gold/20 flex flex-col items-center gap-2">
              <Mountain className="w-6 h-6 text-gold" />
              <span className="text-[10px] text-white font-black uppercase tracking-widest">Misión</span>
            </div>
          </div>
        </div>


        {/* Trust Section */}
        <section className="border-y border-white/5 py-8">
          <p className="text-center text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black mb-6">Reconocido por expertos en</p>
          <div className="flex justify-between items-center opacity-40 gap-8 px-4">
            <span className="text-xs font-black tracking-tighter">VOGUE</span>
            <span className="text-xs font-black tracking-tighter">FORBES</span>
            <span className="text-xs font-black tracking-tighter">MINDVALLEY</span>
          </div>
        </section>

        {/* How It Works */}
        <section className="flex flex-col gap-10">
          <h2 className="text-3xl font-bold text-white text-center tracking-tight">Cómo Funciona</h2>
          <div className="flex flex-col gap-4">
            {[
              { step: 1, label: 'Paso 1', title: 'Ingresa', desc: 'Tu nombre completo y fecha de nacimiento.', icon: UserIcon },
              { step: 2, label: 'Paso 2', title: 'Decodifica', desc: 'Nuestro motor analiza tu frecuencia vibratoria.', icon: Brain },
              { step: 3, label: 'Paso 3', title: 'Recibe', desc: 'Tu guía espiritual personalizada al instante.', icon: Sparkles },
            ].map((item, idx) => (
              <div key={idx} className="glass-panel rounded-2xl p-5 flex items-center gap-6 relative overflow-hidden group border border-white/5">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-primary">
                  <div className="absolute top-2 left-2 text-[10px] font-black opacity-30">{item.step}</div>
                  <item.icon className="w-7 h-7" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{item.label}</span>
                  <h3 className="text-white text-xl font-bold leading-tight">{item.title}</h3>
                  <p className="text-slate-400 text-sm font-medium leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tools Included */}
        <section className="flex flex-col gap-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Tu Mapa Incluye</h2>
            <p className="text-slate-500 text-sm font-medium">Herramientas sagradas para la vida moderna.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { title: "Gematría Exacta", desc: "Algoritmos basados en textos antiguos para calcular el valor numérico exacto de tu alma." },
              { title: "Compatibilidad de Almas", desc: "Descubre las conexiones kármicas con tu pareja, socios o familiares." },
              { title: "Reportes Premium", desc: "Análisis profundos de más de 50 páginas sobre tus ciclos de vida y desafíos." }
            ].map((card, idx) => (
              <div key={idx} className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <Infinity className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{card.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-10 mb-10 p-10 rounded-[32px] bg-gradient-to-b from-[#120e26] to-[#050505] border border-white/10 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
          <h2 className="text-3xl font-bold text-white mb-8 relative z-10 leading-tight">¿Listo para conocer tu verdad?</h2>
          <button
            onClick={onStart}
            className="w-full py-4.5 px-8 bg-primary hover:bg-amber-400 text-black font-black text-lg rounded-2xl gold-glow relative z-10 transition shadow-[0_0_40px_rgba(212,175,55,0.2)]"
          >
            Calcular Ahora
          </button>
        </section>
      </main>

      <footer className="py-12 text-center border-t border-white/5 bg-[#050505] mt-auto">
        <div className="max-w-md mx-auto px-6 flex flex-col gap-8">
          <div className="flex justify-center gap-10">
            <a className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest" href="#">Términos</a>
            <a className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest" href="#">Privacidad</a>
            <a className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest" href="#">Soporte</a>
          </div>
          <p className="text-slate-700 text-[10px] font-medium uppercase tracking-[0.2em]">© 2025 BioVital 365. Mandala Numérico. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
