import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTeacherAssignments, getStudentsByClass, saveAttendance, getActiveTerm } from "../services/firestoreService";

const AttendanceSystem = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // studentId -> status (present/absent)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTerm, setActiveTerm] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) return;
            try {
                const [assignmentData, termData] = await Promise.all([
                    getTeacherAssignments(user.uid),
                    getActiveTerm()
                ]);
                // Get unique classes from assignments
                const uniqueClasses = [...new Set(assignmentData.map(a => a.className))];
                setAssignments(uniqueClasses);
                setActiveTerm(termData);
                if (termData?.locked) {
                    setError(`The ${termData.name} is currently LOCKED. Attendance records cannot be modified.`);
                }
            } catch (error) {
                setError("Failed to load initial data.");
                console.error(error);
            }
        };
        loadInitialData();
    }, [user]);

    const handleClassChange = async (e) => {
        const className = e.target.value;
        setSelectedClass(className);
        setStudents([]);
        setAttendance({});
        setSuccess("");
        setError("");

        if (className) {
            setLoading(true);
            try {
                const studentList = await getStudentsByClass(className);
                setStudents(studentList);
                // Initialize all as present
                const initialAttendance = {};
                studentList.forEach(s => initialAttendance[s.id] = "present");
                setAttendance(initialAttendance);
            } catch (error) {
                setError("Failed to fetch students.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleStatus = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === "present" ? "absent" : "present"
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClass) return;

        setLoading(true);
        setSuccess("");
        setError("");

        if (activeTerm?.locked) {
            setError("This term is locked. Attendance cannot be saved.");
            setLoading(false);
            return;
        }

        const attendanceToSave = Object.entries(attendance).map(([studentId, status]) => ({
            studentId,
            classId: selectedClass,
            date,
            status,
            term: activeTerm?.name || "N/A"
        }));

        try {
            await saveAttendance(attendanceToSave);
            setSuccess("Attendance saved successfully!");
        } catch (error) {
            setError("Failed to save attendance.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const presentCount = Object.values(attendance).filter(s => s === "present").length;
    const absentCount = Object.values(attendance).filter(s => s === "absent").length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Control Panel Card */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/10 rounded-none p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-[0.03] blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Select Class</label>
                        <select
                            value={selectedClass}
                            onChange={handleClassChange}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-primary/20 rounded-none text-slate-800 dark:text-slate-100 font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2rem' }}
                        >
                            <option value="" className="bg-white dark:bg-surface-dark">-- Choose Class --</option>
                            {assignments.map((cls, index) => (
                                <option key={index} value={cls} className="bg-white dark:bg-surface-dark">{cls}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Attendance Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-primary/20 rounded-none text-slate-800 dark:text-slate-100 font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            />
                            <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">calendar_today</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Term Status</label>
                        <div className={`px-6 py-4 rounded-none border flex items-center gap-3 ${activeTerm?.locked ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}>
                            <span className={`w-2 h-2 rounded-none animate-pulse ${activeTerm?.locked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                            <span className="font-black text-sm uppercase tracking-wider">
                                {activeTerm ? `${activeTerm.name} ${activeTerm.locked ? "(Locked)" : "(Active)"}` : "No Active Term"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {selectedClass && students.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-none shadow-sm border border-slate-200 dark:border-primary/10 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-none text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Students</span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">{students.length}</h4>
                    </div>

                    <div className="bg-white dark:bg-surface-dark p-6 rounded-none shadow-sm border border-slate-200 dark:border-primary/10 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-none text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Present</span>
                        </div>
                        <h4 className="text-2xl font-black text-emerald-500">{presentCount}</h4>
                    </div>

                    <div className="bg-white dark:bg-surface-dark p-6 rounded-none shadow-sm border border-slate-200 dark:border-primary/10 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-none text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">cancel</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Absent</span>
                        </div>
                        <h4 className="text-2xl font-black text-red-500">{absentCount}</h4>
                    </div>
                </div>
            )}

            {/* Notifications */}
            {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-none text-red-500 font-bold text-sm flex items-center gap-3 animate-pulse">
                    <span className="material-symbols-outlined">error</span> {error}
                </div>
            )}
            {success && (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-none text-emerald-500 font-bold text-sm flex items-center gap-3">
                    <span className="material-symbols-outlined">check_circle</span> {success}
                </div>
            )}

            {/* Attendance Table */}
            {selectedClass && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-dark rounded-none shadow-sm border border-slate-200 dark:border-primary/10 overflow-hidden">
                    <div className="p-10 border-b border-slate-100 dark:border-primary/10 bg-slate-50/30 dark:bg-black/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight font-display">{selectedClass} Attendance</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Mark attendance for {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="px-10 py-6">Student Name</th>
                                    <th className="px-10 py-6 text-center">Status</th>
                                    <th className="px-10 py-6 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-primary/10">
                                {students.map(student => (
                                    <tr key={student.id} className="group hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors">
                                        <td className="px-10 py-8 text-slate-800 dark:text-white font-bold">
                                            {student.fullName}
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className={`px-4 py-2 rounded-none text-xs font-black uppercase tracking-widest ${attendance[student.id] === "present"
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                                                : 'bg-red-500/10 text-red-600 border border-red-500/30'
                                                }`}>
                                                {attendance[student.id]}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(student.id)}
                                                className={`px-6 py-3 rounded-none font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${attendance[student.id] === "present"
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                                    : 'bg-red-500 text-white shadow-lg shadow-red-200'
                                                    }`}
                                            >
                                                Toggle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {students.length === 0 && !loading && (
                        <div className="p-20 text-center">
                            <p className="text-slate-400 font-bold italic text-lg font-display">No students found for this class.</p>
                        </div>
                    )}

                    {students.length > 0 && (
                        <div className="p-10 bg-slate-50/30 dark:bg-black/10 border-t border-slate-100 dark:border-primary/10 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || students.length === 0 || activeTerm?.locked}
                                className={`px-12 py-5 rounded-none font-bold text-sm uppercase tracking-[0.2em] shadow-lg transition-all flex items-center gap-4 ${activeTerm?.locked
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-primary/10'
                                    : 'bg-primary text-white hover:scale-105 active:scale-95 hover:shadow-primary/20'
                                    }`}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-none animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Save Attendance Record</span>
                                        <span className="material-symbols-outlined uppercase">save</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
};

export default AttendanceSystem;
