import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ChatList from "../services/portal/shared/chat/ChatList";
import ChatWindow from "../services/portal/shared/chat/ChatWindow";
import { useTeacherConversations } from "../services/portal/shared/chat/useChat";

const TeacherChat = () => {
    const { user } = useAuth();
    const { conversations, loading } = useTeacherConversations(user?.uid);
    const [activeConversationId, setActiveConversationId] = useState(null);

    return (
        <div className="h-[calc(100vh-180px)] bg-white dark:bg-surface-dark rounded-none border border-slate-200 dark:border-primary/10 shadow-sm flex overflow-hidden animate-in fade-in duration-700">
            <div className="w-80 border-r border-slate-100 dark:border-primary/10">
                <ChatList
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onSelectConversation={setActiveConversationId}
                />
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-black/20">
                <ChatWindow
                    activeConversationId={activeConversationId}
                    conversationStatus={conversations.find(c => c.id === activeConversationId)?.status}
                />
            </div>
        </div>
    );
};

export default TeacherChat;
