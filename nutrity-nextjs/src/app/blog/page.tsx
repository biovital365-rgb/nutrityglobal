import Link from "next/link";
import { Crown, BookOpen } from "lucide-react";
import { getPosts } from "@/actions/db-actions";
import type { Post } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog de Salud Metabólica | Nutrity Global",
    description: "Artículos de nutrición clínica, superalimentos andinos y protocolos de remisión metabólica. Contenido creado por expertos de Nutrity Global.",
    openGraph: {
        title: "Blog | Nutrity Global",
        description: "Artículos de salud metabólica, nutrición clínica y bienestar.",
        type: "website",
    },
};

// ─── Category color map ───────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
    "Nutrición":      "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Metabolismo":    "bg-teal-50 text-teal-700 border-teal-100",
    "Superalimentos": "bg-lime-50 text-lime-700 border-lime-100",
    "Ejercicio":      "bg-blue-50 text-blue-700 border-blue-100",
    "Mentalidad":     "bg-rose-50 text-rose-700 border-rose-100",
    "Recetas":        "bg-amber-50 text-amber-700 border-amber-100",
    "General":        "bg-slate-50 text-slate-600 border-slate-100",
};

function getCategoryStyle(category: string) {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS["General"];
}

function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString("es-ES", {
        year: "numeric", month: "long", day: "numeric",
    });
}

