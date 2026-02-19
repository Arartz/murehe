import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutModal from './LogoutModal';

const TeacherLayout = () => {
    const { user, logout } = useAuth();
    const [isMinimized, setIsMinimized] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: '/services/portal/teacher', label: 'Dashboard', icon: 'dashboard' },
        { path: '/services/portal/teacher/marks', label: 'Mark Entry', icon: 'edit_note' },
        { path: '/services/portal/teacher/attendance', label: 'Checklist', icon: 'rule' },
        { path: '/services/portal/teacher/remarks-entry', label: 'Student Remarks', icon: 'rate_review' },
        { path: '/services/portal/teacher/chat', label: 'Messages', icon: 'forum' },
        { path: '/services/portal/teacher/settings', label: 'Settings', icon: 'settings' },
    ];

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
            <LogoutModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
            />

            {/* Sidebar Navigation */}
            <aside
                className={`flex flex-col bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-primary/10 transition-all duration-300 relative z-20 ${isMinimized ? 'w-20' : 'w-72'
                    }`}
            >
                <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-primary/10 h-20">
                    <div className="shrink-0">
                        <img src="/assets/logo.png" alt="Jasiri Logo" className="h-10 w-auto" />
                    </div>
                    {!isMinimized && (
                        <div>
                            <h1 className="font-bold text-lg leading-tight font-display text-primary dark:text-white">Jasiri Portal</h1>
                            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">Teacher Edition</p>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-300 group ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-primary/10 hover:text-primary'
                                    }`}
                            >
                                <span className={`material-symbols-outlined transition-colors ${isActive ? 'text-white' : 'group-hover:text-primary'}`}>
                                    {item.icon}
                                </span>
                                {!isMinimized && (
                                    <span className="font-medium font-sans">
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="absolute -right-4 top-24 w-8 h-8 bg-primary text-white rounded-none flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-30"
                >
                    <span className="material-symbols-outlined text-sm">{isMinimized ? 'chevron_right' : 'chevron_left'}</span>
                </button>

                {/* Bottom Section */}
                <div className="p-4 border-t border-slate-100 dark:border-primary/10">
                    <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
                    >
                        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">logout</span>
                        {!isMinimized && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-20 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-primary/10 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden text-slate-500 dark:text-slate-400"
                            onClick={() => {/* If we implement a separate mobile menu state, though layout usually handles it */ }}
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight font-display">
                            {menuItems.find(m => m.path === location.pathname)?.label || 'Portal'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">{user?.email?.split('@')[0]}</span>
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-none animate-pulse"></span>
                                Online Status
                            </span>
                        </div>
                        <div className="size-11 bg-slate-100 dark:bg-primary/10 rounded-none flex items-center justify-center text-slate-600 dark:text-primary shadow-sm border border-slate-200 dark:border-primary/20 cursor-pointer hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-none pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto relative">
                        <Outlet />
                    </div>
                </main>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--color-primary), 0.2);
                    border-radius: 0;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #2a2a2a;
                }
            `}} />
        </div>
    );
};

export default TeacherLayout;
