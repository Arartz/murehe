import React from "react";
import { Outlet } from "react-router-dom";
import LandingHeader from "./LandingHeader";
import LandingFooter from "./LandingFooter";
import { ThemeProvider } from "../../context/ThemeContext";

const LandingLayout = () => {
    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
                <LandingHeader />
                <main className="flex-1">
                    <Outlet />
                </main>
                <LandingFooter />
            </div>
        </ThemeProvider>
    );
};

export default LandingLayout;
