import apiClient from '@/lib/axios';
import { Document } from '@/types/document';

/**
 * Tạo FormData cho API tạo Document
 */
export const createDocumentFormData = (data: {
  classId: number;
  title: string;
  description?: string;
  createdBy: number;
  file?: File;
}): FormData => {
  const formData = new FormData();
  formData.append('classId', String(data.classId));
  formData.append('title', data.title);
  if (data.description) {
    formData.append('description', data.description);
  }
  formData.append('createdBy', String(data.createdBy));
  if (data.file) {
    formData.append('file', data.file);
  }
  return formData;
};

// ======================== API CALLS ========================

/**
 * Lấy tất cả tài liệu theo lớp
 */
export const getDocumentsByClassId = async (
  classId: number
): Promise<Document[]> => {
  const response = await apiClient.get<Document[]>(
    `/materials/class/${classId}`
  );
  return response.data;
};

/**
 * Tạo tài liệu mới
 */
export const createDocument = async ( formData: FormData): Promise<Document> => {
  const response = await apiClient.post<Document>('/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Tăng lượt tải tài liệu
 */
// export const increaseDocumentDownloadCount = async (id: number): Promise<void> => {
//   await apiClient.post(`/materials/${id}/download`);
// };

// export const downloadDocument = async (materialId: number, fileName: string) => {
//   const response = await apiClient.get(`/materials/download/${materialId}`, {
//     responseType: 'blob', // để nhận file nhị phân thay vì text/html
//   });

//   // Tạo URL từ Blob
//   const url = window.URL.createObjectURL(new Blob([response.data]));
//   const link = document.createElement('a');
//   link.href = url;
//   link.setAttribute('download', fileName); // tên file sẽ được lưu
//   document.body.appendChild(link);
//   link.click();
//   link.remove();
//   window.URL.revokeObjectURL(url);
// };

/**
 * Tải tài liệu về máy (vừa tăng lượt tải vừa trả file)
 */
export const downloadDocument = async (id: number) => {
  return apiClient.get(`/materials/download/${id}`, {
    responseType: "blob",
  });
};


