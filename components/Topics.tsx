"use client";
import React from "react";
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
import { motion } from "framer-motion";
const topics = [
    {
        name: "Health",
        icon: RiMentalHealthLine,
        gradient: "from-red-500 to-rose-300",
    },
    {
        name: "Food & Cooking",
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

export default function Topics() {
    return (
        <div className="flex justify-center items-center flex-col ">
            <motion.h2
                className="text-2xl mb-5 text-zinc-300"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Pick a topic to get started.
            </motion.h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {topics.map((topic, index) => (
                    <motion.section
                        key={index}
                        className="aspect-square cursor-pointer"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.05,
                            ease: "easeOut",
                        }}
                    >
                        <div
                            className={`w-full h-full p-2 flex flex-col justify-center items-center rounded-xl bg-gradient-to-br ${topic.gradient} transition-transform hover:scale-105`}
                        >
                            <topic.icon className="w-6 h-6 text-white mb-1" />
                            <span className="text-white font-medium text-xs text-center">
                                {topic.name}
                            </span>
                        </div>
                    </motion.section>
                ))}
            </div>
        </div>
    );
}
