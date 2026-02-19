import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const LandingHeader = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const location = useLocation();

    const navLinks = [
        { path: "/", label: "Home" },
        { path: "/about", label: "About Us" },
        { path: "/academics", label: "Academics" },
        { path: "/admissions", label: "Admissions" },
        { path: "/announcements", label: "Announcements" },
        { path: "/contact", label: "Contact" },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-slate-200 dark:border-primary/10 shadow-sm transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center gap-3">
                        <img
                            src={isDark ? "/assets/title.png" : "/assets/logo.png"}
                            alt="Logo"
                            className="h-14 w-14 object-contain"
                        />
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-heading font-bold text-primary dark:text-accent leading-tight">Jasiri Christian School</h1>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic font-medium">Boldly learn, serve and grow</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        <nav className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${isActive(link.path)
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-primary/10 hover:text-primary"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                to="/login"
                                className="ml-4 px-6 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-black uppercase tracking-widest rounded-full shadow-lg shadow-accent/20 transition-all transform hover:scale-[1.05]"
                            >
                                Services
                            </Link>
                        </nav>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-primary/10 transition-colors text-slate-600 dark:text-slate-300"
                        >
                            <span className="material-symbols-outlined">
                                {isDark ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>

                        <button
                            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-primary/10"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="material-symbols-outlined">
                                {isMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <nav className="lg:hidden border-t border-slate-200 dark:border-primary/10 bg-white dark:bg-surface-dark animate-fade-in">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-4 py-3 text-sm font-bold rounded-xl ${isActive(link.path)
                                    ? "bg-primary text-white"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-primary/5"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            to="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="px-4 py-4 mt-2 bg-accent text-white text-center text-xs font-black uppercase tracking-widest rounded-xl"
                        >
                            Portal Services
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
};

export default LandingHeader;
