"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import * as quizzes from "@/constants/quizzes";
import { TOPICS } from "@/constants/topics";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { pusherClient } from "@/lib/pusher";

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

interface PlayerState {
    id: string;
    score: number;
    answered: boolean;
    lastAnswer: number | null;
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
    const searchParams = useSearchParams();
    const topic = params.topic;
    const [quiz, setQuiz] = useState<QuizProps | null>(null);
    const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isMultiplayer, setIsMultiplayer] = useState(false);
    const [gameId, setGameId] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [players, setPlayers] = useState<PlayerState[]>([]);
    const [timeLeft, setTimeLeft] = useState(10);
    const [gameReady, setGameReady] = useState(false);

    useEffect(() => {
        const gameIdFromUrl = searchParams.get("gameId");
        if (gameIdFromUrl && !isMultiplayer) {
            joinMultiplayerGame(gameIdFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        if (topic && typeof topic === "string") {
            const quizData = (quizzes as any)[topic.toUpperCase()];
            const topicData = TOPICS.find((t) => t.title.toLowerCase() === topic.toLowerCase());
            if (quizData) {
                const shuffledQuestions = shuffleArray<Question>(quizData.questions);
                setQuiz({
                    questions: shuffledQuestions,
                    gradient: `from-${topicData?.color}-400 to-${topicData?.color}-600`,
                });
                setRandomizedQuestions(shuffledQuestions);
                setTimeout(() => setLoading(false), 500);
            } else {
                router.push("/");
            }
        }
    }, [topic, router]);

    useEffect(() => {
        if (isMultiplayer && gameId) {
            const channel = pusherClient.subscribe(`game-${gameId}`);
            channel.bind(
                "player-joined",
                (data: { players: PlayerState[]; questions: Question[]; currentQuestion: number }) => {
                    console.log("Player joined:", data);
                    setPlayers(data.players);
                    setRandomizedQuestions(data.questions);
                    setCurrentQuestion(data.currentQuestion);
                    if (data.players.length === 2) {
                        startMultiplayerGame();
                    }
                }
            );
            channel.bind("player-answered", (data: { players: PlayerState[]; currentQuestion: number }) => {
                console.log("Player answered:", data);
                setPlayers(data.players);
            });
            channel.bind("next-question", (data: { currentQuestion: number; players: PlayerState[] }) => {
                console.log("Next question:", data);
                setCurrentQuestion(data.currentQuestion);
                setPlayers(data.players);
                setTimeLeft(10);
                setSelectedAnswer(null);
                setIsCorrect(null);
            });
            channel.bind("game-ended", (data: { players: PlayerState[] }) => {
                console.log("Game ended:", data);
                setPlayers(data.players);
                setShowResult(true);
                setGameReady(false);
            });

            return () => {
                pusherClient.unsubscribe(`game-${gameId}`);
            };
        }
    }, [isMultiplayer, gameId]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isMultiplayer && gameReady && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isMultiplayer, gameReady, timeLeft]);

    useEffect(() => {
        if (isMultiplayer && timeLeft === 0 && selectedAnswer === null) {
            handleAnswer(-1);
        }
    }, [isMultiplayer, timeLeft, selectedAnswer]);

    const createMultiplayerGame = async () => {
        try {
            const response = await fetch("/api/multiplayer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Server response:", data);
            if (!data.gameId) {
                throw new Error("Game ID is missing from server response");
            }
            setGameId(data.gameId);
            setPlayerId(data.playerId);
            setIsMultiplayer(true);
            setPlayers([{ id: data.playerId, score: 0, answered: false, lastAnswer: null }]);
            setRandomizedQuestions(data.questions);
            setGameReady(true);
            console.log("Game created successfully. Game ID:", data.gameId);
        } catch (error) {
            console.error("Failed to create multiplayer game:", error);
            alert("Failed to create the game. Please try again.");
        }
    };

    const joinMultiplayerGame = async (gameId: string) => {
        try {
            console.log("Attempting to join game with ID:", gameId);
            const response = await fetch(`/api/multiplayer?gameId=${gameId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Joined game:", data);
            setGameId(gameId);
            setPlayerId(data.playerId);
            setIsMultiplayer(true);
            setPlayers(data.players);
            setRandomizedQuestions(data.questions);
            setCurrentQuestion(data.currentQuestion);
            setGameReady(true);
        } catch (error: any) {
            console.error("Failed to join multiplayer game:", error);
            alert(`Failed to join the game: ${error.message}`);
            router.push(`/quiz/${topic}`);
        }
    };

    const startMultiplayerGame = () => {
        setCurrentQuestion(0);
        setScore(0);
        setShowResult(false);
        setTimeLeft(10);
        setGameReady(true);
    };

    const handleAnswer = async (answerIndex: number) => {
        if (selectedAnswer === null) {
            setSelectedAnswer(answerIndex);
            const correct = answerIndex === randomizedQuestions[currentQuestion].correctAnswer;
            setIsCorrect(correct);

            if (isMultiplayer) {
                await submitAnswer(answerIndex);
            } else {
                if (correct) {
                    setScore(score + 1);
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                    });
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
        }
    };

    const submitAnswer = async (answerIndex: number) => {
        try {
            const response = await fetch("/api/multiplayer", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gameId, playerId, answerIndex }),
            });
            const data = await response.json();
            console.log("Submit answer response:", data);

            setPlayers(data.players);
        } catch (error) {
            console.error("Error submitting answer:", error);
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
            setIsMultiplayer(false);
            setGameId(null);
            setPlayerId(null);
            setPlayers([]);
        }
    };

    const getButtonColor = (index: number) => {
        if (selectedAnswer === null) return "bg-zinc-700 hover:bg-zinc-600";
        if (index === randomizedQuestions[currentQuestion].correctAnswer) return "bg-green-500 hover:bg-green-600";
        if (index === selectedAnswer) return "bg-red-500 hover:bg-red-600";
        return "bg-zinc-700 hover:bg-zinc-600";
    };

    return (
        <div className={`min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-4`}>
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
                        <h1 className="text-3xl font-bold mb-8 capitalize">{topic} Quiz</h1>
                        {!isMultiplayer && !gameId && (
                            <button
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded mb-4"
                                onClick={createMultiplayerGame}
                            >
                                Play with a friend
                            </button>
                        )}
                        {isMultiplayer && gameReady && players && players.length < 2 && gameId && (
                            <div className="mb-4">
                                <p>Waiting for friend to join...</p>
                                <p>
                                    Share this URL: {window.location.origin}/quiz/{topic}?gameId={gameId}
                                </p>
                            </div>
                        )}
                        {!showResult ? (
                            <div className="w-full max-w-md">
                                {isMultiplayer && players && players.length > 0 && (
                                    <div className="mb-4">
                                        <p>Time left: {timeLeft}s</p>
                                        <p>Players: {players.map((p) => `${p.id} (${p.score})`).join(", ")}</p>
                                        <p>
                                            Status:{" "}
                                            {players[0]?.answered ? "Player one answered" : "Player one answered"},
                                            {players[1]?.answered
                                                ? "Player two answered"
                                                : "Player two hasn't answered"}
                                        </p>
                                    </div>
                                )}
                                <h2 className="text-xl mb-4">
                                    Question {currentQuestion + 1} of {randomizedQuestions.length}
                                </h2>
                                <p className="mb-4">{randomizedQuestions[currentQuestion]?.question}</p>
                                <div className="space-y-2">
                                    {randomizedQuestions[currentQuestion]?.answers.map((answer, index) => (
                                        <button
                                            key={index}
                                            className={`w-full p-2 rounded transition-colors duration-300 ${getButtonColor(
                                                index
                                            )}`}
                                            onClick={() => handleAnswer(index)}
                                            disabled={selectedAnswer !== null || (isMultiplayer && timeLeft === 0)}
                                        >
                                            {answer}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-2xl mb-4">Quiz Completed!</h2>
                                {isMultiplayer && players ? (
                                    <div>
                                        <p className="text-xl mb-4">Final Scores:</p>
                                        {players.map((player) => (
                                            <p key={player.id}>
                                                {player.id === playerId ? "You" : "Friend"}: {player.score}
                                            </p>
                                        ))}
                                        <p className="text-xl mt-4">
                                            {players[0].score === players[1].score
                                                ? "It's a tie!"
                                                : `${
                                                      players[0].score > players[1].score
                                                          ? players[0].id === playerId
                                                              ? "You"
                                                              : "Friend"
                                                          : players[1].id === playerId
                                                          ? "You"
                                                          : "Friend"
                                                  } wins!`}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xl mb-4">
                                        Your score: {score} out of {randomizedQuestions.length}
                                    </p>
                                )}
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
