import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import * as quizzes from "@/constants/quizzes";

interface Player {
    id: string;
    score: number;
    answered: boolean;
    lastAnswer: number | null;
}

interface GameData {
    topic: string;
    players: Player[];
    currentQuestion: number;
    questions: {
        question: string;
        answers: string[];
        correctAnswer: number;
    }[];
}

function shuffleQuestions(topic: string) {
    const quizData = (quizzes as any)[topic.toUpperCase()];
    return shuffleArray(quizData.questions);
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startGameTimer(gameId: string) {
    console.log(`Starting game timer for gameId: ${gameId}`);

    while (true) {
        let gameDataRaw: any;
        try {
            gameDataRaw = await redis.get(`game:${gameId}`);
            if (!gameDataRaw) {
                console.log(`Game ${gameId} not found, ending timer`);
                return;
            }
        } catch (e) {
            console.error("Failed to retrieve game data:", e);
            return;
        }

        let gameData: GameData;
        if (typeof gameDataRaw === "string") {
            try {
                gameData = JSON.parse(gameDataRaw);
            } catch (e) {
                console.error("Failed to parse game data:", e);
                return;
            }
        } else if (typeof gameDataRaw === "object") {
            gameData = gameDataRaw as GameData;
        } else {
            console.error("Unexpected game data type:", typeof gameDataRaw);
            return;
        }

        gameData.currentQuestion += 1;

        if (gameData.currentQuestion >= gameData.questions.length) {
            console.log(`Game ID: ${gameId} has ended.`);
            await pusherServer.trigger(`game-${gameId}`, "game-ended", { players: gameData.players });
            await redis.del(`game:${gameId}`);
            return;
        }

        gameData.players.forEach((player) => {
            player.answered = false;
            player.lastAnswer = null;
        });

        await redis.set(`game:${gameId}`, JSON.stringify(gameData));

        await pusherServer.trigger(`game-${gameId}`, "next-question", {
            currentQuestion: gameData.currentQuestion,
            players: gameData.players,
        });

        await delay(10000);
    }
}

export async function POST(request: NextRequest) {
    const { topic } = await request.json();
    const gameId = Math.random().toString(36).substring(2, 15);
    const playerId = Math.random().toString(36).substring(2, 15);

    const questions = shuffleQuestions(topic);

    const gameData: GameData = {
        topic,
        players: [{ id: playerId, score: 0, answered: false, lastAnswer: null }],
        currentQuestion: 0,
        questions: questions,
    };

    try {
        await redis.set(`game:${gameId}`, JSON.stringify(gameData));
        await redis.expire(`game:${gameId}`, 3600);

        const storedGame = await redis.get(`game:${gameId}`);
        console.log("Stored game data:", storedGame);

        if (!storedGame) {
            throw new Error("Failed to store game data");
        }

        console.log("Created new game with ID:", gameId);

        startGameTimer(gameId);

        return NextResponse.json({ gameId, playerId, questions });
    } catch (error) {
        console.error("Error creating game:", error);
        return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("gameId");
    console.log("Received GET request for gameId:", gameId);

    if (!gameId) {
        console.log("Game ID is missing");
        return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    try {
        const gameDataRaw = await redis.get(`game:${gameId}`);
        console.log("Raw retrieved game data:", gameDataRaw);

        if (!gameDataRaw) {
            console.log("Game not found in Redis");
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        let parsedGameData: GameData;
        if (typeof gameDataRaw === "string") {
            try {
                parsedGameData = JSON.parse(gameDataRaw);
            } catch (e) {
                console.error("Failed to parse game data:", e);
                return NextResponse.json({ error: "Invalid game data" }, { status: 500 });
            }
        } else if (typeof gameDataRaw === "object") {
            parsedGameData = gameDataRaw as GameData;
        } else {
            console.error("Unexpected game data type:", typeof gameDataRaw);
            return NextResponse.json({ error: "Invalid game data" }, { status: 500 });
        }

        if (!parsedGameData || !Array.isArray(parsedGameData.players)) {
            console.log("Invalid game data structure");
            return NextResponse.json({ error: "Invalid game data" }, { status: 500 });
        }

        let playerId = null;
        if (parsedGameData.players.length < 2) {
            playerId = Math.random().toString(36).substring(2, 15);
            parsedGameData.players.push({ id: playerId, score: 0, answered: false, lastAnswer: null });

            await redis.set(`game:${gameId}`, JSON.stringify(parsedGameData));
            await redis.expire(`game:${gameId}`, 3600);

            await pusherServer.trigger(`game-${gameId}`, "player-joined", {
                players: parsedGameData.players,
                questions: parsedGameData.questions,
                currentQuestion: parsedGameData.currentQuestion,
            });
            console.log("Added second player:", playerId);
        } else {
            playerId = parsedGameData.players[1].id;
            console.log("Second player rejoined:", playerId);
        }

        console.log("Returning game data:", parsedGameData);
        return NextResponse.json({
            topic: parsedGameData.topic,
            players: parsedGameData.players,
            currentQuestion: parsedGameData.currentQuestion,
            questions: parsedGameData.questions,
            playerId: playerId,
        });
    } catch (error) {
        console.error("Error in GET handler:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const { gameId, playerId, answerIndex } = await request.json();
    console.log(`Received PUT request for gameId: ${gameId}, playerId: ${playerId}, answerIndex: ${answerIndex}`);

    try {
        const gameDataRaw = await redis.get(`game:${gameId}`);
        console.log("Raw retrieved game data:", gameDataRaw);

        if (!gameDataRaw) {
            console.log("Game not found");
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        let gameData: GameData;
        if (typeof gameDataRaw === "string") {
            try {
                gameData = JSON.parse(gameDataRaw);
            } catch (e) {
                console.error("Failed to parse game data:", e);
                return NextResponse.json({ error: "Invalid game data" }, { status: 500 });
            }
        } else if (typeof gameDataRaw === "object") {
            gameData = gameDataRaw as GameData;
        } else {
            console.error("Unexpected game data type:", typeof gameDataRaw);
            return NextResponse.json({ error: "Invalid game data" }, { status: 500 });
        }

        const playerIndex = gameData.players.findIndex((p) => p.id === playerId);
        if (playerIndex === -1) {
            console.log("Player not found, adding new player");
            gameData.players.push({ id: playerId, score: 0, answered: false, lastAnswer: null });
        }

        const updatedPlayerIndex = gameData.players.findIndex((p) => p.id === playerId);
        gameData.players[updatedPlayerIndex].answered = true;
        gameData.players[updatedPlayerIndex].lastAnswer = answerIndex;

        if (answerIndex === gameData.questions[gameData.currentQuestion].correctAnswer) {
            gameData.players[updatedPlayerIndex].score += 1;
        }

        await redis.set(`game:${gameId}`, JSON.stringify(gameData));

        await pusherServer.trigger(`game-${gameId}`, "player-answered", {
            players: gameData.players,
            currentQuestion: gameData.currentQuestion,
        });

        return NextResponse.json({
            players: gameData.players,
            currentQuestion: gameData.currentQuestion,
        });
    } catch (error) {
        console.error("Error in PUT handler:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
