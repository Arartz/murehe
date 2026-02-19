import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
    getStudentDataForParent,
    getStudentTermResults,
    getStudentMarksByTerm,
    setUserData,
    getUserByEmail,
    getActiveTerm,
    getStudentAttendanceByTerm,
    getStudentComments,
    getTeachersByClass,
    createConversation
} from "../services/firestoreService";
import { logout, updateUserPassword, updateUserEmail } from "../services/authService";
import { generateReportCardPDF } from "../utils/pdfGenerator";

// Messaging Components & Hooks
import ChatList from "../services/portal/shared/chat/ChatList";
import ChatWindow from "../services/portal/shared/chat/ChatWindow";
import NewConversation from "../services/portal/shared/chat/NewConversation";
import { useParentConversations } from "../services/portal/shared/chat/useChat";

import LogoutModal from "./LogoutModal";

const ParentDashboard = () => {
    const { user } = useAuth();
    const [student, setStudent] = useState(null);
    const [profile, setProfile] = useState({ fullName: "", email: "", phone: "" });
    const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [error, setError] = useState("");
    const [selectedTerm, setSelectedTerm] = useState("Term 1");
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfMessage, setPdfMessage] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Dynamic data
    const [marks, setMarks] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({ present: 0, total: 0, percentage: 0 });
    const [comments, setComments] = useState([]);
    const [availableTeachers, setAvailableTeachers] = useState([]);

    // Messaging State
    const { conversations, loading: convLoading } = useParentConversations(user?.uid);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [showNewChat, setShowNewChat] = useState(false);

    const handleDownloadPDF = async () => {
        if (!student) return;
        setPdfLoading(true);
        setPdfMessage({ text: "Fetching report data...", type: "info" });
        try {
            const termResults = await getStudentTermResults(student.id, selectedTerm);
            if (!termResults) {
                setPdfMessage({ text: `No results found for ${selectedTerm}. Please contact the admin.`, type: "error" });
                setPdfLoading(false);
                return;
            }
            const marksData = await getStudentMarksByTerm(student.id, selectedTerm);
            generateReportCardPDF(student, termResults, marksData);
            setPdfMessage({ text: "PDF Generated successfully!", type: "success" });
        } catch (err) {
            console.error(err);
            setPdfMessage({ text: "Failed to generate PDF.", type: "error" });
        } finally {
            setPdfLoading(false);
            setTimeout(() => setPdfMessage(null), 5000);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Initial core data
                const [studentData, profileData, termData] = await Promise.all([
                    getStudentDataForParent(user.uid),
                    getUserByEmail(user.email),
                    getActiveTerm()
                ]);

                if (studentData) {
                    setStudent(studentData);

                    // Fetch teachers for the student's class
                    const teachers = await getTeachersByClass(studentData.class);
                    setAvailableTeachers(teachers);

                    // Fetch dynamic marks, attendance and comments if term exists
                    const currentTerm = termData?.name || "Term 1";
                    setSelectedTerm(currentTerm);

                    const [marksData, attData, commentsData] = await Promise.all([
                        getStudentMarksByTerm(studentData.id, currentTerm),
                        getStudentAttendanceByTerm(studentData.id, currentTerm),
                        getStudentComments(studentData.id)
                    ]);

                    setMarks(marksData);
                    setComments(commentsData);

                    const total = attData.length;
                    const present = attData.filter(a => a.status === "present").length;
                    setAttendanceStats({
                        present,
                        total,
                        percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0
                    });

                } else {
                    setError("No student profile linked to your account.");
                }

                if (profileData) setProfile({ ...profileData });
            } catch (err) {
                console.error(err);
                setError("Failed to fetch dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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

    const handleStartConversation = async (teacherId, text) => {
        try {
            const selectedTeacher = availableTeachers.find(t => t.id === teacherId);
            const { id } = await createConversation(
                student.id,
                user.uid,
                teacherId,
                student.class,
                text,
                user.uid,
                "parent",
                profile.fullName || user.email,
                student.fullName,
                selectedTeacher?.fullName || "Teacher"
            );
            setActiveConversationId(id);
            setShowNewChat(false);
        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to start conversation.", type: "error" });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-none animate-spin"></div>
                    <p className="text-slate-500 animate-pulse font-sans">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error && activeTab === "dashboard") {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
                <div className="bg-white dark:bg-surface-dark p-8 rounded-none shadow-lg border-l-4 border-red-500 max-w-md w-full">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">Error Loading Profile</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 font-sans">{error}</p>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-primary/10 dark:hover:bg-primary/20 text-slate-700 dark:text-primary rounded-none font-bold transition-colors"
                    >
                        Sign Out
                    </button>
                    <LogoutModal
                        isOpen={showLogoutConfirm}
                        onClose={() => setShowLogoutConfirm(false)}
                        onConfirm={logout}
                    />
                </div>
            </div>
        );
    }

    const SidebarItem = ({ label, icon, active, onClick }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-300 group ${active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-primary/10 hover:text-primary"}`}
        >
            <span className={`material-symbols-outlined transition-colors ${active ? "text-white" : "group-hover:text-primary"}`}>{icon}</span>
            <span className="font-medium font-sans">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden">
            <LogoutModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={logout}
            />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar Navigation */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-primary/10 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} flex flex-col`}>
                <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-primary/10 h-20">
                    <div>
                        <img src="/assets/logo.png" alt="Jasiri Logo" className="h-10 w-auto" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight font-display text-primary dark:text-white">Jasiri Portal</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">Parent Access</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
                    <SidebarItem
                        id="dashboard"
                        label="Dashboard"
                        icon="dashboard"
                        active={activeTab === "dashboard"}
                        onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }}
                    />
                    <SidebarItem
                        id="messages"
                        label="Messages"
                        icon="chat"
                        active={activeTab === "messages"}
                        onClick={() => { setActiveTab("messages"); setSidebarOpen(false); }}
                    />
                    <SidebarItem
                        id="settings"
                        label="Settings"
                        icon="settings"
                        active={activeTab === "settings"}
                        onClick={() => { setActiveTab("settings"); setSidebarOpen(false); }}
                    />
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-primary/10">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="font-medium">Sign Out</span>
                    </button>

                    <div className="mt-6 px-4 flex items-center gap-3">
                        <div className="size-10 rounded-none bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {profile.fullName ? profile.fullName.charAt(0) : "P"}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{profile.fullName || "Parent"}</p>
                            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Header Information Bar */}
                <header className="h-20 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-primary/10 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white font-display hidden sm:block">
                            {activeTab === "dashboard" ? "Dashboard Overview" : (activeTab === "messages" ? "Communications" : "Account Settings")}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-black/20 rounded-none border border-slate-200 dark:border-primary/10">
                            <span className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                {selectedTerm || "Current Term"}
                            </span>
                        </div>
                        <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            {/* Notification Dot Example */}
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-none"></span>
                        </button>
                    </div>
                </header>

                {/* Content Viewport */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-none flex items-center gap-3 animate-fade-in ${message.type === "success" ? "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300" : (message.type === "error" ? "bg-red-50 dark:bg-red-900/10 border border-red-500/20 text-red-700 dark:text-red-300" : "bg-blue-50 dark:bg-blue-900/10 border border-blue-500/20 text-blue-700 dark:text-blue-300")}`}>
                            <span className="material-symbols-outlined text-lg">
                                {message.type === "success" ? "check_circle" : (message.type === "error" ? "error" : "info")}
                            </span>
                            <p className="text-sm font-bold">{message.text}</p>
                        </div>
                    )}

                    {activeTab === "dashboard" && (
                        <div className="animate-slide-up space-y-8">
                            {/* Welcome Banner */}
                            <div className="relative overflow-hidden rounded-none bg-gradient-to-r from-primary to-primary-dark p-8 text-white shadow-xl shadow-primary/20">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="material-symbols-outlined text-9xl">school</span>
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-black font-display mb-2">Welcome, {profile.fullName || "Parent"}!</h2>
                                    <p className="text-white/80 max-w-xl">
                                        Here's an overview of {student?.fullName ? student.fullName.split(' ')[0] + "'s" : "your child's"} progress and updates for this term.
                                    </p>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Student Card */}
                                <div className="bg-white dark:bg-surface-dark p-6 rounded-none shadow-sm border border-slate-200 dark:border-primary/10 hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-none text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined">person</span>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{student.fullName}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{student.class} • {student.admissionNo}</p>
                                </div>

                                {/* Fees Card */}
                                <div className="bg-white dark:bg-surface-dark p-6 rounded-none shadow-sm border border-slate-200 dark:border-primary/10 hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-none transition-colors ${(student.fees?.totalDue - student.fees?.paid) <= 0 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white" : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white"}`}>
                                            <span className="material-symbols-outlined">payments</span>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fees</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {(student.fees?.totalDue - student.fees?.paid) <= 0 ? "Cleared" : `$${(student.fees?.totalDue - student.fees?.paid).toLocaleString()}`}
                                    </h4>
                                    <p className={`text-sm ${(student.fees?.totalDue - student.fees?.paid) <= 0 ? "text-emerald-500" : "text-orange-500"}`}>
                                        {(student.fees?.totalDue - student.fees?.paid) <= 0 ? "No pending balance" : "Outstanding Balance"}
                                    </p>
                                </div>

                                {/* Attendance Card */}
                                <div className="bg-white dark:bg-surface-dark p-6 rounded-none shadow-sm border border-slate-200 dark:border-primary/10 hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-none transition-colors ${attendanceStats.percentage >= 75 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white"}`}>
                                            <span className="material-symbols-outlined">calendar_today</span>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance</span>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">{attendanceStats.percentage}%</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Present</p>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-none mt-2 overflow-hidden">
                                        <div className={`h-full rounded-none ${attendanceStats.percentage >= 75 ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${attendanceStats.percentage}%` }}></div>
                                    </div>
                                </div>

                                {/* Report Card Action */}
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={pdfLoading}
                                    className="bg-white dark:bg-surface-dark p-6 rounded-none shadow-sm border border-slate-200 dark:border-primary/10 hover:shadow-md hover:border-primary/30 transition-all text-left group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-none text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined">download</span>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Report</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                        {pdfLoading ? "Generating..." : "Download PDF"}
                                    </h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        {pdfLoading ? "Please wait a moment" : `Term Report: ${selectedTerm}`}
                                    </p>
                                </button>
                            </div>

                            {/* Main Data Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Marks Table (Leans wide) */}
                                <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-none border border-slate-200 dark:border-primary/10 shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-6 border-b border-slate-100 dark:border-primary/10 flex justify-between items-center">
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-white font-display">Academic Performance</h3>
                                        <select
                                            value={selectedTerm}
                                            onChange={(e) => setSelectedTerm(e.target.value)}
                                            className="px-3 py-1.5 text-sm rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            {/* In a real app, logic to map active terms would go here, hardcoding for now or using state if available */}
                                            <option value="Term 1">Term 1</option>
                                            <option value="Term 2">Term 2</option>
                                            <option value="Term 3">Term 3</option>
                                        </select>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 dark:bg-black/20 text-slate-500 uppercase tracking-wider text-xs font-bold">
                                                <tr>
                                                    <th className="px-6 py-4">Subject</th>
                                                    <th className="px-6 py-4">Score</th>
                                                    <th className="px-6 py-4">Grade</th>
                                                    <th className="px-6 py-4">Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-primary/5">
                                                {marks.length > 0 ? marks.map((item, index) => (
                                                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{item.subjectId}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${item.score >= 80 ? 'bg-emerald-100 text-emerald-700' : (item.score >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700')}`}>
                                                                {item.score}%
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                                                            {item.score >= 80 ? 'A' : (item.score >= 70 ? 'B' : (item.score >= 60 ? 'C' : (item.score >= 50 ? 'D' : 'E')))}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 italic">
                                                            {item.score >= 80 ? 'Excellent' : (item.score >= 50 ? 'Good' : 'Needs Work')}
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">
                                                            No marks recorded for {selectedTerm} yet.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* PDF Error/Status Message In Card */}
                                    {pdfMessage && (
                                        <div className={`p-4 text-xs font-bold text-center ${pdfMessage.type === 'error' ? 'text-red-500 bg-red-50' : 'text-blue-500 bg-blue-50'}`}>
                                            {pdfMessage.text}
                                        </div>
                                    )}
                                </div>

                                {/* Comments / Sidebar Widgets */}
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-surface-dark rounded-none border border-slate-200 dark:border-primary/10 shadow-sm p-6">
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-white font-display mb-4">Teacher Comments</h3>
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {comments.length > 0 ? (
                                                comments.map((comment, index) => (
                                                    <div key={index} className="p-4 bg-slate-50 dark:bg-black/20 rounded-none border border-slate-100 dark:border-primary/5">
                                                        <p className="text-slate-600 dark:text-slate-300 text-sm italic mb-2">"{comment.commentText}"</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Term: {comment.term}</span>
                                                            <span className="material-symbols-outlined text-primary/40 text-sm">format_quote</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">chat_bubble_outline</span>
                                                    <p className="text-slate-400 text-sm">No remarks yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "messages" && (
                        <div className="h-[calc(100vh-180px)] bg-white dark:bg-surface-dark rounded-none border border-slate-200 dark:border-primary/10 shadow-sm flex overflow-hidden animate-fade-in">
                            <div className="w-80 border-r border-slate-100 dark:border-primary/10">
                                <ChatList
                                    conversations={conversations}
                                    activeConversationId={activeConversationId}
                                    onSelectConversation={(id) => {
                                        setActiveConversationId(id);
                                        setShowNewChat(false);
                                    }}
                                    onNewMessage={() => setShowNewChat(true)}
                                />
                            </div>
                            <div className="flex-1 bg-slate-50 dark:bg-black/20">
                                {showNewChat ? (
                                    <div className="p-6">
                                        <NewConversation
                                            availableTeachers={availableTeachers}
                                            onCreateConversation={handleStartConversation}
                                            onCancel={() => setShowNewChat(false)}
                                        />
                                    </div>
                                ) : (
                                    <ChatWindow
                                        activeConversationId={activeConversationId}
                                        conversationStatus={conversations.find(c => c.id === activeConversationId)?.status}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                            {/* Profile Form */}
                            <section className="bg-white dark:bg-surface-dark p-8 rounded-none shadow-sm border border-slate-200 dark:border-primary/10">
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-primary/10 pb-4">
                                    <span className="material-symbols-outlined text-primary text-2xl">person_edit</span>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">Edit Profile</h3>
                                </div>
                                <form onSubmit={handleProfileUpdate} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.fullName}
                                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profile.phone || ""}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <button type="submit" className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-none font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5">
                                        Save Changes
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
                                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">New Password</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">key</span>
                                            <input
                                                type="password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                                required
                                                minLength="6"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Confirm Password</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                                            <input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 rounded-none border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                                required
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-bold shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5">
                                        Update Password
                                    </button>
                                </form>
                            </section>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ParentDashboard;
