import React from "react";

const AcademicsPage = () => {
    return (
        <div className="animate-fade-in">
            {/* Academics Hero */}
            <section className="bg-gradient-maroon text-white py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center max-w-4xl space-y-6 relative z-10">
                    <span className="text-accent font-black tracking-[0.3em] uppercase text-[10px]">Academic Excellence</span>
                    <h1 className="text-5xl md:text-6xl font-heading font-black leading-tight drop-shadow-xl">Competency-Based <br /> Education</h1>
                    <div className="w-20 h-1.5 bg-accent mx-auto mt-6"></div>
                    <p className="text-xl opacity-90 font-medium leading-relaxed drop-shadow-lg">
                        Our learner-centered approach empowers students to achieve academic mastery while developing critical real-world skills through Rwanda's CBC framework.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-3xl -z-0"></div>
            </section>

            {/* CBC Approach */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary dark:text-accent">Our Pedagogical Approach</h2>
                            <div className="space-y-6 text-slate-600 dark:text-slate-400 font-bold leading-relaxed text-lg">
                                <p>
                                    We follow Rwanda's national competency-based curriculum (CBC), which shifts the focus from rote memorization to active learning, practical skills, and cognitive development.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { title: "Critical Thinking", icon: "psychology" },
                                    { title: "Creative Innovation", icon: "lightbulb" },
                                    { title: "Collaboration", icon: "groups" },
                                    { title: "Communication", icon: "forum" }
                                ].map((skill, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-surface p-6 border border-slate-200 dark:border-primary/10 transition-all hover:border-primary rounded-2xl">
                                        <span className="material-symbols-outlined text-primary dark:text-accent text-3xl">{skill.icon}</span>
                                        <span className="font-black text-primary dark:text-slate-200 uppercase tracking-widest text-xs">{skill.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-primary p-12 shadow-2xl relative rounded-3xl">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-accent"></div>
                            <h3 className="text-2xl font-heading font-black mb-8 text-white uppercase tracking-widest">Core Subjects</h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-12 text-sm text-slate-300 font-black tracking-widest uppercase">
                                <div className="flex items-center gap-3"><div className="w-2 h-2 bg-accent"></div> Mathematics</div>
                                <div className="flex items-center gap-3"><div className="w-2 h-2 bg-accent"></div> Science & Tech</div>
                                <div className="flex items-center gap-3"><div className="w-2 h-2 bg-accent"></div> English Language</div>
                                <div className="flex items-center gap-3"><div className="w-2 h-2 bg-accent"></div> Kinyarwanda</div>
                                <div className="flex items-center gap-3"><div className="w-2 h-2 bg-accent"></div> Social Studies</div>
                                <div className="flex items-center gap-3"><div className="w-2 h-2 bg-accent"></div> Christian Ethics</div>
                                <div className="flex items-center gap-3"><div className="w-2 h-2 bg-accent"></div> Creative Arts</div>
                                <div className="flex items-center gap-3"><div className="w-2 h-2 bg-accent"></div> ICT & Digital Skills</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology */}
            <section className="py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-heading font-black text-primary dark:text-accent">Technology-Integrated Learning</h2>
                        <div className="w-20 h-1.5 bg-accent mx-auto"></div>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                            We prepare our students for the digital age by integrating modern technology into our daily lessons, fostering digital literacy from an early age.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
                        {[
                            {
                                title: "Smart Classrooms",
                                desc: "Equipped with digital tools that enhance interaction, engagement, and visual learning.",
                                icon: "desktop_windows"
                            },
                            {
                                title: "E-Library Access",
                                desc: "A vast array of digital resources for research, independent study, and cultural exploration.",
                                icon: "book_2"
                            },
                            {
                                title: "Coding & Logic",
                                desc: "Early introduction to programming and computational thinking to solve complex problems.",
                                icon: "code"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-background p-10 border border-slate-200 dark:border-primary/10 text-center space-y-6 hover:shadow-2xl transition-all group rounded-3xl">
                                <div className="w-20 h-20 bg-primary/5 dark:bg-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    <span className="material-symbols-outlined text-4xl">{feature.icon}</span>
                                </div>
                                <h4 className="font-heading font-black text-2xl text-primary dark:text-accent uppercase tracking-tighter">{feature.title}</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AcademicsPage;
