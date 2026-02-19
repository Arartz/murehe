import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTeacherAssignments, getStudentsByClass, saveStudentMarks, getActiveTerm } from "../services/firestoreService";
import { useNavigate } from "react-router-dom";

const MarkEntry = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({}); // studentId -> score
    const [maxScore, setMaxScore] = useState(100);
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
                setAssignments(assignmentData);
                setActiveTerm(termData);
                if (termData?.locked) {
                    setError(`The ${termData.name} is currently LOCKED. Marks cannot be entered or edited.`);
                }
            } catch (err) {
                setError("Failed to load initial data.");
            }
        };
        loadInitialData();
    }, [user]);

    const handleAssignmentChange = async (e) => {
        const assignmentId = e.target.value;
        const assignment = assignments.find(a => a.id === assignmentId);
        setSelectedAssignment(assignment);
        setStudents([]);
        setMarks({});
        setError("");
        setSuccess("");

        if (assignment) {
            setLoading(true);
            try {
                const studentList = await getStudentsByClass(assignment.className);
                setStudents(studentList);
            } catch (err) {
                setError("Failed to fetch students.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleMarkChange = (studentId, score) => {
        const numScore = parseFloat(score);
        if (numScore > maxScore) {
            setError(`Score cannot exceed maximum of ${maxScore}`);
            return;
        }
        setError("");
        setMarks(prev => ({ ...prev, [studentId]: score }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAssignment) return;

        if (!activeTerm) {
            setError("No active term found. Please contact the admin.");
            return;
        }

        if (activeTerm.locked) {
            setError("This term is locked for mark entry.");
            return;
        }

        setLoading(true);
        const marksToSave = Object.entries(marks).map(([studentId, score]) => ({
            studentId,
            subjectId: selectedAssignment.subject,
            classId: selectedAssignment.className,
            teacherId: user.uid,
            score: parseFloat(score),
            term: activeTerm.name
        }));

        try {
            await saveStudentMarks(marksToSave);
            setSuccess("Marks saved successfully!");
            setMarks({});
        } catch (err) {
            setError("Failed to save marks.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Control Panel Card */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/10 rounded-none p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-[0.03] blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Select Assignment</label>
                        <select
                            onChange={handleAssignmentChange}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-primary/20 rounded-none text-slate-800 dark:text-slate-100 font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2rem' }}
                        >
                            <option value="" className="bg-black">-- Choose Class & Subject --</option>
                            {assignments.map(a => (
                                <option key={a.id} value={a.id} className="bg-black">{a.className} - {a.subject}</option>
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

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Max Possible Score</label>
                        <input
                            type="number"
                            value={maxScore}
                            onChange={(e) => setMaxScore(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-primary/20 rounded-none text-slate-800 dark:text-slate-100 font-black text-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

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

            {/* Mark Submission Area */}
            {selectedAssignment && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-dark rounded-none shadow-sm border border-slate-200 dark:border-primary/10 overflow-hidden">
                    <div className="p-10 border-b border-slate-100 dark:border-primary/10 bg-slate-50/30 dark:bg-black/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight font-display">{selectedAssignment.className} Student List</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Recording marks for {selectedAssignment.subject}</p>
                        </div>
                        <div className="px-6 py-2 bg-primary text-white rounded-none text-xs font-bold uppercase tracking-widest italic shadow-lg">
                            {students.length} Students
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="px-10 py-6">Full Name</th>
                                    <th className="px-10 py-6 text-right">Score Input</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-primary/10">
                                {students.map(student => (
                                    <tr key={student.id} className="group hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors">
                                        <td className="px-10 py-8 text-slate-800 dark:text-white font-bold">
                                            {student.fullName}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-black/20 p-2 rounded-none border border-slate-200 dark:border-primary/20 focus-within:ring-4 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={marks[student.id] || ""}
                                                    onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                    className="w-24 bg-transparent text-right font-black text-slate-900 dark:text-white text-xl outline-none"
                                                    max={maxScore}
                                                    placeholder="0.0"
                                                    required
                                                />
                                                <span className="text-slate-300 dark:text-slate-600 font-bold border-l border-slate-200 dark:border-primary/20 pl-3 italic">/ {maxScore}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

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
                                    <span>Save & Commit Marks</span>
                                    <span className="material-symbols-outlined">save</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {selectedAssignment && students.length === 0 && !loading && (
                <div className="p-20 bg-white dark:bg-surface-dark rounded-none border border-slate-200 dark:border-primary/10 text-center shadow-sm">
                    <p className="text-slate-400 font-bold italic text-lg font-display">No students found for this class.</p>
                </div>
            )}
        </div>
    );
};

export default MarkEntry;
