import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "../api/api-client";

export function useQuizzesQuery() {
    return useQuery({
        queryKey: ["quizzes"],
        queryFn: () => apiClient("/api/quizzes"),
    });
}
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
    // thêm các field khác nếu cần như: subject, className,...
}
export function useQuizById(
    id: number,
    role: "student" | "teacher" = "student"
) {
    return useQuery<QuizDetail>({
        queryKey: ["quiz", id, role],
        queryFn: () =>
            apiClient<QuizDetail>(`/api/quizzes/${id}?role=${role}`),
        enabled: !!id,
    });
}
export function useQuizQuestionsPage(
    quizId: number,
    page: number = 1,
    size: number = 10
) {
    return useQuery({
        queryKey: ["quiz", quizId, "questions", page, size],
        queryFn: () =>
            apiClient(`/api/quizzes/${quizId}/questions?page=${page}&size=${size}`),
        placeholderData: keepPreviousData,
        enabled: !!quizId,
    });
}

export function useApproveQuiz() {
    return useMutation({
        mutationFn: async (quizData: any) => {
            const mappedQuestions = quizData.questions.map((q: any) => ({
                questionText: q.question,
                correctOption: q.answer ?? "",
                score: 1,
                options: q.options.map((opt: any) => ({
                    optionLabel: opt.optionLabel,
                    optionText: opt.optionText,
                })),
            }));

            const payload = { ...quizData, questions: mappedQuestions };

            return apiClient("/api/quizzes", {
                method: "POST",
                body: JSON.stringify(payload),
            });
        },
    });
}

export function useUpdateQuizMeta(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) =>
            apiClient(`/api/quizzes/${id}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["quizzes"] });
            qc.invalidateQueries({ queryKey: ["quiz", id] });
        },
    });
}

export function useReplaceQuizContent(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) =>
            apiClient(`/api/quizzes/${id}/content`, {
                method: "PUT",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz", id] }),
    });
}

export function useUpsertQuizContent(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) =>
            apiClient(`/api/quizzes/${id}/content`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz", id] }),
    });
}

export function useDeleteQuizMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            apiClient(`/api/quizzes/${id}`, { method: "DELETE" }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes"] }),
    });
}

export function useDeleteQuizQuestionMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (args: { quizId: number; questionId: number }) =>
            apiClient(`/api/quizzes/${args.quizId}/questions/${args.questionId}`, {
                method: "DELETE",
            }),
        onSuccess: (_, { quizId }) =>
            qc.invalidateQueries({ queryKey: ["quiz", quizId, "questions"] }),
    });
}
