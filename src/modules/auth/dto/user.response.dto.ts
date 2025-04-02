export class UserProfileResponseDto {
  name: string;
  avatar?: string;
  bio?: string;
}

export class UserResponseDto {
  userId: string;
  profile: UserProfileResponseDto;
  lastLoginAt?: Date;
  settings?: Record<string, any>;
} 