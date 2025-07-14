import type { ReactNode } from "react";
import { Header } from "./_components/Header";
import { Footer } from "./_components/Footer";

export default function LandingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
