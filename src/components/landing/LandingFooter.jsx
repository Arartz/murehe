import React from "react";
import { Link } from "react-router-dom";

const LandingFooter = () => {
    return (
        <footer className="bg-primary text-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img src="/assets/title.png" alt="Logo" className="h-12 w-12 object-contain" />
                            <h3 className="font-heading font-bold text-xl">Jasiri Christian School</h3>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed font-medium">
                            Dedicated to nurturing bold, compassionate, and globally-minded learners rooted in faith and values.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-heading font-bold text-accent mb-6 uppercase tracking-widest text-sm">Quick Links</h4>
                        <ul className="space-y-4 text-sm font-bold">
                            <li><Link to="/about" className="text-slate-300 hover:text-accent transition-colors">About Us</Link></li>
                            <li><Link to="/academics" className="text-slate-300 hover:text-accent transition-colors">Academics</Link></li>
                            <li><Link to="/admissions" className="text-slate-300 hover:text-accent transition-colors">Admissions</Link></li>
                            <li><Link to="/contact" className="text-slate-300 hover:text-accent transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-heading font-bold text-accent mb-6 uppercase tracking-widest text-sm">Community</h4>
                        <ul className="space-y-4 text-sm font-bold">
                            <li><Link to="/about#teachers" className="text-slate-300 hover:text-accent transition-colors">Our Educators</Link></li>
                            <li><Link to="/about#culture" className="text-slate-300 hover:text-accent transition-colors">School Culture</Link></li>
                            <li><Link to="/contact" className="text-slate-300 hover:text-accent transition-colors">Support JCS</Link></li>
                            <li><Link to="/login" className="text-slate-300 hover:text-accent transition-colors font-black">Portal Access</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-heading font-bold text-accent mb-6 uppercase tracking-widest text-sm">Contact Us</h4>
                        <ul className="space-y-4 text-sm font-bold">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-accent text-xl">location_on</span>
                                <span className="text-slate-300">Rwamagana, Muyumbu, Murehe, Rwanda</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-accent text-xl">call</span>
                                <a href="tel:+250786084272" className="text-slate-300 hover:text-accent transition-colors">+250 786 084 272</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-accent text-xl">mail</span>
                                <a href="mailto:infojasiri@gmail.com" className="text-slate-300 hover:text-accent transition-colors">infojasiri@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Jasiri Christian School. Boldly learn, serve and grow.</p>
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;
