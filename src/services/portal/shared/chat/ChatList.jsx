import React from 'react';
import { useAuth } from '../../../../context/AuthContext';

/**
 * ChatList Component
 * Displays a list of active conversations with unread indicators and a "New Message" button.
 */
const ChatList = ({ conversations, activeConversationId, onSelectConversation, onNewMessage }) => {
    const { user, role } = useAuth();

    return (
        <div className="h-full flex flex-col bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-primary/10 overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-primary/10 bg-slate-50/50 dark:bg-black/20">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">Messages</h3>
                {role === "parent" && (
                    <button
                        onClick={onNewMessage}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-none hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        New Chat
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {conversations.length > 0 ? (
                    conversations.map((conv) => {
                        const isUnread = conv.lastMessageReadBy && user?.uid && !conv.lastMessageReadBy.includes(user.uid);
                        const isActive = conv.id === activeConversationId;

                        // Descriptive Name Logic
                        let displayTitle = "";
                        let subTitle = "";

                        if (role === "teacher") {
                            displayTitle = conv.parentName || "Parent";
                            subTitle = `Parent of ${conv.studentName || "Student"}`;
                        } else {
                            displayTitle = conv.teacherName || "Teacher";
                            subTitle = "School Management";
                        }

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelectConversation(conv.id)}
                                className={`group p-4 rounded-none cursor-pointer transition-all duration-200 border relative ${isActive
                                    ? 'bg-primary/5 border-primary/20 shadow-sm'
                                    : 'bg-white dark:bg-surface-dark border-slate-100 dark:border-primary/5 hover:border-primary/20 hover:bg-slate-50 dark:hover:bg-primary/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="overflow-hidden pr-4">
                                        <h4 className={`text-sm font-bold truncate ${isActive ? 'text-primary dark:text-primary-light' : 'text-slate-800 dark:text-slate-200'}`}>
                                            {displayTitle}
                                        </h4>
                                        <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{subTitle}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {conv.lastMessageAt?.toDate && (
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {conv.lastMessageAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                        {isUnread && (
                                            <span className="w-2.5 h-2.5 bg-red-500 rounded-none shadow-sm shadow-red-200 animate-pulse"></span>
                                        )}
                                    </div>
                                </div>
                                <p className={`text-xs line-clamp-1 ${isUnread ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
                                    {conv.lastMessage || "No messages yet"}
                                </p>

                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-none"></div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-primary/5 rounded-none flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-slate-300 dark:text-primary/40 text-3xl">chat_bubble_outline</span>
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 font-medium text-sm italic">No active conversations</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;
