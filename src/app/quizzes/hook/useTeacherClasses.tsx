import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/api-client";

export function useTeacherClasses(teacherId: number | null) {
  return useQuery({
    queryKey: ["teacher-classes", teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      return apiClient<any[]>(`/api/auth/classes/teachers/${teacherId}`);
    },
    enabled: !!teacherId, // chỉ chạy khi có teacherId
    staleTime: 5 * 60 * 1000, // cache 5 phút
  });
}
