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

// ==== Queries ====
export function useQuizzesQuery() {

  return useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
       const res = await apiClient.get<ApiResp<any[]>>("api/quizzes");
      if (!res.success) {
        const error: any = new Error(
          res.message || "Lỗi khi tải danh sách quiz"
        );
        error.response = { data: res };
        throw error;
      }
      return res.data;
    },
  });

}

export function useQuiz(id: string | number | undefined) {

  return useQuery({
    queryKey: ["quiz", String(id)],
    enabled: !!id,
    staleTime: 60_000,
    queryFn: async () => {
      if (!id) throw new Error("ID bài quiz không hợp lệ");
   const res = await apiClient.get<ApiResp<QuizDetail>>(`api/quizzes/${id}`);
      if (!res.success) {
        const error: any = new Error(
          res.message || "Lỗi khi tải chi tiết quiz"
        );
        error.response = { data: res };
        throw error;
      }
      return res.data;
    },
    retry: (failureCount, error: any) => {
      const isNetworkError = !error?.response;
      return isNetworkError && failureCount < 1;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}

export function useQuizById(
  id: number,
  role: "student" | "teacher" = "student"
) {
  return useQuery<QuizDetail>({
    queryKey: ["quiz", id, role],
    queryFn: async () => {
      const res = await apiClient.get<ApiResp<QuizDetail>>(`api/quizzes/${id}?role=${role}`);
      if (!res.success) {
        const error: any = new Error(res.message || "Lỗi khi tải quiz theo ID");
        error.response = { data: res };
        throw error;
      }
      return res.data;
    },
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
    queryFn: async () => {
      const res = await apiClient.get<ApiResp<any>>(
        `api/quizzes/${quizId}/questions?page=${page}&size=${size}`
      );
      if (!res.success) {
        const error: any = new Error(res.message || "Lỗi khi tải câu hỏi quiz");
        error.response = { data: res };
        throw error;
      }
      return res.data;
    },
    placeholderData: keepPreviousData,
    enabled: !!quizId,
  });
}



// ==== Mutations ====
export function useApproveQuiz() {
  return useMutation({
    mutationFn: async (quizData: any) => {
                const res = await apiClient.post<ApiResp<any>>("api/quizzes", quizData);
      if (!res.success) {
        const error: any = new Error(res.message || "Lỗi khi duyệt quiz");
        error.response = { data: res };
        throw error;
      }
      return res.data;
    },
  });
}
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
      const res = await apiClient.patch<ApiResp<any>>(
        `api/quizzes/${id}`,
        payload
      );
      if (!res.success) {
        const error: any = new Error(
          res.message || "Lỗi khi cập nhật thông tin quiz"
        );
        error.response = { data: res };
        throw error;
      }
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
      const res = await apiClient.put<ApiResp<any>>(
        `api/quizzes/${id}/content`,
        payload
      );
      if (!res.success) {
        const error: any = new Error(
          res.message || "Lỗi khi thay thế nội dung quiz"
        );
        error.response = { data: res };
        throw error;
      }
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz", id] }),
  });
}

export function useUpsertQuizContent(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.patch<ApiResp<any>>(
        `api/quizzes/${id}/content`,
        payload
      );
      if (!res.success) {
        const error: any = new Error(
          res.message || "Lỗi khi cập nhật nội dung quiz"
        );
        error.response = { data: res };
        throw error;
      }
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz", id] }),
  });
}

// export function useDeleteQuizMutation() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: async (id: number) => {
//       const res = await apiClient.delete<ApiResp<any>>(`/quizzes/${id}`);
//       if (!res.success) {
//         const error: any = new Error(res.message || "Lỗi khi xóa quiz");
//         error.response = { data: res };
//         throw error;
//       }
//       return res.data;
//     },
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes"] }),
//   });
// }

// export function useDeleteQuizQuestionMutation() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: async (args: { quizId: number; questionId: number }) => {
//       const res = await apiClient.delete<ApiResp<any>>(
//         `/quizzes/${args.quizId}/questions/${args.questionId}`
//       );
//       if (!res.success) {
//         const error: any = new Error(res.message || "Lỗi khi xóa câu hỏi quiz");
//         error.response = { data: res };
//         throw error;
//       }
//       return res.data;
//     },
//     onSuccess: (_, { quizId }) =>
//       qc.invalidateQueries({ queryKey: ["quiz", quizId, "questions"] }),
//   });
// }

// utils/api-error.ts
export function extractApiError(error: any): string {
  // Nếu backend trả về { messages: ["Lỗi 1", "Lỗi 2"] }
  if (error?.response?.data?.messages?.length) {
    return error.response.data.messages.join("\n"); // nối tất cả lỗi
  }

  // Nếu backend trả về { message: "Lỗi gì đó" }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // fallback
  if (error?.message) return error.message;

  return "Đã xảy ra lỗi không xác định";
}



