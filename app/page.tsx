"use client";

import React, { useState } from "react";
import Topics, { Topic } from "@/components/Topics";
import TopicPicker from "@/components/TopicPicker";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    const handleTopicSelect = (topic: Topic) => {
        setSelectedTopic(topic);
    };

    return (
        <main className="bg-[#E5D8CF] min-h-[500px] h-[100dvh] w-full flex flex-col items-center justify-center gap-12">
            <div className="flex flex-col justify-end items-center">
                <h2 className="text-3xl font-normal text-zinc-800 leading-none">Noesis</h2>
                <h3 className="text-xs font-normal text-zinc-900 opacity-55 leading-none">Cures boredom.</h3>
            </div>
            <TopicPicker />

            <AnimatedShinyText className="inline-flex text-sm items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                <span>Multiplayer coming soon</span>
            </AnimatedShinyText>
        </main>
    );
}
