import React, { useState, useEffect } from "react";
import { getAllDocuments } from "../../services/firestoreService";

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await getAllDocuments("announcements");
                // Sort by date descending
                const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAnnouncements(sorted);
            } catch (error) {
                console.error("Error fetching announcements:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-primary/5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-[0.03] blur-[100px] pointer-events-none"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-black font-display text-primary dark:text-accent mb-6 animate-fade-in">
                        School Announcements
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                        Stay updated with the latest news, events, and important notices from Jasiri Christian School.
                    </p>
                </div>
            </section>

            {/* Announcements List */}
            <div className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Loading updates...</p>
                    </div>
                ) : announcements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                        {announcements.map((ann, index) => (
                            <div
                                key={ann.id}
                                className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/10 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group flex flex-col h-auto"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="px-3 py-1 bg-primary/10 text-primary dark:text-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                        Update
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        {new Date(ann.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 font-display group-hover:text-primary transition-colors">
                                    {ann.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 whitespace-pre-wrap break-words">
                                    {ann.content}
                                </p>
                                <div className="pt-4 border-t border-slate-100 dark:border-primary/5 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-sm">event</span>
                                    Admin Post
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="size-20 bg-primary/5 text-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl">campaign</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Active Announcements</h3>
                        <p className="text-slate-500 dark:text-slate-400">Please check back later for more updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementsPage;
