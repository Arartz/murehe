import React, { useState, useEffect } from "react";
import { getClasses, submitApplication } from "../services/firestoreService";
import { useNavigate } from "react-router-dom";

const AdmissionForm = ({ isOverlay = false, onClose }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        childFirstName: "",
        childLastName: "",
        dateOfBirth: "",
        gender: "",
        applyingClass: "",
        religiousAffiliation: "",
        parentFullName: "",
        parentEmail: "",
        parentPhone: "",
        address: ""
    });
    const [classes, setClasses] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            const classList = await getClasses();
            setClasses(classList);
        };
        fetchClasses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            // Combine names for backward compatibility if needed, or store as is
            const submissionData = {
                ...formData,
                childFullName: `${formData.childFirstName} ${formData.childLastName}`,
                createdAt: new Date()
            };
            await submitApplication(submissionData);
            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
            setError("Failed to submit application. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className={`${isOverlay ? "" : "min-h-screen"} bg-background-light dark:bg-background-dark flex items-center justify-center p-4`}>
                <div className="bg-white dark:bg-surface-dark p-8 rounded-none shadow-lg max-w-md w-full text-center border border-emerald-500/20">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-none flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-emerald-600 dark:text-emerald-400">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">Application Submitted!</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 font-sans">
                        Your application for {formData.childFirstName} has been received. We will contact you shortly.
                    </p>
                    {isOverlay && onClose ? (
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-none font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            Close Overlay
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-none font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            Return to Home
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${isOverlay ? "" : "min-h-screen"} bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300`}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Top Navigation Bar */}
            {!isOverlay && (
                <header className="border-b border-slate-200 dark:border-primary/20 bg-background-light dark:bg-background-dark sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                                <div className="size-10 bg-primary rounded-none flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-3xl">school</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold leading-tight tracking-tight text-primary dark:text-white font-display">Jasiri Christian School</h1>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Excellence in Faith & Learning</p>
                                </div>
                            </div>
                            <nav className="hidden md:flex items-center gap-8">
                                <button onClick={() => navigate("/")} className="text-sm font-medium hover:text-primary transition-colors">Home</button>
                                <span className="text-sm font-medium text-primary border-b-2 border-primary pb-0.5">Admissions</span>
                                <span className="text-sm font-medium text-slate-400 cursor-not-allowed">Academics</span>
                                <span className="text-sm font-medium text-slate-400 cursor-not-allowed">About Us</span>
                            </nav>
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-none bg-slate-200 dark:bg-surface-dark border border-slate-300 dark:border-primary/30 flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined text-slate-400">person</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            <main className={`${isOverlay ? "max-w-full py-6" : "max-w-4xl py-12"} mx-auto px-4`} onClick={(e) => e.stopPropagation()}>
                {/* Progress Header - HIDDEN IN OVERLAY */}
                {!isOverlay && (
                    <div className="mb-12">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">New Student Registration</h2>
                                    <p className="text-slate-600 dark:text-slate-400">Academic Year {new Date().getFullYear()}-{new Date().getFullYear() + 1} Application</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-primary mb-1">Step {step} of 3</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round((step / 3) * 100)}%</p>
                                </div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-none overflow-hidden">
                                <div
                                    className="bg-primary h-full rounded-none transition-all duration-500 ease-out"
                                    style={{ width: `${(step / 3) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Steps Indicator - COMPACT IN OVERLAY */}
                <div className={`grid grid-cols-3 gap-2 ${isOverlay ? "mb-6" : "mb-10"}`}>
                    <div className={`flex items-center gap-2 p-3 rounded-none border transition-all ${step >= 1 ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white dark:bg-surface-dark border-slate-200 dark:border-primary/10 text-slate-400"}`}>
                        <span className="material-symbols-outlined text-xl">person</span>
                        <span className="font-bold text-xs hidden sm:inline uppercase">Student</span>
                    </div>
                    <div className={`flex items-center gap-2 p-3 rounded-none border transition-all ${step >= 2 ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white dark:bg-surface-dark border-slate-200 dark:border-primary/10 text-slate-400"}`}>
                        <span className="material-symbols-outlined text-xl">family_restroom</span>
                        <span className="font-bold text-xs hidden sm:inline uppercase">Parent</span>
                    </div>
                    <div className={`flex items-center gap-2 p-3 rounded-none border transition-all ${step >= 3 ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white dark:bg-surface-dark border-slate-200 dark:border-primary/10 text-slate-400"}`}>
                        <span className="material-symbols-outlined text-xl">history_edu</span>
                        <span className="font-bold text-xs hidden sm:inline uppercase">Review</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-none flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <p className="text-red-700 dark:text-red-300 font-bold">{error}</p>
                    </div>
                )}

                {/* Main Form Container */}
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Step 1: Student Information */}
                    {step === 1 && (
                        <section className={`${isOverlay ? "p-4" : "p-8"} bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/10 rounded-none shadow-sm`}>
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-primary/10 pb-2">
                                <span className="material-symbols-outlined text-primary text-2xl">badge</span>
                                <h3 className={`${isOverlay ? "text-xl" : "text-2xl"} font-bold font-display uppercase tracking-tight`}>Student Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">First Name</label>
                                    <input
                                        name="childFirstName"
                                        value={formData.childFirstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-none border border-slate-300 dark:border-primary/20 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                        placeholder="e.g. John"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
                                    <input
                                        name="childLastName"
                                        value={formData.childLastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-none border border-slate-300 dark:border-primary/20 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                        placeholder="e.g. Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-none border border-slate-300 dark:border-primary/20 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white dark:[color-scheme:dark]"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-none border border-slate-300 dark:border-primary/20 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Intended Grade Level</label>
                                    <select
                                        name="applyingClass"
                                        value={formData.applyingClass}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-none border border-slate-300 dark:border-primary/20 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                        required
                                    >
                                        <option value="">Select Grade</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.name || cls.id}>{cls.name || cls.id}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Religious Affiliation</label>
                                    <input
                                        name="religiousAffiliation"
                                        value={formData.religiousAffiliation}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-none border border-slate-300 dark:border-primary/20 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                        placeholder="e.g. Christian"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Step 2: Parent Information */}
                    {step === 2 && (
                        <section className={`${isOverlay ? "p-4" : "p-8"} bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/10 rounded-none shadow-sm`}>
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-primary/10 pb-2">
                                <span className="material-symbols-outlined text-primary text-2xl">family_restroom</span>
                                <h3 className={`${isOverlay ? "text-xl" : "text-2xl"} font-bold font-display uppercase tracking-tight`}>Guardian Details</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Parent Full Name</label>
                                    <input
                                        name="parentFullName"
                                        value={formData.parentFullName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-none border border-slate-300 dark:border-primary/20 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                        <input
                                            type="email"
                                            name="parentEmail"
                                            value={formData.parentEmail}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-none border border-slate-300 dark:border-primary/20 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="parentPhone"
                                            value={formData.parentPhone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-none border border-slate-300 dark:border-primary/20 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-3 rounded-none border border-slate-300 dark:border-primary/20 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                    ></textarea>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <section className={`${isOverlay ? "p-4" : "p-8"} bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/10 rounded-none shadow-sm`}>
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-primary/10 pb-2">
                                <span className="material-symbols-outlined text-primary text-2xl">fact_check</span>
                                <h3 className={`${isOverlay ? "text-xl" : "text-2xl"} font-bold font-display uppercase tracking-tight`}>Review</h3>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-4">Student Details</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400">Name</p>
                                            <p className="font-bold">{formData.childFirstName} {formData.childLastName}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400">DOB</p>
                                            <p className="font-bold">{formData.dateOfBirth}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400">Grade</p>
                                            <p className="font-bold">{formData.applyingClass}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-slate-100 dark:border-primary/10 pt-6">
                                    <h4 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-4">Parent Details</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400">Guardian</p>
                                            <p className="font-bold">{formData.parentFullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400">Contact</p>
                                            <p className="font-bold">{formData.parentEmail}</p>
                                            <p className="font-bold">{formData.parentPhone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </form>

                {/* Navigation Actions - MOVED OUTSIDE FORM */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t border-slate-100 dark:border-primary/10">
                    <button
                        type="button"
                        className="w-full sm:w-auto px-8 py-3 rounded-none border border-slate-300 dark:border-primary/20 font-bold hover:bg-slate-100 dark:hover:bg-background-dark transition-colors flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300"
                    >
                        <span className="material-symbols-outlined text-lg">save</span>
                        Save Draft
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="w-full sm:w-auto px-8 py-3 rounded-none text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Previous
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="w-full sm:w-auto px-12 py-4 rounded-none bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
                            >
                                Next Step
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full sm:w-auto px-12 py-4 rounded-none bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "Submit Application"}
                                <span className="material-symbols-outlined text-lg">send</span>
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer Information */}
            {!isOverlay && (
                <footer className="bg-slate-100 dark:bg-black/20 border-t border-slate-200 dark:border-primary/10 py-12 mt-20">
                    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined">school</span>
                                <span className="font-display font-bold text-lg">Jasiri Christian School</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-sans">
                                Nurturing hearts and minds through faith-based excellence since 1998. Join our community of lifelong learners.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-900 dark:text-white font-display">Admissions Office</h4>
                            <ul className="text-sm text-slate-500 space-y-2 font-sans">
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm">mail</span>
                                    admissions@jasirischool.edu
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm">call</span>
                                    +1 (555) 012-3456
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                    123 Academy Heights, Faith City
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-900 dark:text-white font-display">Next Steps</h4>
                            <p className="text-sm text-slate-500 font-sans">
                                Once submitted, our admissions team will review your application and contact you within 5-7 business days to schedule an interview.
                            </p>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 pt-12 mt-12 border-t border-slate-200 dark:border-primary/10 text-center text-xs text-slate-400 font-sans">
                        © {new Date().getFullYear()} Jasiri Christian School. All rights reserved.
                    </div>
                </footer>
            )}
        </div>
    );
};

export default AdmissionForm;
