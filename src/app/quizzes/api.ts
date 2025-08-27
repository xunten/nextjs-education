import { api } from "@/lib/api";
import { QuizCard } from "@/types/quiz.type";

export type QuizFilters = {
    page?: number;
    pageSize?: number;
    classId?: number;
    status?: string;
    search?: string;
};

export function buildQueryString(filters: QuizFilters) {
    const qs = new URLSearchParams();
    if (filters.page) qs.set("page", String(filters.page));
    if (filters.pageSize) qs.set("pageSize", String(filters.pageSize));
    if (filters.classId) qs.set("classId", String(filters.classId));
    if (filters.status) qs.set("status", filters.status);
    if (filters.search) qs.set("search", filters.search);
    const s = qs.toString();
    return s ? `?${s}` : "";
}

export function toQuizCard(quiz: any): QuizCard {
    return {
        id: quiz.id,
        title: quiz.title || "Không có tiêu đề",
        description: quiz.description || "Không có mô tả",
        className: quiz.className || "Chưa rõ lớp",
        duration: quiz.timeLimit || 0,
        totalQuestions: quiz.questions?.length || quiz.totalQuestions || 0,
        totalStudents: quiz.totalStudents ?? 0,
        createdAt: quiz.createdAt ?? null,
        dueDate: quiz.endDate ?? quiz.dueDate ?? "",
        subject: quiz.subject ?? "Chưa có môn",
        studentsSubmitted: quiz.studentsSubmitted || 0,
        status: quiz.status ?? "open",
        classID: quiz.classID ?? quiz.classId,
        createBy: quiz.createBy,
        grade: quiz.grade,
    };
}

// endpoints

export async function fetchQuizzes(filters: QuizFilters = {}) {
    const qs = buildQueryString(filters); // tạo query string từ filters
    const data = await api<any>(`/api/quizzes${qs}`);
    return data ?? [];
}
export async function fetchQuizzesByTeacher(teacherId: number, filters: QuizFilters = {}) {
    // Nếu endpoint của bạn là /api/quizzes/teacher/{teacherId}
    const qs = buildQueryString(filters);
    const data = await api<any>(`/api/quizzes/teacher/${teacherId}${qs}`);
    return data ?? [];
}
export async function fetchQuizById(id: number) {
    return api<any>(`/api/quizzes/${id}`);
}

// lib/api.ts
export async function createQuiz(payload: any) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const res = await fetch(`${baseUrl}/api/quizzes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Tạo quiz thất bại");
    }
    return res.json();
}


export async function updateQuiz(id: number, payload: any) {
    return api<any>(`/api/quizzes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deleteQuiz(id: number) {
    return api<void>(`/api/quizzes/${id}`, {
        method: "DELETE",
    });
}
