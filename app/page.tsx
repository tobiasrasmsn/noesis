import React from "react";
import Topics from "@/components/Topics";

export default function Home() {
    return (
        <main className="bg-zinc-900">
            <section className="px-8 md:px-12 h-full md:h-[100dvh] min-h-[500px] flex justify-center items-center">
                <Topics />
            </section>
        </main>
    );
}
