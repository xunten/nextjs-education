// src/hooks/quiz-hooks.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { ApiResp } from "@/lib/type";

// ==== Types ====
export interface QuizQuestion {
    id: number;
    questionText: string;
    options: string[];
    correctIndex?: number;
}

export interface QuizDetail {
    id: number;
    title: string;
    timeLimit: number;
    questions: QuizQuestion[];
    subject?: string;
    className?: string;
}


export function useQuizzesQuery() {
    return useQuery({
        queryKey: ["quizzes"],
        queryFn: async () => {
            const res = await apiClient.get<ApiResp<any[]>>("api/quizzes");
            return res.data; // unwrap data
        },
    });
}
export function useQuiz(id: string | number | undefined) {
    return useQuery({
        queryKey: ["quiz", String(id)], // cố định kiểu để tránh key thay đổi
        enabled: !!id,
        staleTime: 60_000,
        queryFn: async () => {
            if (!id) throw new Error("ID bài quiz không hợp lệ");
            const res = await apiClient.get<ApiResp<QuizDetail>>(`api/quizzes/${id}`);
            if (!res.success || !res.data) throw new Error(res.message || "Không có dữ liệu bài quiz");
            return res.data;
        },
        retry: (failureCount, error: any) => {
            const isNetworkError = !error?.response;
            return isNetworkError && failureCount < 1;
        },
        retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: true,
    });
}


export function extractApiError(error: any): string {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    if (error?.message) {
        return error.message;
    }

    return "Đã xảy ra lỗi không xác định";
}


export function useQuizById(id: number, role: "student" | "teacher" = "student") {
    return useQuery<QuizDetail>({
        queryKey: ["quiz", id, role],
        queryFn: async () => {
            const res = await apiClient.get<ApiResp<QuizDetail>>(`api/quizzes/${id}?role=${role}`);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useQuizQuestionsPage(quizId: number, page: number = 1, size: number = 10) {
    return useQuery({
        queryKey: ["quiz", quizId, "questions", page, size],
        queryFn: async () => {
            const res = await apiClient.get<ApiResp<any>>(
                `api/quizzes/${quizId}/questions?page=${page}&size=${size}`
            );
            return res.data;
        },
        placeholderData: keepPreviousData,
        enabled: !!quizId,
    });
}

export function useApproveQuiz() {
    return useMutation({
        mutationFn: async (quizData: any) => {
            const res = await apiClient.post<ApiResp<any>>("api/quizzes", quizData);
            return res.data;
        },
    });
}
//ĐÂY
export function useCreateQuiz() {
    return useMutation({
        mutationFn: async (quizData: any) => {
            const res = await apiClient.post<ApiResp<any>>("api/quizzes", quizData);
            return res.data;
        },
    });
}

export function useUpdateQuizMeta(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await apiClient.patch<ApiResp<any>>(`api/quizzes/${id}`, payload);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["quizzes"] });
            qc.invalidateQueries({ queryKey: ["quiz", id] });
        },
    });
}

export function useReplaceQuizContent(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await apiClient.put<ApiResp<any>>(`api/quizzes/${id}/content`, payload);
            return res.data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz", id] }),
    });
}

export function useUpsertQuizContent(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await apiClient.patch<ApiResp<any>>(`api/quizzes/${id}/content`, payload);
            return res.data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz", id] }),
    });
}

