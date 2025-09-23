// services/dashboard.ts
import apiClient from "@/lib/axios";
import {
  TeacherDashboardResponse,
  StudentDashboardResponse,
  ActivityLogResponseDTO,
} from "@/types/dashboard";
import { useQuery } from "@tanstack/react-query";
export const useTeacherDashboard = (enabled: boolean = true) => {
  return useQuery<TeacherDashboardResponse, Error>({
    queryKey: ["teacher-dashboard"],
    queryFn: fetchTeacherDashboard,
    staleTime: 1000 * 60, // optional: cache 1 phút
  });
};
// Lấy dashboard cho giáo viên
export async function fetchTeacherDashboard(): Promise<TeacherDashboardResponse> {
  const res = await apiClient.get<TeacherDashboardResponse>(
    "/dashboard/teacher"
  );
  return res.data;
}

// Lấy dashboard cho sinh viên
export async function fetchStudentDashboard(): Promise<StudentDashboardResponse> {
  const res = await apiClient.get<StudentDashboardResponse>(
    "/dashboard/student"
  );
  return res.data;
}

export async function fetchActivityClass(
  classId: number
): Promise<ActivityLogResponseDTO[]> {
  const res = await apiClient.get<ActivityLogResponseDTO[]>(
    `/dashboard/class/${classId}`
  );
  return res.data;
}
