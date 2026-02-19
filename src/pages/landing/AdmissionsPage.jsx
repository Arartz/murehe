import React, { useState } from "react";
import AdmissionForm from "../../components/AdmissionForm";

const AdmissionsPage = () => {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="animate-fade-in">
            {/* Admissions Hero */}
            <section className="bg-gradient-maroon text-white py-24 border-b border-white/10">
                <div className="container mx-auto px-4 text-center max-w-4xl space-y-6">
                    <span className="text-accent font-black tracking-[0.3em] uppercase text-[10px]">Enrollment 2026</span>
                    <h1 className="text-5xl md:text-6xl font-heading font-black leading-tight">Join the Jasiri Family</h1>
                    <div className="w-20 h-1.5 bg-accent mx-auto"></div>
                    <p className="text-xl opacity-90 font-medium leading-relaxed">
                        We are excited to welcome new students and families who share our vision of excellence, character, and spiritual growth.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-12 py-4 bg-accent hover:bg-white text-primary hover:text-primary font-black uppercase tracking-widest transition-all shadow-xl rounded-full"
                    >
                        Apply Now
                    </button>
                </div>
            </section>

            {/* Welcome Message */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/5 translate-x-4 translate-y-4"></div>
                            <img src="/assets/7.jpeg" alt="School Welcome" className="relative z-10 w-full h-[600px] object-cover rounded-3xl shadow-2xl border-8 border-white dark:border-surface-dark" />
                        </div>
                        <div className="space-y-8">
                            <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-primary dark:text-accent text-4xl">handshake</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary dark:text-accent leading-tight">A Nurturing Start for Your Child</h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                Choosing the right school for your child is one of the most important decisions you'll ever make. At JCS, we provide a warm, nurturing environment where your child can thrive both academically and spiritually.
                            </p>
                            <div className="bg-surface p-8 rounded-3xl border-l-8 border-primary shadow-sm space-y-4">
                                <div>
                                    <h4 className="font-heading font-black text-xl text-primary dark:text-accent uppercase tracking-widest">Registration Open</h4>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold">
                                        We are currently accepting applications for the 2026 academic year. Limited spaces available in selected grades.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="flex items-center gap-2 text-primary dark:text-accent font-black uppercase tracking-tighter hover:gap-4 transition-all"
                                >
                                    Start Application
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-heading font-black text-primary dark:text-accent uppercase tracking-tighter">Admission Process</h2>
                        <div className="w-20 h-1.5 bg-accent mx-auto"></div>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-bold">Follow these simple steps to enroll your child at Jasiri Christian School.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {[
                            { step: "01", title: "Inquiry & Visit", desc: "Schedule a tour of our modern campus to see our facilities and meet our educators in person." },
                            { step: "02", title: "Application", desc: "Submit the application form along with the required documents and the processing fee." },
                            { step: "03", title: "Assessment", desc: "Learners undergo a friendly baseline assessment to help us identify their individual needs." }
                        ].map((step, i) => (
                            <div key={i} className="bg-background p-12 relative overflow-hidden group border border-slate-200 dark:border-primary/10 rounded-3xl">
                                <span className="absolute -top-10 -right-4 text-9xl font-black text-primary/5 transition-all group-hover:text-primary/10">{step.step}</span>
                                <h4 className="text-2xl font-heading font-black text-primary dark:text-accent mb-6 uppercase tracking-widest">{step.title}</h4>
                                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed relative z-10">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary dark:text-accent uppercase tracking-tighter leading-tight">A Strong Educational Partnership</h2>
                            <p className="text-xl text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                We believe that education is a collaborative journey between the school and the home. When you join JCS, you enter a partnership dedicated to your child's holistic development.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-lg font-black text-primary dark:text-slate-200">
                                    <span className="material-symbols-outlined text-accent">keyboard_double_arrow_right</span>
                                    Regular Student Progress Updates
                                </div>
                                <div className="flex items-center gap-4 text-lg font-black text-primary dark:text-slate-200">
                                    <span className="material-symbols-outlined text-accent">keyboard_double_arrow_right</span>
                                    Open-Door Policy for Parent Feedback
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <img src="/assets/8.jpeg" alt="Partnership" className="rounded-none shadow-2xl w-full h-[500px] object-cover" />
                            <div className="absolute -inset-4 border-2 border-accent -z-10 translate-x-8 translate-y-8"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Admission Form Overlay */}
            {showForm && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in bg-primary/40 backdrop-blur-xl"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowForm(false);
                    }}
                >
                    {/* Content Container */}
                    <div
                        className="relative bg-white dark:bg-background-dark w-full max-w-5xl h-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 animate-slide-up text-left rounded-3xl z-10 flex flex-col"
                    >
                        {/* Header/Close Button (Always Visible) */}
                        <div className="absolute top-6 right-6 z-[120]">
                            <button
                                onClick={() => setShowForm(false)}
                                className="size-12 bg-primary text-white flex items-center justify-center hover:bg-accent hover:text-primary transition-all shadow-lg rounded-full"
                            >
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>
                        </div>

                        {/* Scrollable Form Content */}
                        <div className="flex-1 overflow-y-auto">
                            <AdmissionForm isOverlay={true} onClose={() => setShowForm(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdmissionsPage;
