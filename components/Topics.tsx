"use client";

import React, { useState } from "react";
import {
    FaBook,
    FaFilm,
    FaFootballBall,
    FaGlobe,
    FaLandmark,
    FaLaptop,
    FaMicroscope,
    FaMusic,
    FaPaintBrush,
    FaUtensils,
} from "react-icons/fa";
import { GiTreeGrowth, GiGreekTemple } from "react-icons/gi";
import { IoMdPlanet } from "react-icons/io";
import { MdBusiness } from "react-icons/md";
import { RiMentalHealthLine } from "react-icons/ri";
import { AnimatePresence, motion } from "framer-motion";
import { IconType } from "react-icons";
import { redirect, useRouter } from "next/navigation";

export interface Topic {
    name: string;
    icon: IconType;
    gradient: string;
}

export const topics: Topic[] = [
    {
        name: "Health",
        icon: RiMentalHealthLine,
        gradient: "from-red-500 to-rose-300",
    },
    {
        name: "Cooking",
        icon: FaUtensils,
        gradient: "from-rose-500 to-orange-300",
    },
    {
        name: "History",
        icon: FaLandmark,
        gradient: "from-orange-500 to-amber-300",
    },
    {
        name: "Sports",
        icon: FaFootballBall,
        gradient: "from-amber-500 to-yellow-300",
    },
    {
        name: "Nature",
        icon: GiTreeGrowth,
        gradient: "from-yellow-500 to-lime-300",
    },
    {
        name: "Geography",
        icon: FaGlobe,
        gradient: "from-lime-500 to-green-300",
    },
    {
        name: "Science",
        icon: FaMicroscope,
        gradient: "from-green-500 to-emerald-300",
    },
    {
        name: "Technology",
        icon: FaLaptop,
        gradient: "from-emerald-500 to-teal-300",
    },
    { name: "Space", icon: IoMdPlanet, gradient: "from-teal-500 to-cyan-300" },
    { name: "Music", icon: FaMusic, gradient: "from-cyan-500 to-blue-300" },
    { name: "Movies", icon: FaFilm, gradient: "from-blue-500 to-indigo-300" },
    {
        name: "Literature",
        icon: FaBook,
        gradient: "from-indigo-500 to-violet-300",
    },
    {
        name: "Art",
        icon: FaPaintBrush,
        gradient: "from-violet-500 to-purple-300",
    },
    {
        name: "Mythology",
        icon: GiGreekTemple,
        gradient: "from-purple-500 to-fuchsia-300",
    },
    {
        name: "Business",
        icon: MdBusiness,
        gradient: "from-slate-500 to-gray-300",
    },
];

interface LoadingProps {
    className?: string;
}

const Loader = () => (
    <motion.div
        animate={{
            scale: [1, 2, 2, 1, 1],
            rotate: [0, 0, 270, 270, 0],
            borderRadius: ["0%", "0%", "50%", "50%", "0%"],
            backgroundColor: [
                "rgba(228, 228, 231, 0)",
                "rgba(228, 228, 231, 0)",
                "rgba(228, 228, 231, 1)",
                "rgba(228, 228, 231, 1)",
                "rgba(228, 228, 231, 0)",
            ],
            borderWidth: ["4px", "4px", "0px", "0px", "4px"],
            borderColor: [
                "rgb(228, 228, 231)",
                "rgb(228, 228, 231)",
                "rgba(228, 228, 231, 0)",
                "rgba(228, 228, 231, 0)",
                "rgb(228, 228, 231)",
            ],
        }}
        transition={{
            duration: 3,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 1,
        }}
        className="w-16 h-16 border-solid"
    >
        <motion.div
            animate={{
                opacity: [0, 1, 1, 1, 0],
                scale: [0.5, 1, 1, 1, 0.5],
            }}
            transition={{
                duration: 3,
                ease: "easeInOut",
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: Infinity,
                repeatDelay: 1,
            }}
            className="w-full h-full flex items-center justify-center text-zinc-950 font-bold"
        ></motion.div>
    </motion.div>
);

interface TopicsProps {
    onTopicSelect: (topic: Topic) => void;
}

export default function Topics({ onTopicSelect }: TopicsProps) {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [showLoading, setShowLoading] = useState(false);
    const [animationOrigin, setAnimationOrigin] = useState({ x: 0, y: 0 });
    const router = useRouter();
    const handleTopicClick = (
        topic: Topic,
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setAnimationOrigin({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        });
        setSelectedTopic(topic);
        setShowLoading(true);
        setTimeout(() => {
            onTopicSelect(topic);
            setTimeout(() => {
                setShowLoading(false);
                setSelectedTopic(null);
                router.push(`/quiz/${topic.name}`);
            }, 1500);
        }, 1000);
    };

    return (
        <div className="flex overflow-hidden justify-center items-center flex-col relative w-full h-full bg-zinc-900 p-4">
            <motion.h2
                className="text-2xl mb-5 text-zinc-300 text-nowrap"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Pick a topic to get started.
            </motion.h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 max-w-4xl mx-auto">
                {topics.map((topic, index) => (
                    <motion.div
                        key={index}
                        className="aspect-square cursor-pointer"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.05,
                            ease: "easeOut",
                        }}
                        onClick={(event) => handleTopicClick(topic, event)}
                    >
                        <div
                            className={`w-full h-full p-2 flex flex-col justify-center items-center rounded-xl bg-gradient-to-br ${topic.gradient} transition-transform duration-500 hover:scale-105`}
                        >
                            <topic.icon className="w-6 h-6 text-white mb-1" />
                            <span className="text-white font-medium text-xs text-center">
                                {topic.name}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
            <AnimatePresence>
                {selectedTopic && (
                    <motion.div
                        initial={{
                            clipPath: `circle(0px at ${animationOrigin.x}px ${animationOrigin.y}px)`,
                        }}
                        animate={{
                            clipPath: `circle(150% at ${animationOrigin.x}px ${animationOrigin.y}px)`,
                        }}
                        exit={{
                            clipPath: `circle(0px at ${animationOrigin.x}px ${animationOrigin.y}px)`,
                        }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className={`fixed top-0 left-0 w-screen h-screen bg-gradient-to-br ${selectedTopic.gradient} flex items-center justify-center`}
                        style={{ zIndex: 50 }}
                    >
                        {showLoading && <Loader />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
