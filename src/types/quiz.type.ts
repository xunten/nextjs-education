export type Quiz = {
    id: number;
    title: string;
    description?: string;
    totalQuestions: number;
    classId?: number;
    createdAt: string;
};

export type Question = {
    questionText: string;
    questionType: string
    options: Option[];
    correctOption: string | null;
    score: null;
    explanation?: string | null;
    correctAnswerTexts: null;
    correctAnswerRegex: null;
    caseSensitive: boolean;
    trimWhitespace: boolean;
};
export type Option = {
    optionLabel: string;
    optionText: string;
};
export type QuizzFormData = {
    title: string;
    startDate: string;
    endDate: string;
    classId?: number;
    createdBy?: number;
    timeLimit: string;
    description: string;
    fileName?: string;
    questions: Question[];
};
export type QuizzFormDatas = {
    title: string;
    startDate: string;
    endDate: string;
    classId?: number;
    timeLimit: string;
    description: string;
    questions: Question[];
};
export interface QuizCard {
    id: number;
    title: string;
    className: string;
    description: string;
    duration: number;
    totalQuestions: number;
    totalStudents: number;
    status: string;
    dueDate: string;
    grade?: string;
    createBy?: number;
    classID?: number;
    subject: string;
    studentsSubmitted: number;
    createdAt?: string;
}
export interface AiQuizSettings {
    numQuestions?: number;
    quizTitle?: string;
    language?: string;
    questionType?: string;
    difficulty?: string;
    studyMode?: string;
    userPrompt?: string;
}


export interface BackendQuizResponse {
    quizTitle: string;
    questions: Array<{
        questionText: string;
        options: Option[];
        correctIndex: number;
        explanation?: string;
        topic?: string;
        difficulty?: 'easy' | 'medium' | 'hard';
    }>;
}

