import React, { useState } from 'react';

/**
 * NewConversation Component
 * Provides a UI to select a teacher and start a new chat.
 */
const NewConversation = ({ availableTeachers, onCreateConversation, onCancel }) => {
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeacherId || !message.trim()) return;

        setLoading(true);
        try {
            await onCreateConversation(selectedTeacherId, message.trim());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-8 bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/10 rounded-none shadow-sm animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display mb-2">Message a Teacher</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Start a conversation with one of your child's teachers.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Select Teacher</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person_search</span>
                        <select
                            value={selectedTeacherId}
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3 rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white appearance-none"
                        >
                            <option value="">-- Choose a Teacher --</option>
                            {availableTeachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.fullName} ({teacher.email})
                                </option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Message</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-4 text-slate-400">edit_note</span>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your conversation starter..."
                            required
                            className="w-full pl-12 pr-4 py-3 rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white min-h-[120px] resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-primary/10 dark:hover:bg-primary/20 text-slate-700 dark:text-primary rounded-none font-bold transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !selectedTeacherId || !message.trim()}
                        className={`flex-1 py-3 bg-primary text-white rounded-none font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 ${(loading || !selectedTeacherId || !message.trim())
                            ? 'opacity-50 cursor-not-allowed grayscale'
                            : 'hover:bg-primary-dark hover:shadow-primary/40 transform hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-none animate-spin"></div>
                                <span>Starting...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">send</span>
                                <span>Start Chat</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewConversation;
