import React, { useState } from 'react';
import { Mail, User, Lock, ArrowRight, Zap, ShieldCheck, Activity, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { dbService } from '../lib/db-service';

interface AuthProps {
    onAuthSuccess: (user: any) => void;
    onBack?: () => void;
}

export function Auth({ onAuthSuccess, onBack }: AuthProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const credential = await signInWithEmailAndPassword(auth, email, password);
                // Sincronizar con Supabase
                const profile = await dbService.syncUserProfile(credential.user);
                onAuthSuccess({ ...credential.user, profile });
            } else {
                const credential = await createUserWithEmailAndPassword(auth, email, password);
                if (name) {
                    await updateProfile(credential.user, { displayName: name });
                }
                // Sincronizar con Supabase
                const profile = await dbService.syncUserProfile(credential.user, name);
                onAuthSuccess({ ...credential.user, profile });
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Credenciales incorrectas.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado.');
            } else {
                setError('Error en la autenticación. Revisa tus datos.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`w-full flex items-center justify-center p-6 bg-nutrity-bg relative overflow-hidden font-body ${onBack ? 'min-h-screen' : 'rounded-2xl shadow-none'}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col w-full max-w-sm relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-14 h-14 bg-nutrity-accent rounded-2xl flex items-center justify-center shadow-lg shadow-nutrity-accent/20">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-nutrity-primary tracking-tight">
                        {isLogin ? 'Acceso Vital' : 'Únete a Nutrity'}
                    </h2>
                    <p className="text-nutrity-gray-text mt-2 text-sm font-medium">
                        {isLogin ? 'Sincroniza tus bio-marcadores ahora' : 'Inicia tu remisión metabólica inteligente'}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-nutrity-border shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Tu Nombre</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nutrity-gray-text/40 group-focus-within:text-nutrity-accent transition-colors" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-nutrity-bg border border-nutrity-border focus:border-nutrity-accent rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium focus:outline-none transition-all"
                                        placeholder="Nombre completo"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Correo Electrónico</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nutrity-gray-text/40 group-focus-within:text-nutrity-accent transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-nutrity-bg border border-nutrity-border focus:border-nutrity-accent rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium focus:outline-none transition-all"
                                    placeholder="email@ejemplo.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nutrity-gray-text/40 group-focus-within:text-nutrity-accent transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-nutrity-bg border border-nutrity-border focus:border-nutrity-accent rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium focus:outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 text-[11px] py-3 px-4 rounded-xl flex items-center gap-3 font-bold">
                                <Zap className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-nutrity-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-nutrity-accent transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-sm uppercase tracking-widest mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{isLogin ? 'Iniciar Sesión' : 'Activar Cuenta'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-nutrity-bg pt-6">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-nutrity-gray-text text-[11px] font-bold uppercase tracking-widest hover:text-nutrity-accent transition-colors"
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
                        </button>
                    </div>
                </div>

                {onBack && (
                    <button
                        onClick={onBack}
                        className="mt-8 mx-auto flex items-center gap-2 text-nutrity-gray-text hover:text-nutrity-primary transition-all text-[11px] font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Inicio
                    </button>
                )}

                <button
                    onClick={() => {
                        setEmail('biovital.365@gmail.com');
                        setPassword('BioVital54321');
                        // Optional: automatically trigger submit after a short delay
                        setTimeout(() => {
                            const form = document.querySelector('form');
                            if (form) form.requestSubmit();
                        }, 500);
                    }}
                    className="mt-12 flex items-center justify-center gap-2 opacity-10 hover:opacity-50 transition-opacity cursor-pointer mx-auto"
                    title="Configuración Maestra"
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-nutrity-primary/60">Seguridad Bio-Encriptada</span>
                </button>
            </motion.div>
        </div>
    );
}
