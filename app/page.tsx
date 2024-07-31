"use client";

import React, { useState } from "react";
import Topics, { Topic } from "@/components/Topics";

export default function Home() {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    const handleTopicSelect = (topic: Topic) => {
        setSelectedTopic(topic);
        // Add your navigation logic here, for example:
        // setTimeout(() => router.push(`/quiz/${topic.name}`), 1000);
    };

    return (
        <main className="bg-zinc-900 w-screen h-screen">
            <section className="w-full h-full px-8 md:px-12 flex justify-center items-center">
                <Topics onTopicSelect={handleTopicSelect} />
            </section>
        </main>
    );
}
