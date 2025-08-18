// services/auth.ts
import apiClient from "@/lib/axios";
import {
  RegisterRequestDto,
  RegisterResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  SelectRoleRequest,
} from "../types/auth";

const API_BASE = "/auth";

export const authService = {
  register: async (data: RegisterRequestDto): Promise<RegisterResponseDto> => {
    const response = await apiClient.post<RegisterResponseDto>(
      `${API_BASE}/register`,
      data
    );
    return response.data;
  },

  login: async (data: LoginRequestDto): Promise<LoginResponseDto> => {
    const response = await apiClient.post<LoginResponseDto>(
      `${API_BASE}/login`,
      data
    );
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post(`${API_BASE}/logout`);
    return response.data;
  },

  googleLoginWithCredential: async (credential?: string) => {
    const response = await apiClient.post(
      `${API_BASE}/google-login-with-credential`,
      {
        credential,
      }
    );
    return response.data;
  },

  selectRole: async (data: SelectRoleRequest): Promise<LoginResponseDto> => {
    const payload = {
      ...data,
      userId: Number(data.userId),
    };

    const response = await apiClient.post<LoginResponseDto>(
      `${API_BASE}/select-role`,
      payload
    );
    return response.data;
  },
};
