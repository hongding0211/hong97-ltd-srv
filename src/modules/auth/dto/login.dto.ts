import {
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator'

export enum LoginType {
  LOCAL = 'local',
  PHONE = 'phone',
  OAUTH = 'oauth',
}

export class LocalLoginDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string

  @IsString()
  @MinLength(6)
  password: string
}

export class PhoneLoginDto {
  @IsPhoneNumber()
  phoneNumber: string

  @IsString()
  verificationCode: string
}

export class OAuthLoginDto {
  @IsString()
  provider: string

  @IsString()
  accessToken: string
}

export class LoginDto {
  @IsEnum(LoginType)
  type: LoginType

  @IsObject()
  credentials: LocalLoginDto | PhoneLoginDto | OAuthLoginDto
}
