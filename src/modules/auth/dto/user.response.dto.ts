export class UserProfileResponseDto {
  name: string;
  avatar?: string;
  bio?: string;
}

export class UserResponseDto {
  userId: string;
  profile: UserProfileResponseDto;
  isActive: boolean;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  settings?: Record<string, any>;
} 