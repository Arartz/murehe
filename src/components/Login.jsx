import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login, register, resetPassword } from "../services/authService";
import { setUserData } from "../services/firestoreService";
import { FiEye, FiEyeOff, FiLock, FiMail, FiUserPlus, FiLogIn } from "react-icons/fi";

const Login = () => {
    const { user, role, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [roleInput, setRoleInput] = useState("admin");
    const [isRegistering, setIsRegistering] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!loading && user && role) {
            navigate("/services");
        }
    }, [user, role, loading, navigate]);

    // Auto-dismiss error messages after 3 seconds
    React.useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Auto-dismiss success/info messages after 3 seconds
    React.useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: "", type: "" });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message.text]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage({ text: "", type: "" });

        try {
            if (isResetting) {
                await resetPassword(email);
                setMessage({ text: "Password reset link sent! Check your email.", type: "success" });
                setIsResetting(false);
                return;
            }

            if (isRegistering) {
                const userCredential = await register(email, password);
                await setUserData(userCredential.user.uid, {
                    email,
                    role: roleInput,
                    createdAt: new Date()
                });
            } else {
                await login(email, password);
            }
            navigate("/services");
        } catch (err) {
            console.error("Auth error:", err);
            let errorMessage = err.message;
            if (err.code === "auth/invalid-credential") {
                errorMessage = "Incorrect email or password.";
            } else if (err.code === "auth/user-not-found") {
                errorMessage = "Account not found. Please register.";
            } else if (err.code === "auth/wrong-password") {
                errorMessage = "Incorrect password.";
            }
            setError(errorMessage);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Left Side: Visual/Hero (Hidden on mobile, visible on LG+) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center items-center justify-center p-12" style={{ backgroundImage: "linear-gradient(rgba(94, 44, 52, 0.8), rgba(29, 21, 22, 0.9)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJ8HKOywamucPLVRI57pmFYwiPuLMUNBAKUh_ETR2La29u-nsPsjQ5819B5EpxOCUCEoqD_697olPzFpVJ-uMujCPmXE200-WS4b-3GEVIDNuq2IA4sbB7AT1mT0Ru7-sBC7JeW_4x8aI7ooitLW-3rRqJIKs8TrewMVAnWod-8tVrMw7vAKWc3vFvmwq1foVFLaVUMauwM6sfnFy_Y5pNXDo1XpBZT_DLMlRTgLQiEIXfjdERGJTPX8M_IILCPfLnjnBr0UHs_Nug')" }}>
                <div className="relative z-10 max-w-xl text-center">
                    <div className="mb-8 inline-flex items-center justify-center rounded-none bg-white/10 p-4 backdrop-blur-md">
                        <img src="/assets/logo.png" alt="Jasiri Logo" className="h-20 w-auto" />
                    </div>
                    <h1 className="text-5xl font-black font-display text-white leading-tight mb-6 tracking-tight">Wisdom, Faith, & Excellence</h1>
                    <p className="text-xl text-white/80 font-light leading-relaxed font-sans">
                        Nurturing the next generation of leaders through Christ-centered education and academic rigor.
                    </p>
                </div>
                {/* Bottom attribution */}
                <div className="absolute bottom-8 left-8 text-white/50 text-sm font-sans">
                    © {new Date().getFullYear()} Jasiri Christian School
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 bg-white dark:bg-background-dark">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile Header (Visible only on small screens) */}
                    <div className="lg:hidden flex flex-col items-center mb-10">
                        <div className="mb-4">
                            <img src="/assets/logo.png" alt="Jasiri Logo" className="h-16 w-auto" />
                        </div>
                        <h2 className="text-2xl font-bold font-display text-primary">Jasiri Christian School</h2>
                    </div>

                    {/* Desktop Branding Header */}
                    <div className="hidden lg:block mb-10">
                        <h2 className="text-3xl font-bold font-display text-primary mb-2">School Management System</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-sans">Secure portal for faculty, staff, and parents.</p>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-4xl font-black font-display tracking-tight text-slate-900 dark:text-white mb-2">
                            {isResetting ? "Recover Account" : (isRegistering ? "Create Account" : "Welcome Back")}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-sans">
                            {isResetting ? "Enter your email to receive a reset link." : "Please enter your credentials to access the system."}
                        </p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-none animate-fade-in">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
                                <p className="text-red-700 dark:text-red-300 text-sm font-bold font-sans">{error}</p>
                            </div>
                        </div>
                    )}
                    {message.text && (
                        <div className={`mb-6 p-4 ${message.type === "success" ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500" : "bg-blue-50 dark:bg-blue-900/10 border-blue-500"} border-l-4 rounded-none animate-fade-in`}>
                            <p className={`${message.type === "success" ? "text-emerald-700 dark:text-emerald-300" : "text-blue-700 dark:text-blue-300"} text-sm font-bold font-sans`}>
                                {message.text}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-slate-900 dark:text-slate-200 font-sans" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="flex h-12 w-full rounded-none border border-slate-200 dark:border-primary/30 bg-white dark:bg-surface-dark px-10 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:text-white font-sans transition-all"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        {!isResetting && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none text-slate-900 dark:text-slate-200 font-sans" htmlFor="password">
                                        Password
                                    </label>
                                    {!isRegistering && (
                                        <button
                                            type="button"
                                            onClick={() => setIsResetting(true)}
                                            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors font-sans"
                                        >
                                            Forgot Password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="flex h-12 w-full rounded-none border border-slate-200 dark:border-primary/30 bg-white dark:bg-surface-dark px-10 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:text-white font-sans transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Role Selection for Registration */}
                        {isRegistering && !isResetting && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-slate-900 dark:text-slate-200 font-sans">Role</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">badge</span>
                                    <select
                                        value={roleInput}
                                        onChange={(e) => setRoleInput(e.target.value)}
                                        className="flex h-12 w-full rounded-none border border-slate-200 dark:border-primary/30 bg-white dark:bg-surface-dark px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white font-sans transition-all appearance-none"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="teacher">Teacher</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full h-12 inline-flex items-center justify-center rounded-none bg-primary px-4 py-2 text-sm font-bold text-white transition-all hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-lg shadow-primary/20 font-sans transform hover:-translate-y-0.5"
                        >
                            {isResetting ? "Send Reset Link" : (isRegistering ? "Create Account" : "Sign In to Portal")}
                        </button>
                    </form>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-slate-100 dark:border-primary/20 mt-8 text-center space-y-4">
                        {!isResetting ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
                                {isRegistering ? "Already have an account?" : "Don't have an account?"}
                                <button
                                    onClick={() => setIsRegistering(!isRegistering)}
                                    className="ml-1 font-bold text-primary hover:underline transition-colors"
                                >
                                    {isRegistering ? "Sign In" : "Register Now"}
                                </button>
                            </p>
                        ) : (
                            <button
                                onClick={() => setIsResetting(false)}
                                className="text-sm font-bold text-primary hover:underline transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to Login
                            </button>
                        )}

                        {!isRegistering && !isResetting && (
                            <div className="block">
                                <button
                                    onClick={() => navigate("/apply")}
                                    className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mt-4"
                                >
                                    Parent? Apply for Admission
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Small screen footer credit */}
                    <div className="lg:hidden mt-8 text-center text-slate-400 text-xs font-sans">
                        © {new Date().getFullYear()} Jasiri Christian School
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
