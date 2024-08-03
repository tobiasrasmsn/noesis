export interface Player {
    id: string;
    score: number;
    answered: boolean;
    lastAnswer?: number | null;
}

export interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
}

export interface GameData {
    topic: string;
    players: Player[];
    currentQuestion: number;
    questions: Question[];
}
