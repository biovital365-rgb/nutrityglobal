import { motion } from "framer-motion";
import { Brain, Trash2, Zap, Send } from "lucide-react";
import React from "react";

export interface DashboardCoachTabProps {
    chatMessages: { role: string; text: string }[];
    setChatMessages: React.Dispatch<React.SetStateAction<{ role: string; text: string }[]>>;
    isTyping: boolean;
    chatEndRef: React.RefObject<HTMLDivElement | null>;
    inputMessage: string;
    setInputMessage: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: () => void;
}

export function DashboardCoachTab({
    chatMessages,
    setChatMessages,
    isTyping,
    chatEndRef,
    inputMessage,
    setInputMessage,
    handleSendMessage
}: DashboardCoachTabProps) {
    return (
        <motion.div key="coach" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
            <div className="nutrity-card flex flex-col overflow-hidden bg-white shadow-xl shadow-slate-200/50" style={{ height: '100%' }}>
                <div className="p-4 md:p-8 border-b border-nutrity-border flex flex-wrap items-center justify-between bg-white/50 backdrop-blur-md gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-nutrity-accent flex items-center justify-center text-white shadow-lg shadow-nutrity-accent/20">
                            <Brain className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-lg md:text-xl leading-none">Nutrity Coach IA</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-nutrity-success rounded-full animate-pulse"></span>
                                <p className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-[0.2em]">Sincronía Biológica Activa</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setChatMessages([])}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Limpiar Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scrollbar-hide bg-slate-50/30">
                    {chatMessages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-2xl shadow-sm ${msg.role === 'user'
                                ? 'bg-nutrity-accent text-white rounded-br-none shadow-nutrity-accent/10'
                                : 'bg-white text-nutrity-primary border border-nutrity-border rounded-bl-none'
                                }`}>
                                <p className="text-xs md:text-[13px] font-medium leading-relaxed whitespace-pre-line">{msg.text}</p>
                                {msg.role === 'ai' && (
                                    <div className="mt-4 pt-4 border-t border-nutrity-border flex items-center gap-2 text-[8px] font-bold text-nutrity-accent uppercase tracking-[0.2em]">
                                        <Zap className="w-3 h-3" /> Bio-Feedback Activo v4.0
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-nutrity-border p-5 rounded-2xl rounded-bl-none flex gap-1.5 items-center">
                                <span className="w-1.5 h-1.5 bg-nutrity-accent rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-nutrity-accent rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-nutrity-accent rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-6 bg-white border-t border-nutrity-border">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ej: ¿Qué puedo cenar para estabilizar mi glucosa?"
                            className="flex-1 bg-nutrity-bg border border-nutrity-border rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isTyping}
                            className="bg-nutrity-accent text-white p-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
