import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTeacherAssignments } from "../services/firestoreService";
import { logout, updateUserPassword, updateUserEmail } from "../services/authService";
import EditModal from "./EditModal";

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editFields, setEditFields] = useState([]);
    const [editCollection, setEditCollection] = useState("");

    const fetchData = async () => {
        if (!user) return;
        try {
            const data = await getTeacherAssignments(user.uid);
            setAssignments(data);
        } catch (err) {
            setError("Failed to fetch dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleEdit = (item) => {
        setEditingItem(item);
        setEditCollection("teacherAssignments");
        setEditFields([
            { name: "schedule", label: "Room / Time Schedule" }
        ]);
        setEditModalOpen(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-none animate-spin"></div>
        </div>
    );

    const stats = [
        { label: 'Assigned Classes', value: [...new Set(assignments.map(a => a.className))].length, icon: 'group', color: 'blue' },
        { label: 'Total Subjects', value: [...new Set(assignments.map(a => a.subject))].length, icon: 'book', color: 'emerald' },
        { label: 'Active Sessions', value: assignments.length, icon: 'conversion_path', color: 'orange' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <EditModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                data={editingItem}
                collectionName={editCollection}
                fields={editFields}
                onSave={() => {
                    fetchData();
                }}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-surface-dark p-6 rounded-none shadow-sm border border-slate-200 dark:border-primary/10 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-none transition-colors ${stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white' :
                                stat.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white' :
                                    'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white'
                                }`}>
                                <span className="material-symbols-outlined">{stat.icon}</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">{stat.label} allocated</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Detailed Table Card */}
                <div className="bg-white dark:bg-surface-dark rounded-none border border-slate-200 dark:border-primary/10 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 dark:border-primary/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">Class Schedule</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Assignments Overview</p>
                        </div>
                        <div className="size-10 bg-slate-100 dark:bg-primary/10 rounded-none flex items-center justify-center text-slate-600 dark:text-primary shadow-sm border border-slate-200 dark:border-primary/20">
                            <span className="material-symbols-outlined text-xl">event_note</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="px-8 py-4">Class</th>
                                    <th className="px-8 py-4">Subject</th>
                                    <th className="px-8 py-4">Room/Time</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-primary/10">
                                {assignments.map((item, index) => (
                                    <tr key={index} className="group hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors">
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">{item.className}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-primary/10 text-primary dark:text-primary-light rounded-none text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                                {item.subject}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.schedule || "TBA"}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="px-4 py-2 text-primary hover:bg-primary/10 rounded-none text-xs font-bold transition-colors border border-primary/20"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {assignments.length === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-gray-400 font-bold italic">No assignments to display.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Info Card */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/10 rounded-none p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-[0.03] blur-[100px] pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-primary/10 pb-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight font-display">Performance Metrics</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-primary/10 rounded-none group-hover:border-emerald-500/30 transition-all cursor-default">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Attendance Average</span>
                                        <span className="text-sm font-black text-emerald-500">92%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-none overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[92%] rounded-none shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-primary/10 rounded-none group-hover:border-blue-500/30 transition-all cursor-default">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Syllabus Progress</span>
                                        <span className="text-sm font-black text-blue-500">75%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-none overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[75%] rounded-none shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TeacherDashboard;
