import React from 'react';


const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/10 rounded-none w-full max-w-sm p-8 shadow-2xl transform transition-all scale-100 animate-fade-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-red-500/10 rounded-none flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-red-500 text-3xl">logout</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 font-display uppercase tracking-tight">Confirm Logout</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed font-bold">
                        Are you sure you want to log out of the Jasiri Portal?
                    </p>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-4 bg-slate-100 dark:bg-primary/10 text-slate-700 dark:text-primary font-bold rounded-none transition-all uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-none shadow-lg shadow-red-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
