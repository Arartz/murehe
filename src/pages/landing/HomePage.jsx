import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center bg-gradient-maroon text-white overflow-hidden">
                <div
                    className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat transform scale-105 animate-pulse-slow"
                    style={{ backgroundImage: "url('/assets/1.jpeg')" }}
                ></div>
                <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
                    <h2 className="text-5xl md:text-7xl font-heading font-black mb-6 leading-tight drop-shadow-2xl">
                        Nurturing Excellence, <br className="hidden md:block" /> Building Character
                    </h2>
                    <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-lg">
                        A vibrant Christian community where every child is empowered to learn, serve, and grow in faith and knowledge.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                        <Link
                            to="/admissions"
                            className="bg-accent hover:bg-accent/90 text-white px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-accent/40 transition-all transform hover:-translate-y-1 active:translate-y-0"
                        >
                            Enroll Now
                        </Link>
                        <Link
                            to="/about"
                            className="bg-white/10 backdrop-blur-md border-2 border-white/20 px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-white/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20 space-y-4">
                        <span className="text-accent font-black tracking-[0.3em] uppercase text-[10px]">Our Foundation</span>
                        <h2 className="text-4xl md:text-5xl font-heading font-black text-primary dark:text-accent">Core Christian Values</h2>
                        <div className="w-20 h-1.5 bg-accent mx-auto mt-6"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {[
                            {
                                title: "Faith Centered",
                                desc: "Rooted in Biblical principles, fostering a personal relationship with Christ.",
                                icon: "favorite"
                            },
                            {
                                title: "Integrity First",
                                desc: "Encouraging honesty, accountability, and strong moral character in all students.",
                                icon: "verified_user"
                            },
                            {
                                title: "Academic Excellence",
                                desc: "Striving for the highest standards in education and personal development.",
                                icon: "auto_awesome"
                            }
                        ].map((value, i) => (
                            <div
                                key={i}
                                className="bg-surface p-10 rounded-2xl border border-slate-200 dark:border-primary/10 hover:shadow-2xl transition-all group hover:-translate-y-2"
                            >
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                    <span className="material-symbols-outlined text-4xl">{value.icon}</span>
                                </div>
                                <h3 className="text-2xl font-heading font-black mb-4 text-primary dark:text-accent">{value.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Discover Section */}
            <section className="py-24 bg-slate-100 dark:bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary dark:text-accent leading-tight">
                                Discover the <br /> Jasiri Difference
                            </h2>
                            <div className="space-y-6 text-slate-600 dark:text-slate-400 font-bold leading-relaxed text-lg">
                                <p>
                                    Jasiri Christian School is more than just a place of learning; it's a family where students are nurtured to become leaders of tomorrow.
                                </p>
                                <p>
                                    Our curriculum blends academic rigor with spiritual growth, ensuring every child develops a strong foundation for the future.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="space-y-4">
                                    <div className="aspect-square bg-slate-200 overflow-hidden rounded-2xl border border-slate-300 dark:border-primary/20">
                                        <img src="/assets/2.jpeg" alt="Activities" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                                    </div>
                                    <h4 className="font-heading font-black text-sm uppercase tracking-widest text-primary dark:text-accent">Practical Learning</h4>
                                </div>
                                <div className="space-y-4 pt-12">
                                    <div className="aspect-square bg-slate-200 overflow-hidden rounded-2xl border border-slate-300 dark:border-primary/20">
                                        <img src="/assets/3.jpeg" alt="Classroom" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                                    </div>
                                    <h4 className="font-heading font-black text-sm uppercase tracking-widest text-primary dark:text-accent">Spiritual Growth</h4>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {[
                                { title: "Our Mission", desc: "To provide high-quality Christian education that transforms lives." },
                                { title: "Holistic Growth", desc: "Focusing on spiritual, intellectual, physical, and social development." },
                                { title: "Global Vision", desc: "Equipping students with a global perspective while staying rooted." },
                                { title: "Service Driven", desc: "Encouraging a heart for service and community involvement." }
                            ].map((card, i) => (
                                <div key={i} className="bg-surface p-8 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-sm hover:shadow-xl transition-all">
                                    <div className="w-8 h-1 bg-accent mb-4 rounded-full"></div>
                                    <h4 className="font-heading font-black text-xl mb-3 text-primary dark:text-accent">{card.title}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
