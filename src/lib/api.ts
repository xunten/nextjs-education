// lib/api/quiz-api.ts - Updated with better error handling and debugging

import { AiQuizSettings, BackendQuizResponse, QuizzFormData } from "@/types/quiz.type";
import { useQuizzStorage } from "./store/useQuizzStorage";
import { mapBackendToFormData } from "@/untils/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';




export async function callGenerateAPI(params: {
    file: File;
    settings: AiQuizSettings;
    token?: string;
}): Promise<void> {
    const { file, settings, token } = params;

    // Debug logs
    // console.log('Calling API with:', {
    //     fileName: file.name,
    //     fileSize: file.size,
    //     fileType: file.type,
    //     settings,
    //     apiUrl: `${API_BASE}/api/ai/quiz/generate-from-file`
    // });

    // Tạo FormData
    const form = new FormData();
    form.append("file", file);
    form.append("settings", new Blob([JSON.stringify(settings)], {
        type: "application/json"
    }));

    try {
        const fullUrl = `${API_BASE}/api/ai/quiz/generate-from-file`;
        const res = await fetch(fullUrl, {
            method: "POST",
            body: form,
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {},
        });

        console.log('Response status:', res.status);
        console.log('Response headers:', Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
            const contentType = res.headers.get('content-type');

            let errorMessage = `HTTP ${res.status}: ${res.statusText}`;

            try {
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } else {
                    const textResponse = await res.text();
                    console.log('Error response body:', textResponse.substring(0, 500));

                    if (textResponse.includes('<!DOCTYPE')) {
                        const titleMatch = textResponse.match(/<title>(.*?)<\/title>/i);
                        errorMessage = titleMatch ? titleMatch[1] : 'Server returned HTML error page';
                    } else {
                        errorMessage = textResponse || errorMessage;
                    }
                }
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
            }

            throw new Error(errorMessage);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await res.text();
            console.error('Expected JSON but got:', contentType, textResponse.substring(0, 200));
            throw new Error('Server did not return JSON response');
        }

        const backendResponse: BackendQuizResponse = await res.json();
        console.log('backendResponse :', backendResponse);

        const { questions, ...rest } = mapBackendToFormData(backendResponse);
        console.log('questions :', questions);

        useQuizzStorage.getState().setData({
            ...useQuizzStorage.getState().data,
            questions
        });



    } catch (error) {
        console.error('API call failed:', error);

        // Enhance error message for common issues
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error(`Cannot connect to server at ${API_BASE}. Please check if the backend is running.`);
        }

        throw error;
    }
}


export async function testAPIConnection(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/actuator/health`, {
            method: 'GET',
        });
        return response.ok;
    } catch {
        return false;
    }
}

type ApiOptions = RequestInit & { asText?: boolean };

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    // ⬇️ Tự động thêm token nếu chưa có Authorization
    if (!headers["Authorization"] && typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        credentials: "include", // hoặc "same-origin" nếu không dùng cookie
        ...options,
        headers,
    });

    if (!res.ok) {
        const contentType = res.headers.get('content-type');
        let errorMessage = `HTTP ${res.status}: ${res.statusText}`;

        try {
            if (contentType?.includes('application/json')) {
                const errorData = await res.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } else {
                const textResponse = await res.text();
                errorMessage = textResponse || errorMessage;
            }
        } catch { }

        throw new Error(errorMessage);
    }

    if (options.asText) return (await res.text()) as T;
    if (res.status === 204) return null as T;

    return (await res.json()) as T;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'text/markdown'
    ];

    if (file.size > maxSize) {
        return { valid: false, error: "File quá lớn. Tối đa 10MB." };
    }

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc|txt|md)$/i)) {
        return { valid: false, error: "Định dạng file không được hỗ trợ." };
    }

    return { valid: true };
}

export type { BackendQuizResponse };