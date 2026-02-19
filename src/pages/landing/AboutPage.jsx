import React from "react";

const AboutPage = () => {
    return (
        <div className="animate-fade-in">
            {/* About Hero */}
            <section className="bg-surface py-24 border-b border-slate-200 dark:border-primary/10">
                <div className="container mx-auto px-4 text-center max-w-4xl space-y-6">
                    <span className="text-accent font-black tracking-[0.3em] uppercase text-[10px]">Since 2018</span>
                    <h1 className="text-5xl md:text-6xl font-heading font-black text-primary dark:text-accent leading-tight">Our Story & Vision</h1>
                    <div className="w-20 h-1.5 bg-accent mx-auto"></div>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                        Founded with a passion for holistic education, Jasiri Christian School is committed to raising bold, compassionate, and globally-minded learners rooted in Christian faith and Rwandan values.
                    </p>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
                        <div className="space-y-10">
                            <div className="bg-surface p-12 rounded-3xl border border-slate-200 dark:border-primary/10 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-primary group-hover:w-4 transition-all"></div>
                                <h3 className="text-3xl font-heading font-black text-primary dark:text-accent mb-6">Our Vision</h3>
                                <p className="text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                    To be a model school that nurtures bold, compassionate, and globally-minded learners rooted in Christian faith and Rwandan values.
                                </p>
                            </div>
                            <div className="bg-surface p-12 rounded-3xl border border-slate-200 dark:border-primary/10 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-accent group-hover:w-4 transition-all"></div>
                                <h3 className="text-3xl font-heading font-black text-primary dark:text-accent mb-6">Our Mission</h3>
                                <p className="text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                    To provide a nurturing, Christ-centered learning environment that empowers each child to excel academically, grow spiritually, and serve their community.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary/5 dark:bg-primary/10 -rotate-2"></div>
                            <img src="/assets/4.jpeg" alt="Jasiri School Students" className="relative z-10 rounded-3xl shadow-2xl w-full h-[600px] object-cover border-8 border-white dark:border-surface-dark" />
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 dark:bg-accent/40 backdrop-blur-3xl rounded-none -z-0"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Educators */}
            <section className="py-24 bg-surface" id="teachers">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-heading font-black text-primary dark:text-accent">Our Dedicated Educators</h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-bold">
                            Our teachers are more than educators; they are mentors and role models committed to student success.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
                        <div className="order-2 md:order-1 relative">
                            <img src="/assets/5.jpeg" alt="Educators" className="rounded-3xl shadow-2xl w-full h-[500px] object-cover" />
                        </div>
                        <div className="order-1 md:order-2 space-y-8">
                            <div className="bg-background p-8 border border-slate-200 dark:border-primary/10 shadow-sm group hover:border-primary transition-all rounded-3xl">
                                <div className="flex items-center gap-4 mb-4 text-primary dark:text-accent font-heading font-black text-xl">
                                    <span className="material-symbols-outlined text-3xl">psychology</span>
                                    <h4>Continuous Growth</h4>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                    Our staff participates in ongoing professional development to stay at the forefront of modern pedagogy and child psychology.
                                </p>
                            </div>
                            <div className="bg-background p-8 border border-slate-200 dark:border-primary/10 shadow-sm group hover:border-accent transition-all rounded-3xl">
                                <div className="flex items-center gap-4 mb-4 text-primary dark:text-accent font-heading font-black text-xl">
                                    <span className="material-symbols-outlined text-3xl">auto_stories</span>
                                    <h4>Biblical Integration</h4>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                    Teachers are equipped to integrate faith into every subject, nurturing spiritual maturity and a deep understanding of Biblical truth.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community */}
            <section className="py-24 bg-white dark:bg-background-dark" id="community">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary dark:text-accent">Community & Culture</h2>
                            <p className="text-xl text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                At JCS, we believe it takes a village to raise a child. Our school culture is built on transparency, partnership, and a shared commitment to our students' wellbeing.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    "Strong Parent-Teacher Association",
                                    "Local Community Engagement",
                                    "Service-Oriented Culture",
                                    "Safe & Nurturing Environment"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-lg font-black text-primary dark:text-slate-200">
                                        <span className="material-symbols-outlined text-accent text-2xl">check_circle</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <img src="/assets/6.jpeg" alt="Community" className="rounded-none shadow-2xl w-full h-[500px] object-cover border-8 border-slate-100 dark:border-surface-dark" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
