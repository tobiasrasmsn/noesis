"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface QuizCardProps {
    topic: string;
    title: string;
    description: string;
    color: string;
    dragOffset: number;
}

export default function QuizCard({ topic, title, description, color }: QuizCardProps) {
    const [isSelected, setIsSelected] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [animationOrigin, setAnimationOrigin] = useState({ x: 0, y: 0 });
    const router = useRouter();

    const handleStartQuiz = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            const rect = event.currentTarget.getBoundingClientRect();
            setAnimationOrigin({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            });
            setIsSelected(true);
            setShowLoading(true);

            setTimeout(() => {
                router.push(`/quiz/${title}`);
            }, 500);
        },
        [title, router]
    );

    return (
        <>
            <div
                className={`p-2 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-${color}-400 to-${color}-600 h-[180px] w-[180px] sm:w-[250px] sm:h-[250px] flex flex-col justify-between transition-all hover:scale-105 hover:rotate-1 duration-200`}
            >
                <div>
                    <div className="p-1 px-3 bg-black text-zinc-200 opacity-95 rounded-full flex justify-center items-center capitalize w-fit relative">
                        <h2 className="font-medium text-xs sm:text-sm">{topic}</h2>
                    </div>
                    <div className="flex flex-col gap-1 mt-4">
                        <h2 className="text-lg sm:text-xl text-zinc-50 font-medium capitalize">{title}</h2>
                        <p className="text-xs sm:text-sm text-zinc-50 opacity-75">{description}</p>
                    </div>
                </div>
                <button
                    onClick={handleStartQuiz}
                    className="mt-4 px-4 py-1 sm:py-2 bg-zinc-100 text-black rounded-full font-medium text-xs sm:text-sm hover:bg-opacity-90 transition-all duration-200"
                >
                    Start Quiz
                </button>
            </div>
            {typeof window !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {isSelected && (
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
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className={`fixed top-0 left-0 w-screen h-screen bg-gradient-to-br from-${color}-400 to-${color}-600 flex items-center justify-center`}
                                style={{ zIndex: 9999 }}
                            ></motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </>
    );
}
