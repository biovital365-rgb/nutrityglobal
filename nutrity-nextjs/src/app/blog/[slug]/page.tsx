import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, ArrowLeft, Calendar, User, Tag, Leaf } from "lucide-react";
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
    if (!post) return { title: "Artículo no encontrado | BioVital.360" };
    return {
        title: `${post.title} | BioVital.360 Blog`,
        description: post.excerpt || post.content.substring(0, 155),
        keywords: post.tags,
        openGraph: {
            title: post.title,
            description: post.excerpt || post.content.substring(0, 155),
            images: post.thumbnail ? [{ url: post.thumbnail }] : [{ url: "/og-image.jpg" }],
            type: "article",
            publishedTime: new Date(post.createdAt).toISOString(),
            authors: [post.author],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt || post.content.substring(0, 155),
            images: post.thumbnail ? [post.thumbnail] : ["/og-image.jpg"],
        }
    };
}

// ─── Related Posts ────────────────────────────────────────────────────────────
async function RelatedPosts({ currentSlug, category }: { currentSlug: string; category: string }) {
    const all = await getPosts(undefined, true);
    const related = all.filter(p => p.slug !== currentSlug && p.category === category).slice(0, 3);
    if (related.length === 0) return null;

    return (
        <aside className="border-t border-[#c19b6c]/20 pt-12 space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#012a4a]">Artículos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {related.map(post => (
                    <Link key={post.id} href={`/blog/${post.slug}`}
                        className="group p-6 bg-white rounded-2xl border border-[#c19b6c]/20 hover:border-[#c19b6c]/50 hover:shadow-xl hover:-translate-y-1 transition-all">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#c19b6c] block mb-2">{post.category}</span>
                        <h3 className="font-serif font-bold text-base text-[#012a4a] leading-snug line-clamp-2 group-hover:text-[#1b3b36] transition-colors">
                            {post.title}
                        </h3>
                        <span className="text-[10px] text-[#2d3748] mt-3 block font-bold uppercase tracking-widest">
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nutrity.global';
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}/blog/${post.slug}`,
        },
        headline: post.title,
        description: post.excerpt || post.content.substring(0, 155),
        image: post.thumbnail ? [post.thumbnail] : [`${baseUrl}/og-image.jpg`],
        datePublished: new Date(post.createdAt).toISOString(),
        dateModified: new Date(post.updatedAt || post.createdAt).toISOString(),
        author: {
            '@type': 'Person',
            name: post.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'BioVital 360',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/favicon.ico`,
            }
        },
        keywords: post.tags ? post.tags.join(', ') : '',
        articleSection: post.category,
        wordCount: post.content.split(" ").length
    };

    return (
        <div className="min-h-screen bg-[#fbf8f1] selection:bg-[#c19b6c] selection:text-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            {/* ── Nav ── */}
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#fbf8f1]/80 border-b border-[#c19b6c]/20 transition-all duration-300">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/blog" className="flex items-center gap-2 text-[#012a4a] hover:text-[#c19b6c] transition-colors text-xs font-bold uppercase tracking-widest group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al Blog
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/auth" className="hidden sm:block text-xs font-bold uppercase tracking-widest text-[#1b3b36] hover:text-[#c19b6c] transition-colors">
                            Iniciar sesión
                        </Link>
                        <Link href="/auth"
                            className="px-5 py-2 bg-[#012a4a] text-[#fbf8f1] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#1b3b36] transition-all shadow-lg shadow-[#012a4a]/20 border border-[#012a4a]">
                            Registrarse gratis
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-12">
                <article>
                    {/* ── Article Header ── */}
                    <header className="mb-12 space-y-8 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                            <Link href="/blog"
                                className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#c19b6c]/10 text-[#012a4a] px-4 py-1.5 rounded-full border border-[#c19b6c]/20 hover:bg-[#c19b6c]/20 transition-colors">
                                {post.category}
                            </Link>
                            {post.isPremium && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#012a4a] text-[#e6d3a8] px-4 py-1.5 rounded-full border border-[#c19b6c]/30 shadow-md">
                                    <Crown className="w-3 h-3" /> Premium
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#012a4a] leading-tight">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="text-xl text-[#2d3748] leading-relaxed font-serif italic max-w-3xl mx-auto sm:mx-0">
                                "{post.excerpt}"
                            </p>
                        )}

                        <div className="flex items-center justify-center sm:justify-start flex-wrap gap-6 text-[11px] font-bold uppercase tracking-widest text-[#2d3748] border-t border-b border-[#c19b6c]/20 py-5">
                            <span className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[#c19b6c]" />
                                <span className="text-[#012a4a]">{post.author}</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#c19b6c]" />
                                {new Date(post.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                            <span className="hidden sm:inline text-[#c19b6c]">•</span>
                            <span>{readingTime} min de lectura</span>
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap ml-auto">
                                    <Tag className="w-4 h-4 text-[#c19b6c]" />
                                    {post.tags.map(tag => (
                                        <span key={tag} className="bg-white px-3 py-1 rounded-lg border border-[#c19b6c]/20 shadow-sm text-[#012a4a]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </header>

                    {/* ── Thumbnail ── */}
                    {post.thumbnail && (
                        <div className="mb-12 rounded-[2rem] overflow-hidden aspect-video bg-[#fbf8f1] shadow-2xl border border-[#c19b6c]/20">
                            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* ── Content: PremiumGate handles auth check client-side ── */}
                    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#012a4a] prose-p:text-[#2d3748] prose-p:leading-relaxed prose-a:text-[#c19b6c] hover:prose-a:text-[#012a4a] prose-strong:text-[#1b3b36]">
                        {post.isPremium ? (
                            <PremiumGate
                                fullContent={post.content}
                                teaserContent={teaserContent}
                            />
                        ) : (
                            <div
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
                            />
                        )}
                    </div>
                </article>

                {/* ── Related Posts (only for non-gated or authenticated) ── */}
                <div className="mt-20">
                    <RelatedPosts currentSlug={post.slug} category={post.category} />
                </div>
            </main>

            <footer className="border-t border-[#c19b6c]/20 mt-16 py-10 px-6 bg-white">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-[#2d3748]">
                    <span>© {new Date().getFullYear()} BioVital.360 · MRGA</span>
                    <Link href="/blog" className="hover:text-[#c19b6c] transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-3 h-3" /> Volver al Blog
                    </Link>
                </div>
            </footer>
        </div>
    );
}
