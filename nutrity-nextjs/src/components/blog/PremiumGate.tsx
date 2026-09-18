import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

interface PremiumGateProps {
    teaserContent: string;
}

/**
 * Client Component que:
 * 1. Verifica si el usuario está autenticado con Supabase
 * 2. Si SÍ → renderiza el contenido completo
 * 3. Si NO → renderiza el teaser + paywall overlay
 */
export function PremiumGate({ teaserContent }: PremiumGateProps) {
    return (
        <div className="relative">
            {/* Teaser (visible content) */}
            <div
                className="text-nutrity-primary/85 leading-relaxed text-[15px]"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(teaserContent) }}
            />

            {/* Fade-out gradient */}
            <div className="h-32 -mt-32 relative bg-gradient-to-b from-transparent to-nutrity-bg pointer-events-none" />

            {/* Paywall Card */}
            <div className="relative mt-2 bg-white rounded-3xl border border-nutrity-border shadow-2xl shadow-nutrity-primary/10 p-8 md:p-12 text-center">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shadow-inner">
                    <Lock className="w-7 h-7 text-amber-500" />
                </div>

                {/* Badge */}
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-600 text-[11px] font-bold uppercase tracking-widest rounded-full border border-amber-200">
                    <Crown className="w-3.5 h-3.5" /> Contenido exclusivo para miembros
                </span>

                {/* Headline */}
                <h3 className="text-2xl font-display font-bold text-nutrity-primary mt-5 mb-3">
                        Activa un plan para continuar leyendo
                </h3>
                <p className="text-nutrity-gray-text max-w-md mx-auto text-sm leading-relaxed">
                    Este artículo es un recurso reservado para miembros con un plan activo de Nutrity Global.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <Link href="/auth"
                        className="px-8 py-4 bg-nutrity-primary text-white font-bold rounded-2xl hover:bg-nutrity-accent transition-all shadow-xl shadow-nutrity-primary/20 text-sm">
                        Ver planes
                    </Link>
                    <Link href="/auth"
                        className="px-8 py-4 border border-nutrity-border text-nutrity-primary font-bold rounded-2xl hover:bg-nutrity-bg transition-all text-sm">
                        Ya tengo cuenta →
                    </Link>
                </div>

                {/* Benefits grid */}
                <div className="mt-10 pt-8 border-t border-nutrity-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    {[
                        { emoji: "🧭", title: "Rutas prácticas", desc: "Guías educativas para convertir información en hábitos semanales" },
                        { emoji: "🌿", title: "Superalimentos andinos", desc: "Fichas completas con dosis terapéuticas, fuentes y formas de preparación" },
                        { emoji: "📊", title: "Seguimiento personalizado", desc: "Accede a tu Bio-Cardex, plan nutricional y menú semanal aprobado" },
                    ].map(({ emoji, title, desc }) => (
                        <div key={title} className="flex items-start gap-3 p-4 bg-nutrity-bg rounded-2xl border border-nutrity-border">
                            <span className="text-2xl leading-none">{emoji}</span>
                            <div>
                                <p className="font-bold text-sm text-nutrity-primary">{title}</p>
                                <p className="text-[11px] text-nutrity-gray-text mt-0.5 leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
