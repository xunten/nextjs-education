export interface UserProfileDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  imageUrl?: string;
  roles: string[];
}

export interface UpdateUserProfileRequestDto {
  fullName?: string;
  imageUrl?: string;
  password?: string;
}

export interface ChangePasswordRequestDto {
  oldPassword: string;
  newPassword: string;
}
