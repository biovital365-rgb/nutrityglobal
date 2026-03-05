import { motion } from "motion/react";
import { Home, LayoutGrid, History, User } from "lucide-react";

interface BottomNavProps {
    currentView: string;
    onNavigate: (view: any) => void;
    hasResults: boolean;
}

export function BottomNav({ currentView, onNavigate, hasResults }: BottomNavProps) {
    const navItems = [
        { id: 'landing', icon: Home, label: 'Inicio' },
        { id: 'dashboard', icon: LayoutGrid, label: 'Mapa', disabled: !hasResults },
        { id: 'history', icon: History, label: 'Historial', disabled: true }, // Placeholder for future feature
        { id: 'auth', icon: User, label: 'Perfil' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center px-6 pb-8 pointer-events-none">
            <div className="w-full max-w-sm bg-[#121214]/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto relative overflow-hidden">
                {/* Subtle highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"></div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    const isDisabled = item.disabled;

                    return (
                        <button
                            key={item.id}
                            onClick={() => !isDisabled && onNavigate(item.id)}
                            disabled={isDisabled}
                            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 ${isActive ? 'text-magenta' : 'text-slate-500'
                                } ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:text-white active:scale-90'}`}
                        >
                            <div className={`relative ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className="absolute inset-[-12px] bg-magenta/20 blur-xl rounded-full"
                                    />
                                )}
                                <Icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(219,39,119,0.5)]' : ''}`} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute -bottom-1 w-1 h-1 bg-magenta rounded-full shadow-[0_0_8px_#db2777]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
