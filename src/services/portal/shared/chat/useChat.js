import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';

/**
 * Custom hook for child/parent real-time conversations.
 */
export const useParentConversations = (userId) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "conversations"),
            where("parentId", "==", userId),
            orderBy("lastMessageAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setConversations(convList);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching parent conversations:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { conversations, loading };
};

/**
 * Custom hook for teacher real-time conversations.
 */
export const useTeacherConversations = (userId) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "conversations"),
            where("teacherId", "==", userId),
            orderBy("lastMessageAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setConversations(convList);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching teacher conversations:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { conversations, loading };
};

/**
 * Custom hook for real-time messages in a specific conversation.
 */
export const useMessages = (conversationId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgList);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching messages:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [conversationId]);

    return { messages, loading };
};

/**
 * Custom hook for chat state (active conversation, etc.)
 */
export const useChat = () => {
    const [activeConversationId, setActiveConversationId] = useState(null);

    return {
        activeConversationId,
        setActiveConversationId
    };
};
