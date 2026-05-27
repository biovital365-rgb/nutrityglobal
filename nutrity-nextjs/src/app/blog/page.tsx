import Link from "next/link";
import { Crown, BookOpen, Leaf, Heart } from "lucide-react";
import { getPosts } from "@/actions/db-actions";
import type { Post } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Blog de Salud Metabólica | BioVital.360",
    description: "Artículos de nutrición clínica, superalimentos andinos y protocolos de remisión metabólica. Contenido creado por expertos.",
    openGraph: {
        title: "Blog | BioVital.360",
        description: "Artículos de salud metabólica, nutrición clínica y bienestar.",
        type: "website",
    },
};

// ─── Category color map ───────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
    "Nutrición":      "bg-[#1b3b36]/10 text-[#1b3b36] border-[#1b3b36]/20",
    "Metabolismo":    "bg-[#012a4a]/10 text-[#012a4a] border-[#012a4a]/20",
    "Superalimentos": "bg-[#c19b6c]/10 text-[#c19b6c] border-[#c19b6c]/20",
    "General":        "bg-gray-100 text-gray-700 border-gray-200",
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
            <Link href={`/blog/${post.slug}`} className="group block relative overflow-hidden rounded-[2rem] bg-[#012a4a] text-[#fbf8f1] shadow-2xl shadow-[#012a4a]/30 hover:shadow-[#012a4a]/50 transition-all duration-500 hover:-translate-y-1">
                {post.thumbnail && (
                    <div className="absolute inset-0">
                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#012a4a] via-[#012a4a]/80 to-transparent" />
                    </div>
                )}
                <div className="relative p-10 md:p-14 flex flex-col h-full min-h-[460px]">
                    <div className="flex items-center gap-3 mb-auto">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/10 text-white/90 px-4 py-1.5 rounded-full backdrop-blur-sm">
                            {post.category}
                        </span>
                        {post.isPremium && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#c19b6c]/20 text-[#e6d3a8] px-4 py-1.5 rounded-full border border-[#c19b6c]/30">
                                <Crown className="w-3 h-3" /> Premium
                            </span>
                        )}
                    </div>
                    <div className="mt-8">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-4 group-hover:text-[#c19b6c] transition-colors">
                            {post.title}
                        </h2>
                        {post.excerpt && (
                            <p className="text-white/80 text-lg leading-relaxed line-clamp-3 mb-6 font-medium">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-bold tracking-widest text-[#e6d3a8] uppercase">
                                {formatDate(post.createdAt)} · {post.author}
                            </div>
                            <span className="text-[#c19b6c] text-sm font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                                Leer Artículo →
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/blog/${post.slug}`}
            className="group flex flex-col bg-white rounded-2xl border border-[#c19b6c]/20 shadow-sm hover:shadow-2xl hover:shadow-[#012a4a]/10 hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            {post.thumbnail ? (
                <div className="relative h-56 overflow-hidden bg-[#fbf8f1]">
                    <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {post.isPremium && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#012a4a] text-[#e6d3a8] text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-[#c19b6c]/30">
                            <Crown className="w-3 h-3" /> Premium
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-56 bg-gradient-to-br from-[#fbf8f1] to-[#e6d3a8]/20 flex items-center justify-center relative border-b border-[#c19b6c]/20">
                    <Leaf className="w-12 h-12 text-[#c19b6c]/40" />
                    {post.isPremium && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#012a4a] text-[#e6d3a8] text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                            <Crown className="w-3 h-3" /> Premium
                        </div>
                    )}
                </div>
            )}
            <div className="flex flex-col flex-1 p-6 md:p-8">
                <div className="mb-4">
                    <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${categoryStyle}`}>
                        {post.category}
                    </span>
                </div>
                <h3 className="font-serif font-bold text-xl text-[#012a4a] leading-snug mb-3 line-clamp-2 group-hover:text-[#1b3b36] transition-colors">
                    {post.title}
                </h3>
                {post.excerpt && (
                    <p className="text-[#2d3748] text-sm leading-relaxed line-clamp-3 flex-1 font-medium">{post.excerpt}</p>
                )}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#c19b6c]/20">
                    <div className="text-xs text-[#2d3748]/70 font-bold tracking-widest uppercase">
                        {formatDate(post.createdAt)}
                    </div>
                    <span className="text-xs font-bold text-[#c19b6c] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
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
            <div className="w-24 h-24 rounded-full bg-[#fbf8f1] border border-[#c19b6c]/30 flex items-center justify-center shadow-inner">
                <Leaf className="w-10 h-10 text-[#c19b6c]" />
            </div>
            <div className="text-center space-y-3">
                <h3 className="text-2xl font-serif font-bold text-[#012a4a]">Próximamente</h3>
                <p className="text-[#2d3748] max-w-sm font-medium">Estamos preparando contenido basado en evidencia científica para tu salud metabólica.</p>
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
        <div className="min-h-screen bg-[#fbf8f1] selection:bg-[#c19b6c] selection:text-white">
            {/* ── Nav ── */}
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#fbf8f1]/80 border-b border-[#c19b6c]/20 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#012a4a] rounded-xl flex items-center justify-center shadow-lg shadow-[#012a4a]/20">
                            <Leaf className="w-5 h-5 text-[#c19b6c]" />
                        </div>
                        <div className="hidden sm:block">
                            <h2 className="text-xl font-display font-bold leading-none text-[#012a4a]">BioVital.360</h2>
                            <span className="text-[9px] font-bold text-[#c19b6c] uppercase tracking-[0.25em]">/ Blog</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/auth" className="text-xs font-bold uppercase tracking-widest text-[#1b3b36] hover:text-[#c19b6c] transition-colors">
                            Acceso
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-32 space-y-24">
                {/* ── Hero ── */}
                <section className="text-center space-y-6 py-8">
                    <span className="inline-block px-4 py-1.5 bg-[#c19b6c]/10 text-[#012a4a] text-[10px] font-bold uppercase tracking-[0.3em] rounded-full border border-[#c19b6c]/30">
                        Blog de Salud Metabólica
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#012a4a] leading-tight max-w-4xl mx-auto">
                        Ciencia y <span className="text-[#1b3b36] italic">sabiduría</span> al servicio de tu salud
                    </h1>
                    <p className="text-[#2d3748] text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        Protocolos clínicos, evidencia científica y guías prácticas para transformar tu metabolismo.
                    </p>
                </section>

                {/* ── Featured Article ── */}
                {featured && (
                    <section>
                        <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                            <div className="w-8 h-[1px] bg-[#c19b6c]"></div>
                            <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1b3b36]">
                                Artículo Destacado
                            </h2>
                        </div>
                        <BlogCard post={featured} featured />
                    </section>
                )}

                {/* ── Category pills ── */}
                {categories.length > 2 && (
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map(cat => (
                            <span key={cat}
                                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase cursor-default transition-all border ${
                                    cat === "Todos"
                                        ? "bg-[#012a4a] text-[#fbf8f1] border-[#012a4a] shadow-lg shadow-[#012a4a]/20"
                                        : "bg-white text-[#2d3748] border-[#c19b6c]/30 hover:border-[#c19b6c] hover:text-[#012a4a]"
                                }`}>
                                {cat}
                            </span>
                        ))}
                    </div>
                )}

                {/* ── Articles Grid ── */}
                <section>
                    <div className="flex items-center gap-3 mb-10 justify-center md:justify-start">
                        <div className="w-8 h-[1px] bg-[#c19b6c]"></div>
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1b3b36]">
                            Últimos Artículos
                        </h2>
                    </div>
                    {rest.length === 0 && !featured ? (
                        <div className="grid"><EmptyBlog /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {rest.map(post => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Premium CTA ── */}
                <section className="bg-[#1b3b36] rounded-[3rem] p-12 md:p-20 text-[#fbf8f1] text-center space-y-8 relative overflow-hidden border-4 border-[#c19b6c]/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#c19b6c]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#012a4a]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#c19b6c]/20 flex items-center justify-center border border-[#c19b6c]/30">
                            <Heart className="w-8 h-8 text-[#c19b6c]" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Tu Compromiso Transforma</h2>
                        <p className="text-[#e6d3a8] max-w-lg mx-auto text-lg font-medium leading-relaxed">
                            Accede a la Guía Práctica Basada en Evidencia Científica y descubre cómo revertir el doble ciclo.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                            <Link href="/auth"
                                className="px-10 py-4 bg-[#c19b6c] text-[#012a4a] font-bold rounded-xl hover:scale-105 transition-all shadow-xl shadow-[#c19b6c]/20 text-sm uppercase tracking-widest">
                                Iniciar Recuperación
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="border-t border-[#c19b6c]/20 mt-20 py-12 px-6 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#2d3748] font-bold uppercase tracking-widest">
                    <span>© {new Date().getFullYear()} BioVital.360 · MRGA</span>
                    <div className="flex gap-8">
                        <Link href="/" className="hover:text-[#c19b6c] transition-colors">Inicio</Link>
                        <Link href="/blog" className="hover:text-[#c19b6c] transition-colors">Blog</Link>
                        <Link href="/auth" className="hover:text-[#c19b6c] transition-colors">Acceso</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
