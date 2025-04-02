import { IsEmail, IsString, MinLength, IsPhoneNumber, IsEnum, IsOptional, IsObject, ValidateIf } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export enum LoginType {
  LOCAL = 'local',
  PHONE = 'phone',
  OAUTH = 'oauth'
}

export class LocalLoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @ValidateIf((o) => !o.email && !o.phoneNumber)
  @IsString()
  @MinLength(1)
  dummy?: string;
}

export class PhoneLoginDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  verificationCode: string;
}

export class OAuthLoginDto {
  @IsString()
  provider: string;

  @IsString()
  accessToken: string;
}

export class LoginDto {
  @IsEnum(LoginType)
  type: LoginType;

  @IsObject()
  @ValidateIf((o) => {
    switch (o.type) {
      case LoginType.LOCAL:
        return o.credentials && typeof o.credentials === 'object' && 
               ('email' in o.credentials || 'phoneNumber' in o.credentials) && 
               'password' in o.credentials;
      case LoginType.PHONE:
        return o.credentials && typeof o.credentials === 'object' && 
               'phoneNumber' in o.credentials && 
               'verificationCode' in o.credentials;
      case LoginType.OAUTH:
        return o.credentials && typeof o.credentials === 'object' && 
               'provider' in o.credentials && 
               'accessToken' in o.credentials;
      default:
        return false;
    }
  })
  credentials: LocalLoginDto | PhoneLoginDto | OAuthLoginDto;
} 