import apiClient from "@/lib/axios";
import {
  UserProfileDto,
  UpdateUserProfileRequestDto,
  ChangePasswordRequestDto,
} from "@/types/profile";

// Khai báo interface backend trả về
interface UserProfileApiResponse {
  id: number;
  username: string;
  email: string;
  full_name: string;
  image_url?: string;
  roles: { id: number; name: string }[];
}

// Map từ backend -> frontend
function mapUserApiToDto(data: UserProfileApiResponse): UserProfileDto {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    fullName: data.full_name,
    imageUrl: data.image_url,
    roles: data.roles.map((r) => r.name),
  };
}

// Fetch profile
export async function fetchProfile(): Promise<UserProfileDto> {
  const res = await apiClient.get<UserProfileApiResponse>("/profile/me");
  return mapUserApiToDto(res.data);
}

// Update profile
export async function updateProfile(
  payload: UpdateUserProfileRequestDto
): Promise<UserProfileDto> {
  const res = await apiClient.patch<UserProfileApiResponse>(
    "/profile",
    payload
  );
  return mapUserApiToDto(res.data);
}

// Upload avatar
export async function uploadAvatar(file: File): Promise<UserProfileDto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64 = reader.result as string;

        // Gọi API backend
        const res = await apiClient.post<UserProfileDto>("/profile/avatar", {
          imageUrl: base64,
        });

        resolve(res.data); // Trả về UserProfileDto
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file); // chuyển file sang Base64
  });
}

// Đổi mật khẩu
export async function changePassword(
  payload: ChangePasswordRequestDto
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>(
    "/profile/change-password",
    payload
  );
  return res.data;
}
