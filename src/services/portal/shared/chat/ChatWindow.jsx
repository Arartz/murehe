import React, { useEffect, useRef, useState } from 'react';
import { useMessages } from './useChat';
import { useAuth } from '../../../../context/AuthContext';
import { markConversationAsRead, sendMessage, updateConversationStatus } from '../../../firestoreService';

/**
 * ChatWindow Component
 * Refined UI with absolute role-based alignment:
 * - Parent: Right
 * - Teacher: Left
 */
const ChatWindow = ({ activeConversationId, conversationStatus }) => {
    const { user, role } = useAuth();
    const { messages, loading } = useMessages(activeConversationId);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Mark as read when messages load or id changes
    useEffect(() => {
        if (activeConversationId && user?.uid && messages.length > 0) {
            markConversationAsRead(activeConversationId, user.uid);
        }
    }, [activeConversationId, messages.length, user?.uid]);

    // Auto-scroll to bottom whenever messages update
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !activeConversationId || sending) return;

        setSending(true);
        try {
            await sendMessage(activeConversationId, user.uid, role, newMessage.trim());
            setNewMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
        } finally {
            setSending(false);
        }
    };

    const handleCloseConversation = async () => {
        if (!activeConversationId || !window.confirm("Are you sure you want to mark this conversation as closed?")) return;
        try {
            await updateConversationStatus(activeConversationId, "closed");
        } catch (err) {
            console.error("Error closing conversation:", err);
        }
    };

    if (!activeConversationId) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50/30 dark:bg-black/20 text-center">
                <div className="w-20 h-20 bg-primary/5 rounded-none flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary/40 text-5xl">forum</span>
                </div>
                <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2 font-display">Select a Conversation</h4>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs font-medium text-sm">Choose a chat from the sidebar to start messaging and tracking progress.</p>
            </div>
        );
    }

    const isClosed = conversationStatus === "closed";

    return (
        <div className="h-full flex flex-col bg-white dark:bg-surface-dark overflow-hidden relative">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-primary/10 flex justify-between items-center bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md z-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                        {role === "teacher" ? "P" : "T"}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Conversation</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-none ${isClosed ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`}></span>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                {isClosed ? "Closed" : "Active Now"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!isClosed && role === "teacher" && (
                        <button
                            onClick={handleCloseConversation}
                            className="px-4 py-1.5 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-none hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors shadow-sm"
                        >
                            Mark as Resolved
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Display */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-black/20 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-none animate-spin mb-3"></div>
                        <p className="text-slate-400 font-medium text-sm italic">Loading conversation...</p>
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((msg) => {
                        const isMe = msg.senderRole === role;
                        const bgColor = isMe ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-surface-dark text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-primary/10';

                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-full animate-fade-in`}
                            >
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-none relative ${bgColor}`}>
                                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 px-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                    </span>
                                    {isMe && (
                                        <span className="material-symbols-outlined text-primary/60 text-[10px]">done_all</span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-primary/5 rounded-none flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-slate-400 dark:text-primary/40 text-4xl">chat</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold">No messages yet</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Start the conversation below</p>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-primary/10">
                {isClosed ? (
                    <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-primary/5 rounded-none border border-slate-200 dark:border-primary/10 text-slate-500 dark:text-slate-400 text-sm font-bold">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        READ-ONLY CONVERSATION
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="flex gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Write a message..."
                                disabled={sending}
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-primary/20 rounded-none focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-surface-dark outline-none transition-all text-sm font-medium pr-12 dark:text-white"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
                                <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">sentiment_satisfied</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className={`px-6 py-3.5 bg-primary text-white rounded-none font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 ${(sending || !newMessage.trim())
                                ? 'opacity-50 cursor-not-allowed grayscale'
                                : 'hover:bg-primary-dark hover:shadow-primary/40 active:scale-95'
                                }`}
                        >
                            {sending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-none animate-spin"></div>
                            ) : (
                                <>
                                    <span>Send</span>
                                    <span className="material-symbols-outlined text-sm">send</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ChatWindow;
