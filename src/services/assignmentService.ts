import apiClient from '@/lib/axios';
import { Assignment } from '@/types/assignment';

/**
 * Tạo FormData cho API tạo Assignment
 */
export const createAssignmentFormData = (data: {
  classId: number;
  title: string;
  description?: string;
  dueDate: string; // ISO format: "YYYY-MM-DD"
  maxScore: number;
  file: File;
}): FormData => {
  const formData = new FormData();
  formData.append('classId', String(data.classId));
  formData.append('title', data.title);
  if (data.description) {
    formData.append('description', data.description);
  }
  formData.append('dueDate', data.dueDate.split('T')[0]); 
  formData.append('maxScore', String(data.maxScore));
  formData.append('file', data.file);
  return formData;
};

// ======================== API CALLS ========================

// Lấy tất cả Assignment
export const getAssignments = async (): Promise<Assignment[]> => {
  const response = await apiClient.get<Assignment[]>('/assignments');
  return response.data;
};

// Lấy Assignment theo ID
export const getAssignmentById = async (id: number): Promise<Assignment> => {
  const response = await apiClient.get<Assignment>(`/assignments/${id}`);
  return response.data;
};

// Lấy Assignment theo lớp
export const getAssignmentsByClassId = async (classId: number): Promise<Assignment[]> => {
  const response = await apiClient.get<Assignment[]>(`/assignments/class/${classId}`);
  return response.data;
};

// Tạo Assignment mới
export const createAssignment = async (formData: FormData): Promise<Assignment> => {
  const response = await apiClient.post<Assignment>('/assignments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Cập nhật Assignment
export const updateAssignment = async (
  id: number,
  payload: Partial<Assignment>
): Promise<Assignment> => {
  const response = await apiClient.patch<Assignment>(`/assignments/${id}`, payload);
  return response.data;
};

// Xóa Assignment
export const deleteAssignment = async (id: number): Promise<void> => {
  await apiClient.delete(`/assignments/${id}`);
};

// Tải file Assignment
export const downloadAssignmentFile = async (assignmentId: number): Promise<Blob> => {
  const response = await apiClient.get(`/assignments/${assignmentId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};
