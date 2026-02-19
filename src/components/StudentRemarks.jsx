import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTeacherAssignments, getStudentsByClass, saveStudentComments, getActiveTerm } from "../services/firestoreService";

const StudentRemarks = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [students, setStudents] = useState([]);
    const [comments, setComments] = useState({}); // studentId -> commentText
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
                const uniqueClasses = [...new Set(assignmentData.map(a => a.className))];
                setAssignments(uniqueClasses);
                setActiveTerm(termData);
                if (termData?.locked) {
                    setError(`The ${termData.name} is currently LOCKED. Remarks cannot be entered or edited.`);
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
        setComments({});
        setSuccess("");
        setError("");

        if (className) {
            setLoading(true);
            try {
                const studentList = await getStudentsByClass(className);
                setStudents(studentList);
            } catch (error) {
                setError("Failed to fetch students.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCommentChange = (studentId, text) => {
        setComments(prev => ({ ...prev, [studentId]: text }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClass) return;

        setLoading(true);
        setSuccess("");
        setError("");

        if (!activeTerm) {
            setError("No active term found. Please contact the admin.");
            setLoading(false);
            return;
        }

        if (activeTerm.locked) {
            setError("This term is locked for remarks entry.");
            setLoading(false);
            return;
        }

        // Filter out empty comments
        const commentsToSave = Object.entries(comments)
            .filter(([_, text]) => text.trim() !== "")
            .map(([studentId, text]) => ({
                studentId,
                teacherId: user.uid,
                term: activeTerm.name,
                commentText: text.trim()
            }));

        if (commentsToSave.length === 0) {
            setError("Please enter at least one comment.");
            setLoading(false);
            return;
        }

        try {
            await saveStudentComments(commentsToSave);
            setSuccess("Comments saved successfully!");
            setComments({});
        } catch (error) {
            setError("Failed to save comments.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filledCount = Object.values(comments).filter(c => c && c.trim() !== "").length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Control Panel Card */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/10 rounded-none p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-[0.03] blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
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

            {/* Stats Card */}
            {selectedClass && students.length > 0 && (
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/10 rounded-none p-8 shadow-sm group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Remarks Progress</p>
                            <p className="text-slate-900 dark:text-white text-3xl font-black">{filledCount} / {students.length}</p>
                            <p className="text-slate-400 text-[10px] mt-2 italic font-bold uppercase tracking-wider">Students with remarks entered</p>
                        </div>
                        <div className="size-16 bg-primary/10 rounded-none flex items-center justify-center border border-primary/20">
                            <span className="material-symbols-outlined text-primary text-3xl">chat</span>
                        </div>
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

            {/* Remarks Form */}
            {selectedClass && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-dark rounded-none shadow-sm border border-slate-200 dark:border-primary/10 overflow-hidden">
                    <div className="p-10 border-b border-slate-100 dark:border-primary/10 bg-slate-50/30 dark:bg-black/10">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight font-display">{selectedClass} Student Remarks</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Enter term comments for each student</p>
                    </div>

                    <div className="p-10 space-y-6">
                        {students.map(student => (
                            <div key={student.id} className="bg-slate-50 dark:bg-black/20 rounded-none p-8 border border-slate-100 dark:border-primary/10 hover:border-primary/30 transition-all group">
                                <div className="flex items-start gap-6">
                                    <div className="size-12 bg-primary text-white rounded-none flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg">
                                        {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight font-display">{student.fullName}</h4>
                                        <textarea
                                            value={comments[student.id] || ""}
                                            onChange={(e) => handleCommentChange(student.id, e.target.value)}
                                            className="w-full px-6 py-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/20 rounded-none text-slate-900 dark:text-white font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none"
                                            rows="3"
                                            placeholder="Enter student remarks here... (e.g., 'Excellent performance in class discussions')"
                                        />
                                        {comments[student.id] && comments[student.id].trim() !== "" && (
                                            <div className="flex items-center gap-2 text-emerald-500">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                <span className="text-xs font-bold uppercase tracking-widest">Remark Added</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                        <span>Save All Remarks</span>
                                        <span className="material-symbols-outlined text-xl">save</span>
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

export default StudentRemarks;