// ─── Blog Card ────────────────────────────────────────────────────────────────
function BlogCard({ post, featured = false }: { post: Post; featured?: boolean }) {
    const categoryStyle = getCategoryStyle(post.category);

    if (featured) {
        return (
            <Link href={`/blog/${post.slug}`} className="group block relative overflow-hidden rounded-3xl bg-nutrity-primary text-white shadow-2xl shadow-nutrity-primary/30 hover:shadow-nutrity-primary/50 transition-all duration-500 hover:-translate-y-1">
                {post.thumbnail && (
                    <div className="absolute inset-0">
                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-nutrity-primary via-nutrity-primary/80 to-nutrity-primary/40" />
                    </div>
                )}
                <div className="relative p-8 md:p-12 flex flex-col h-full min-h-[420px]">
                    <div className="flex items-center gap-3 mb-auto">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/80 px-3 py-1 rounded-full">
                            {post.category}
                        </span>
                        {post.isPremium && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full">
                                <Crown className="w-3 h-3" /> Premium
                            </span>
                        )}
                    </div>
                    <div className="mt-8">
                        <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-4 group-hover:text-nutrity-accent transition-colors">
                            {post.title}
                        </h2>
                        {post.excerpt && (
                            <p className="text-white/70 text-base leading-relaxed line-clamp-3 mb-6">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-white/50">
                                {formatDate(post.createdAt)} · {post.author}
                            </div>
                            <span className="text-nutrity-accent text-sm font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                Leer artículo →
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/blog/${post.slug}`}
            className="group flex flex-col bg-white rounded-2xl border border-nutrity-border shadow-sm hover:shadow-xl hover:shadow-nutrity-primary/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            {post.thumbnail ? (
                <div className="relative h-48 overflow-hidden bg-nutrity-bg">
                    <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {post.isPremium && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                            <Crown className="w-3 h-3" /> Premium
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-48 bg-gradient-to-br from-nutrity-bg to-nutrity-border flex items-center justify-center relative">
                    <BookOpen className="w-12 h-12 text-nutrity-primary/20" />
                    {post.isPremium && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                            <Crown className="w-3 h-3" /> Premium
                        </div>
                    )}
                </div>
            )}
            <div className="flex flex-col flex-1 p-6">
                <div className="mb-3">
                    <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${categoryStyle}`}>
                        {post.category}
                    </span>
                </div>
                <h3 className="font-display font-bold text-lg text-nutrity-primary leading-snug mb-2 line-clamp-2 group-hover:text-nutrity-accent transition-colors">
                    {post.title}
                </h3>
                {post.excerpt && (
                    <p className="text-nutrity-gray-text text-sm leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-nutrity-border">
                    <div className="text-xs text-nutrity-gray-text font-medium">
                        {formatDate(post.createdAt)}
                    </div>
                    <span className="text-xs font-bold text-nutrity-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        Leer →
                    </span>
                </div>
            </div>
        </Link>
    );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyBlog() {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-nutrity-bg flex items-center justify-center shadow-inner">
                <BookOpen className="w-10 h-10 text-nutrity-primary/30" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-xl font-display font-bold text-nutrity-primary">Próximamente</h3>
                <p className="text-nutrity-gray-text max-w-sm">Estamos preparando contenido de alta calidad sobre nutrición clínica y superalimentos andinos.</p>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BlogPage() {
    const posts = await getPosts(undefined, true);
    const categories = ["Todos", ...Array.from(new Set(posts.map(p => p.category)))];
    const featured = posts[0];
    const rest = posts.slice(1);

    return (
        <div className="min-h-screen bg-nutrity-bg">
            {/* ── Nav ── */}
            <header className="glass-header px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-nutrity-primary flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-nutrity-accent" />
                        </div>
                        <span className="font-display font-bold text-nutrity-primary">Nutrity Global</span>
                        <span className="text-nutrity-gray-text text-sm font-medium">/ Blog</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/auth" className="text-xs font-bold text-nutrity-primary hover:text-nutrity-accent transition-colors">
                            Iniciar sesión
                        </Link>
                        <Link href="/auth"
                            className="px-4 py-2 bg-nutrity-primary text-white text-xs font-bold rounded-xl hover:bg-nutrity-accent transition-all shadow-lg shadow-nutrity-primary/20">
                            Registrarse
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
                {/* ── Hero ── */}
                <section className="text-center space-y-4 py-8">
                    <span className="inline-block px-4 py-1.5 bg-nutrity-accent/10 text-nutrity-primary text-[11px] font-bold uppercase tracking-widest rounded-full border border-nutrity-accent/20">
                        Blog de Salud Metabólica
                    </span>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-nutrity-primary leading-tight max-w-3xl mx-auto">
                        Ciencia y <span className="text-nutrity-accent">naturaleza</span> al servicio de tu salud
                    </h1>
                    <p className="text-nutrity-gray-text text-lg max-w-xl mx-auto">
                        Protocolos clínicos, superalimentos andinos y guías prácticas para transformar tu metabolismo.
                    </p>
                </section>

                {/* ── Featured Article ── */}
                {featured && (
                    <section>
                        <h2 className="text-[11px] font-bold uppercase tracking-widest text-nutrity-gray-text mb-6">
                            Artículo Destacado
                        </h2>
                        <BlogCard post={featured} featured />
                    </section>
                )}

                {/* ── Category pills (client-side filter via URL not needed for SSR MVP) ── */}
                {categories.length > 2 && (
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <span key={cat}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-default transition-all ${
                                    cat === "Todos"
                                        ? "bg-nutrity-primary text-white border-nutrity-primary shadow-lg shadow-nutrity-primary/20"
                                        : "bg-white text-nutrity-gray-text border-nutrity-border hover:border-nutrity-accent/30"
                                }`}>
                                {cat}
                            </span>
                        ))}
                    </div>
                )}

                {/* ── Articles Grid ── */}
                <section>
                    {rest.length === 0 && !featured ? (
                        <div className="grid"><EmptyBlog /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rest.map(post => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Premium CTA ── */}
                <section className="bg-nutrity-primary rounded-3xl p-10 md:p-16 text-white text-center space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-nutrity-accent blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-nutrity-accent blur-3xl" />
                    </div>
                    <div className="relative">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-400/20 flex items-center justify-center">
                            <Crown className="w-7 h-7 text-amber-300" />
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-2">Accede al contenido Premium</h2>
                        <p className="text-white/70 max-w-md mx-auto">
                            Protocolos clínicos exclusivos, guías de remisión metabólica y recursos de alto valor reservados para pacientes registrados.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                            <Link href="/auth"
                                className="px-8 py-4 bg-nutrity-accent text-white font-bold rounded-2xl hover:bg-nutrity-highlight hover:text-nutrity-primary transition-all shadow-xl shadow-nutrity-accent/20 text-sm">
                                Crear cuenta gratuita
                            </Link>
                            <Link href="/auth"
                                className="px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-sm border border-white/20">
                                Ya tengo cuenta
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="border-t border-nutrity-border mt-16 py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-nutrity-gray-text">
                    <span>© {new Date().getFullYear()} Nutrity Global · Todos los derechos reservados</span>
                    <div className="flex gap-6">
                        <Link href="/" className="hover:text-nutrity-primary transition-colors">Inicio</Link>
                        <Link href="/blog" className="hover:text-nutrity-primary transition-colors">Blog</Link>
                        <Link href="/auth" className="hover:text-nutrity-primary transition-colors">Acceso</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
