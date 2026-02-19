import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserByEmail, setUserData } from "../services/firestoreService";
import { updateUserPassword, updateUserEmail } from "../services/authService";

const TeacherSettings = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({ fullName: "", email: "", phone: "" });
    const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const profileData = await getUserByEmail(user.email);
                if (profileData) {
                    setProfile({
                        fullName: profileData.fullName || "",
                        email: profileData.email || "",
                        phone: profileData.phone || ""
                    });
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage({ text: "Updating profile...", type: "info" });
        try {
            if (profile.email !== user.email) {
                await updateUserEmail(profile.email);
            }
            await setUserData(user.uid, {
                fullName: profile.fullName,
                phone: profile.phone,
                email: profile.email
            });
            setMessage({ text: "Profile updated successfully!", type: "success" });
        } catch (err) {
            setMessage({ text: err.message, type: "error" });
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ text: "Passwords do not match!", type: "error" });
            return;
        }
        setMessage({ text: "Updating password...", type: "info" });
        try {
            await updateUserPassword(passwordForm.newPassword);
            setPasswordForm({ newPassword: "", confirmPassword: "" });
            setMessage({ text: "Password updated successfully!", type: "success" });
        } catch (err) {
            setMessage({ text: err.message, type: "error" });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-none animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {message.text && (
                <div className={`p-4 rounded-none flex items-center gap-3 ${message.type === "success" ? "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300" : (message.type === "error" ? "bg-red-50 dark:bg-red-900/10 border border-red-500/20 text-red-700 dark:text-red-300" : "bg-blue-50 dark:bg-blue-900/10 border border-blue-500/20 text-blue-700 dark:text-blue-300")}`}>
                    <span className="material-symbols-outlined text-lg">
                        {message.type === "success" ? "check_circle" : (message.type === "error" ? "error" : "info")}
                    </span>
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Form */}
                <section className="bg-white dark:bg-surface-dark p-8 rounded-none shadow-sm border border-slate-200 dark:border-primary/10">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-primary/10 pb-4">
                        <span className="material-symbols-outlined text-primary text-2xl">person_edit</span>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">Edit Profile</h3>
                    </div>
                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
                            <input
                                type="text"
                                value={profile.fullName}
                                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                className="w-full px-6 py-4 rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full px-6 py-4 rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Phone Number</label>
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className="w-full px-6 py-4 rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white font-bold"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                        <button type="submit" className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-none font-bold shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs">
                            Save Profile Changes
                        </button>
                    </form>
                </section>

                {/* Security Form */}
                <section className="bg-white dark:bg-surface-dark p-8 rounded-none shadow-sm border border-slate-200 dark:border-primary/10">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-primary/10 pb-4">
                        <span className="material-symbols-outlined text-primary text-2xl">lock_reset</span>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">Security</h3>
                    </div>
                    <form onSubmit={handlePasswordUpdate} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">New Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">key</span>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full pl-12 pr-6 py-4 rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white font-bold"
                                    required
                                    minLength="6"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Confirm Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">lock</span>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full pl-12 pr-6 py-4 rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white font-bold"
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-bold shadow-lg shadow-emerald-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs">
                            Update Security Key
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default TeacherSettings;
