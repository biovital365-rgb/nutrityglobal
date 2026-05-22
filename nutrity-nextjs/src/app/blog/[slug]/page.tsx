import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, ArrowLeft, Calendar, User, Tag } from "lucide-react";
import type { Post } from "@/lib/types";
import type { Metadata } from "next";
import { PremiumGate } from "@/components/blog/PremiumGate";
import { renderMarkdown } from "@/lib/markdown";
import { getPostBySlug, getPosts } from "@/actions/db-actions";

// Dynamic rendering — CMS content changes frequently
export const dynamic = 'force-dynamic';
export const revalidate = 0;


// ─── Dynamic metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug) as Post | null;
    if (!post) return { title: "Artículo no encontrado | Nutrity Global" };
    return {
        title: `${post.title} | Nutrity Global Blog`,
        description: post.excerpt || post.content.substring(0, 155),
        openGraph: {
            title: post.title,
            description: post.excerpt || post.content.substring(0, 155),
            images: post.thumbnail ? [{ url: post.thumbnail }] : [],
            type: "article",
            publishedTime: new Date(post.createdAt).toISOString(),
            authors: [post.author],
        },
    };
}

// ─── Related Posts ────────────────────────────────────────────────────────────
async function RelatedPosts({ currentSlug, category }: { currentSlug: string; category: string }) {
    const all = await getPosts(undefined, true);
    const related = all.filter(p => p.slug !== currentSlug && p.category === category).slice(0, 3);
    if (related.length === 0) return null;

    return (
        <aside className="border-t border-nutrity-border pt-12 space-y-6">
            <h2 className="text-lg font-display font-bold text-nutrity-primary">Artículos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map(post => (
                    <Link key={post.id} href={`/blog/${post.slug}`}
                        className="group p-5 bg-white rounded-2xl border border-nutrity-border hover:border-nutrity-accent/30 hover:shadow-md transition-all">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-nutrity-accent">{post.category}</span>
                        <h3 className="font-bold text-sm text-nutrity-primary mt-1.5 leading-snug line-clamp-2 group-hover:text-nutrity-accent transition-colors">
                            {post.title}
                        </h3>
                        <span className="text-[10px] text-nutrity-gray-text mt-2 block">
                            {new Date(post.createdAt).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                        </span>
                    </Link>
                ))}
            </div>
        </aside>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug) as Post | null;
    if (!post || !post.isPublished) notFound();

    const readingTime = Math.max(1, Math.ceil(post.content.split(" ").length / 200));
    // For premium posts, only show a teaser to guests (client handles full gate)
    const teaserContent = post.content.substring(0, 600) + (post.content.length > 600 ? "..." : "");

    return (
        <div className="min-h-screen bg-nutrity-bg">
            {/* ── Nav ── */}
            <header className="glass-header px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/blog" className="flex items-center gap-2 text-nutrity-gray-text hover:text-nutrity-primary transition-colors text-sm font-medium group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Volver al Blog
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/auth" className="text-xs font-bold text-nutrity-primary hover:text-nutrity-accent transition-colors px-3 py-2">
                            Iniciar sesión
                        </Link>
                        <Link href="/auth"
                            className="px-4 py-2 bg-nutrity-primary text-white text-xs font-bold rounded-xl hover:bg-nutrity-accent transition-all shadow-lg shadow-nutrity-primary/20">
                            Registrarse gratis
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <article>
                    {/* ── Article Header ── */}
                    <header className="mb-10 space-y-6">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Link href="/blog"
                                className="text-[10px] font-bold uppercase tracking-widest bg-nutrity-accent/10 text-nutrity-primary px-3 py-1.5 rounded-full border border-nutrity-accent/20 hover:bg-nutrity-accent/20 transition-colors">
                                {post.category}
                            </Link>
                            {post.isPremium && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-200">
                                    <Crown className="w-3 h-3" /> Premium
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-display font-bold text-nutrity-primary leading-tight">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="text-lg text-nutrity-gray-text leading-relaxed max-w-2xl">
                                {post.excerpt}
                            </p>
                        )}

                        <div className="flex items-center flex-wrap gap-5 text-sm text-nutrity-gray-text border-t border-b border-nutrity-border py-5">
                            <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-nutrity-accent" />
                                <span className="font-semibold text-nutrity-primary">{post.author}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-nutrity-accent" />
                                {new Date(post.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                            <span className="text-nutrity-gray-text/50">·</span>
                            <span className="text-xs">{readingTime} min de lectura</span>
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Tag className="w-3.5 h-3.5 text-nutrity-accent" />
                                    {post.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-bold bg-nutrity-bg px-2.5 py-1 rounded-lg border border-nutrity-border">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </header>

                    {/* ── Thumbnail ── */}
                    {post.thumbnail && (
                        <div className="mb-10 rounded-3xl overflow-hidden aspect-video bg-nutrity-bg shadow-xl shadow-nutrity-primary/10">
                            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* ── Content: PremiumGate handles auth check client-side ── */}
                    {post.isPremium ? (
                        <PremiumGate
                            fullContent={post.content}
                            teaserContent={teaserContent}
                        />
                    ) : (
                        <div
                            className="text-nutrity-primary/85 leading-relaxed text-[15px]"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
                        />
                    )}
                </article>

                {/* ── Related Posts (only for non-gated or authenticated) ── */}
                <div className="mt-16">
                    <RelatedPosts currentSlug={post.slug} category={post.category} />
                </div>
            </main>

            <footer className="border-t border-nutrity-border mt-16 py-8 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-nutrity-gray-text">
                    <span>© {new Date().getFullYear()} Nutrity Global · Todos los derechos reservados</span>
                    <Link href="/blog" className="hover:text-nutrity-primary transition-colors">← Volver al Blog</Link>
                </div>
            </footer>
        </div>
    );
}
