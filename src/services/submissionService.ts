import apiClient from '@/lib/axios';
import { Submission } from '@/types/assignment';

/**
 * Tạo FormData để nộp bài
 */
export const createSubmissionFormData = (data: {
  assignmentId: number;
  studentId: number;
  file?: File;
}): FormData => {
  const formData = new FormData();
  formData.append('assignmentId', String(data.assignmentId));
  formData.append('studentId', String(data.studentId));
  if (data.file) {
    formData.append('file', data.file);
  }
  return formData;
};

// ======================== API CALLS ========================

// Lấy tất cả submissions
export const getAllSubmissions = async (): Promise<Submission[]> => {
  const response = await apiClient.get<Submission[]>('/submissions');
  return response.data;
};

// Nộp bài
export const submitAssignment = async (formData: FormData): Promise<Submission> => {
  const response = await apiClient.post<Submission>('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Chấm điểm submission
export const gradeSubmission = async (
  submissionId: number,
  payload: { score: number; comment?: string }
): Promise<Submission> => {
  const response = await apiClient.patch<Submission>(
    `/submissions/${submissionId}/grade`,
    payload
  );
  return response.data;
};

export const updateSubmissionGrade = async (submissionId: number, score: number, teacherComment: string): Promise<Submission> => {
  try {
    const response = await fetch(`/api/submissions/${submissionId}/grade`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ score, teacherComment }),
    })
    if (!response.ok) {
      throw new Error("Failed to update submission grade")
    }
    return await response.json()
  } catch (error) {
    console.error("Error updating submission grade:", error)
    throw error
  }
}

// Lấy submissions theo assignment
export const getSubmissionsByAssignment = async (
  assignmentId: number
): Promise<Submission[]> => {
  const response = await apiClient.get<Submission[]>(`/submissions/assignment/${assignmentId}`);
  return response.data;
};

// Lấy submissions theo học sinh
export const getSubmissionsByStudent = async (
  studentId: number
): Promise<Submission[]> => {
  const response = await apiClient.get<Submission[]>(`/submissions/student/${studentId}`);
  return response.data;
};

// Lấy submission duy nhất của học sinh cho 1 assignment
export const getSubmissionByAssignmentAndStudent = async (
  assignmentId: number,
  studentId: number
): Promise<Submission> => {
  const response = await apiClient.get<Submission>(
    `/submissions/assignment/${assignmentId}/student/${studentId}`
  );
  return response.data;
};

// Lấy submissions theo lớp
export const getSubmissionsByClassId = async (classId: number): Promise<Submission[]> => {
  const response = await apiClient.get<Submission[]>(`/submissions/class/${classId}`);
  return response.data;
};

// Tải file submission
export const downloadSubmissionFile = async (submissionId: number): Promise<Blob> => {
  const response = await apiClient.get(`/submissions/${submissionId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

// Xóa submission
export const deleteSubmission = async (submissionId: number): Promise<void> => {
  await apiClient.delete(`/submissions/${submissionId}`);
};
