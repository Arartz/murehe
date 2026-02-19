import React from "react";

const ContactPage = () => {
    return (
        <div className="animate-fade-in">
            {/* Contact Hero */}
            <section className="bg-gradient-maroon text-white py-24 border-b border-white/10">
                <div className="container mx-auto px-4 text-center max-w-4xl space-y-6">
                    <span className="text-accent font-black tracking-[0.3em] uppercase text-[10px]">Reach Out</span>
                    <h1 className="text-5xl md:text-6xl font-heading font-black leading-tight">Get in Touch</h1>
                    <div className="w-20 h-1.5 bg-accent mx-auto"></div>
                    <p className="text-xl opacity-90 font-medium leading-relaxed">
                        Have questions? We'd love to hear from you. Reach out to us via phone, email, or visit our campus in Rwamagana.
                    </p>
                </div>
            </section>

            {/* Info & Form */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
                        {/* Info */}
                        <div className="space-y-12">
                            <div className="space-y-6 text-center lg:text-left">
                                <h2 className="text-4xl font-heading font-black text-primary dark:text-accent uppercase tracking-tighter">Contact Information</h2>
                                <p className="text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                    Our dedicated team is available to assist you with any inquiries regarding admissions, academics, or school life at JCS.
                                </p>
                            </div>

                            <div className="grid gap-8">
                                {[
                                    { title: "Our Location", value: "Rwamagana, Muyumbu, Murehe, Rwanda", icon: "location_on" },
                                    { title: "Phone Number", value: "+250 786 084 272", icon: "call", link: "tel:+250786084272" },
                                    { title: "Email Address", value: "infojasiri@gmail.com", icon: "mail", link: "mailto:infojasiri@gmail.com" }
                                ].map((info, i) => (
                                    <div key={i} className="flex items-start gap-6 p-10 bg-surface border border-slate-200 dark:border-primary/10 shadow-sm group hover:border-primary transition-all rounded-3xl">
                                        <div className="w-14 h-14 bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all rounded-2xl">
                                            <span className="material-symbols-outlined text-3xl">{info.icon}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-heading font-black text-xl text-primary dark:text-accent uppercase tracking-widest leading-none">{info.title}</h4>
                                            {info.link ? (
                                                <a href={info.link} className="text-slate-500 dark:text-slate-400 font-bold text-lg hover:text-accent transition-colors block">{info.value}</a>
                                            ) : (
                                                <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-tight">{info.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-primary p-12 shadow-2xl relative overflow-hidden rounded-3xl">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 -translate-y-1/2 translate-x-1/2 rotate-45"></div>
                            <h3 className="text-3xl font-heading font-black text-white mb-8 uppercase tracking-widest relative z-10">Send a Message</h3>
                            <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Full Name</label>
                                        <input type="text" placeholder="John Doe" className="w-full px-6 py-4 bg-white/10 border border-white/20 text-white font-bold outline-none focus:bg-white/20 transition-all placeholder:text-white/30 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Email Address</label>
                                        <input type="email" placeholder="john@example.com" className="w-full px-6 py-4 bg-white/10 border border-white/20 text-white font-bold outline-none focus:bg-white/20 transition-all placeholder:text-white/30 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Subject</label>
                                    <input type="text" placeholder="General Inquiry" className="w-full px-6 py-4 bg-white/10 border border-white/20 text-white font-bold outline-none focus:bg-white/20 transition-all placeholder:text-white/30 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Your Message</label>
                                    <textarea rows="5" placeholder="Tell us more..." className="w-full px-6 py-4 bg-white/10 border border-white/20 text-white font-bold outline-none focus:bg-white/20 transition-all placeholder:text-white/30 resize-none rounded-xl"></textarea>
                                </div>
                                <button className="w-full py-5 bg-accent hover:bg-white hover:text-primary text-white font-black uppercase tracking-[0.3em] text-xs transition-all transform active:scale-[0.98] shadow-xl rounded-full">
                                    Send Message Now
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
