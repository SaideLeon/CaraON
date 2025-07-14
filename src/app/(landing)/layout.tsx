import type { ReactNode } from "react";
import { Footer } from "./_components/Footer";

export default function LandingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
