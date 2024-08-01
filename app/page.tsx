"use client";

import React, { useState } from "react";
import Topics, { Topic } from "@/components/Topics";

export default function Home() {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    const handleTopicSelect = (topic: Topic) => {
        setSelectedTopic(topic);
    };

    return (
        <main className="bg-zinc-900 min-h-[100dvh] h-full w-full flex items-center justify-center">
            <section className="w-full px-8 md:px-12 flex justify-center items-center py-12">
                <Topics onTopicSelect={handleTopicSelect} />
            </section>
        </main>
    );
}
