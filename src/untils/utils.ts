import { BackendQuizResponse, QuizzFormData } from "@/types/quiz.type";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { jwtDecode } from "jwt-decode";

export function cn(...inputs: ClassValue[]) {

  return twMerge(clsx(inputs))
}

export function mapBackendToFormData(apiData: BackendQuizResponse): QuizzFormData {

  return {
    title: apiData.quizTitle || "",
    grade: "",
    subject: "",
    startDate: "",
    endDate: "",
    timeLimit: "",
    description: "",

    questions: apiData.questions.map((q) => ({
      question: q.questionText,
      options: q.options.map((opt, idx) => ({
        optionLabel: String.fromCharCode(65 + idx), // A, B, C, D
        optionText: opt.replace(/^[A-D]\.\s*/, "").trim(), // Bỏ tiền tố "A. "
      })),
      answer: String.fromCharCode(65 + q.correctIndex),
      explanation: q.explanation,
      topic: q.topic,
      difficulty: q.difficulty,
    })),
  };
}


interface JwtPayload {
  id: number;
  sub: string;
  roles: { name: string; id: number }[];
}

export function getCurrentUserId(): number | null {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const payload: JwtPayload = jwtDecode(token);
    return payload.id;
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}
