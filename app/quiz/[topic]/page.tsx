"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import * as quizzes from "@/constants/quizzes";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
    question: string;
    answers: string[];
    correctAnswer: number;
}

type Props = {
    params: { topic: string };
};

interface QuizProps {
    questions: Question[];
    gradient: string;
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function QuizPage({ params }: Props) {
    const router = useRouter();
    const topic = params.topic;
    const [quiz, setQuiz] = useState<QuizProps | null>(null);
    const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>(
        []
    );
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    useEffect(() => {
        if (topic && typeof topic === "string") {
            const quizData = (quizzes as any)[topic.toUpperCase()];
            if (quizData) {
                const shuffledQuestions = shuffleArray<Question>(
                    quizData.questions
                );
                setQuiz({
                    questions: shuffledQuestions,
                    gradient: quizData.gradient || "from-zinc-500 to-zinc-700",
                });
                setRandomizedQuestions(shuffledQuestions);
                setTimeout(() => setLoading(false), 2000);
            } else {
                router.push("/");
            }
        }
    }, [topic, router]);

    const handleAnswer = (answerIndex: number) => {
        if (quiz && selectedAnswer === null) {
            setSelectedAnswer(answerIndex);
            const correct =
                answerIndex ===
                randomizedQuestions[currentQuestion].correctAnswer;
            setIsCorrect(correct);
            if (correct) {
                setScore(score + 1);
            }

            setTimeout(() => {
                setSelectedAnswer(null);
                setIsCorrect(null);
                if (currentQuestion + 1 < randomizedQuestions.length) {
                    setCurrentQuestion(currentQuestion + 1);
                } else {
                    setShowResult(true);
                }
            }, 1500);
        }
    };

    const restartQuiz = () => {
        if (quiz) {
            const shuffledQuestions = shuffleArray<Question>(quiz.questions);
            setRandomizedQuestions(shuffledQuestions);
            setCurrentQuestion(0);
            setScore(0);
            setShowResult(false);
            setSelectedAnswer(null);
            setIsCorrect(null);
        }
    };

    const getButtonColor = (index: number) => {
        if (selectedAnswer === null) return "bg-zinc-700 hover:bg-zinc-600";
        if (index === randomizedQuestions[currentQuestion].correctAnswer)
            return "bg-green-500 hover:bg-green-600";
        if (index === selectedAnswer) return "bg-red-500 hover:bg-red-600";
        return "bg-zinc-700 hover:bg-zinc-600";
    };

    return (
        <div
            className={`min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-4`}
        >
            <AnimatePresence>
                {loading ? (
                    <motion.div
                        key="loader"
                        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${quiz?.gradient}`}
                        exit={{ scale: 10, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            animate={{
                                scale: [1, 2, 2, 1, 1],
                                rotate: [0, 0, 270, 270, 0],
                                borderRadius: ["0%", "0%", "50%", "50%", "0%"],
                            }}
                            transition={{
                                duration: 2,
                                ease: "easeInOut",
                                times: [0, 0.2, 0.5, 0.8, 1],
                                repeat: Infinity,
                                repeatDelay: 1,
                            }}
                            className="w-16 h-16 bg-white"
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="quiz"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        <h1 className="text-3xl font-bold mb-8 capitalize">
                            {topic} Quiz
                        </h1>
                        {!showResult ? (
                            <div className="w-full max-w-md">
                                <h2 className="text-xl mb-4">
                                    Question {currentQuestion + 1} of{" "}
                                    {randomizedQuestions.length}
                                </h2>
                                <p className="mb-4">
                                    {
                                        randomizedQuestions[currentQuestion]
                                            .question
                                    }
                                </p>
                                <div className="space-y-2">
                                    {randomizedQuestions[
                                        currentQuestion
                                    ].answers.map((answer, index) => (
                                        <button
                                            key={index}
                                            className={`w-full p-2 rounded transition-colors duration-300 ${getButtonColor(
                                                index
                                            )}`}
                                            onClick={() => handleAnswer(index)}
                                            disabled={selectedAnswer !== null}
                                        >
                                            {answer}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-2xl mb-4">
                                    Quiz Completed!
                                </h2>
                                <p className="text-xl mb-4">
                                    Your score: {score} out of{" "}
                                    {randomizedQuestions.length}
                                </p>
                                <button
                                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
                                    onClick={restartQuiz}
                                >
                                    Restart Quiz
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
