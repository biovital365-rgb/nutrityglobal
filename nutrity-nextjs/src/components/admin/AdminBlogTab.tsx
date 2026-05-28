"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Search, Pencil, Trash2, Save, X, BookOpen, Crown, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import * as dbService from "@/actions/db-actions";
import { Post } from "@/lib/types";
interface AdminBlogTabProps {
    user: {
        uid?: string;
        email?: string;
        displayName?: string;
        profile?: {
            name?: string;
            email?: string;
            role?: string;
            plan?: string;
            organization?: { id?: string; name?: string };
        };
    };
    posts: Post[];
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

export default function AdminBlogTab({ user, posts, setPosts }: AdminBlogTabProps) {
    const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const loadPosts = useCallback(async () => {
        await Promise.resolve();
        setIsLoading(true);
        try {
            const data = await dbService.getPosts(user?.profile?.organization?.id, false); // false to get unpublished too
            setPosts(data);
        } catch (error) {
            console.error("Error loading posts:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, setPosts]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPosts();
    }, [loadPosts]);

    const handleSavePost = async () => {
        if (!editingPost?.title || !editingPost?.content) return;
        setIsSaving(true);
        try {
            // Slug generation
            let slug = editingPost.slug;
            if (!slug) {
                slug = editingPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }

            const postToSave = {
                ...editingPost,
                slug,
                organizationId: user?.profile?.organization?.id,
                author: editingPost.author || user?.displayName || "Admin",
                isPublished: editingPost.isPublished || false,
                isPremium: editingPost.isPremium || false,
                category: editingPost.category || "General",
                tags: editingPost.tags || [],
            };

            await dbService.savePost(postToSave, user?.profile?.organization?.id);
            await loadPosts();
            setEditingPost(null);
        } catch (error) {
            console.error("Error saving post", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePost = async (id: string) => {
        if (confirm("¿Seguro que deseas eliminar este artículo?")) {
            try {
                await dbService.deletePost(id);
                setPosts(posts.filter(p => p.id !== id));
            } catch (error) {
                console.error("Error deleting post:", error);
            }
        }
    };

    const emptyPost: Partial<Post> = {
        title: "",
        content: "",
        slug: "",
        excerpt: "",
        thumbnail: "",
        category: "Nutrición",
        tags: [],
        isPublished: false,
        isPremium: false,
    };

    const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-nutrity-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-nutrity-accent" />
                        Gestión del Blog
                    </h3>
                    <p className="text-sm text-nutrity-gray-text mt-1">Crea artículos, recursos de IA y contenido premium para tus usuarios.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nutrity-gray-text" />
                        <input
                            type="text"
                            placeholder="Buscar artículo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl pl-9 pr-4 py-2 text-sm text-nutrity-white focus:outline-none focus:border-nutrity-accent"
                        />
                    </div>
                    <button
                        onClick={() => setEditingPost(emptyPost)}
                        className="flex items-center gap-2 bg-nutrity-accent text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-nutrity-accent/90 transition-all shrink-0"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Nuevo Artículo</span>
                    </button>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 text-nutrity-accent animate-spin" />
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-nutrity-panel/50 rounded-2xl border border-nutrity-border border-dashed">
                    <BookOpen className="w-12 h-12 text-nutrity-gray-text mx-auto mb-3 opacity-50" />
                    <p className="text-nutrity-gray-text">No hay artículos disponibles.</p>
                    <button onClick={() => setEditingPost(emptyPost)} className="text-nutrity-accent text-sm font-bold mt-2 hover:underline">
                        Crear el primero
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="bg-nutrity-panel border border-nutrity-border rounded-2xl p-5 flex flex-col hover:border-nutrity-accent/50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-2">
                                    {post.isPremium && (
                                        <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                            <Crown className="w-3 h-3" /> Premium
                                        </span>
                                    )}
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${post.isPublished ? "bg-green-500/10 text-green-500" : "bg-nutrity-gray-text/10 text-nutrity-gray-text"}`}>
                                        {post.isPublished ? "Publicado" : "Borrador"}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => setEditingPost(post)} className="p-1.5 text-nutrity-gray-text hover:text-nutrity-white bg-nutrity-bg rounded-lg transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeletePost(post.id)} className="p-1.5 text-nutrity-gray-text hover:text-red-500 bg-nutrity-bg rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <h4 className="font-bold text-nutrity-white text-lg mb-2 line-clamp-2">{post.title}</h4>
                            <p className="text-xs text-nutrity-gray-text line-clamp-3 mb-4 flex-1">
                                {post.excerpt || post.content.substring(0, 100) + "..."}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-nutrity-border text-xs text-nutrity-gray-text">
                                <span>{post.category}</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor Modal */}
            {editingPost && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-nutrity-panel w-full max-w-4xl max-h-[90vh] rounded-2xl border border-nutrity-border flex flex-col overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-nutrity-border">
                            <h3 className="text-xl font-bold text-nutrity-white">
                                {editingPost.id ? "Editar Artículo" : "Nuevo Artículo"}
                            </h3>
                            <button onClick={() => setEditingPost(null)} className="text-nutrity-gray-text hover:text-nutrity-white transition-colors p-2 rounded-xl hover:bg-nutrity-bg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-nutrity-gray-text uppercase">Título</label>
                                    <input 
                                        type="text" 
                                        value={editingPost.title || ""}
                                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                        className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm text-nutrity-white focus:border-nutrity-accent focus:outline-none"
                                        placeholder="Ej: 5 beneficios del ayuno intermitente"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-nutrity-gray-text uppercase">URL (Slug)</label>
                                    <input 
                                        type="text" 
                                        value={editingPost.slug || ""}
                                        onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                                        className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm text-nutrity-white focus:border-nutrity-accent focus:outline-none"
                                        placeholder="Se generará automáticamente si está vacío"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-nutrity-gray-text uppercase">Categoría</label>
                                    <input 
                                        type="text" 
                                        value={editingPost.category || ""}
                                        onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                                        className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm text-nutrity-white focus:border-nutrity-accent focus:outline-none"
                                        placeholder="Ej: Nutrición, Ejercicio, Mentalidad"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-nutrity-gray-text uppercase">URL de Imagen (Thumbnail)</label>
                                    <input 
                                        type="text" 
                                        value={editingPost.thumbnail || ""}
                                        onChange={(e) => setEditingPost({ ...editingPost, thumbnail: e.target.value })}
                                        className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm text-nutrity-white focus:border-nutrity-accent focus:outline-none"
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-nutrity-gray-text uppercase">Extracto (Resumen)</label>
                                <textarea 
                                    rows={2}
                                    value={editingPost.excerpt || ""}
                                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                    className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm text-nutrity-white focus:border-nutrity-accent focus:outline-none resize-none"
                                    placeholder="Breve resumen para las tarjetas de blog"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-nutrity-gray-text uppercase">Contenido del Artículo (Soporta Markdown)</label>
                                <textarea 
                                    rows={12}
                                    value={editingPost.content || ""}
                                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                    className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm text-nutrity-white focus:border-nutrity-accent focus:outline-none font-mono resize-none"
                                    placeholder="Escribe el contenido completo aquí..."
                                />
                            </div>
                            
                            <div className="flex flex-wrap gap-6 pt-4 border-t border-nutrity-border">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only"
                                            checked={editingPost.isPublished || false}
                                            onChange={(e) => setEditingPost({ ...editingPost, isPublished: e.target.checked })}
                                        />
                                        <div className={`w-10 h-6 rounded-full transition-colors ${editingPost.isPublished ? 'bg-green-500' : 'bg-nutrity-bg border border-nutrity-border'}`}></div>
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${editingPost.isPublished ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="text-sm font-bold text-nutrity-white flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Publicar artículo
                                    </span>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only"
                                            checked={editingPost.isPremium || false}
                                            onChange={(e) => setEditingPost({ ...editingPost, isPremium: e.target.checked })}
                                        />
                                        <div className={`w-10 h-6 rounded-full transition-colors ${editingPost.isPremium ? 'bg-amber-500' : 'bg-nutrity-bg border border-nutrity-border'}`}></div>
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${editingPost.isPremium ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="text-sm font-bold text-amber-500 flex items-center gap-2">
                                        <Crown className="w-4 h-4" /> Contenido Premium
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-nutrity-border flex justify-end gap-3 bg-nutrity-panel">
                            <button 
                                onClick={() => setEditingPost(null)}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-nutrity-white hover:bg-nutrity-bg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSavePost}
                                disabled={isSaving || !editingPost.title || !editingPost.content}
                                className="flex items-center gap-2 bg-nutrity-accent text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-nutrity-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Guardar Artículo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
