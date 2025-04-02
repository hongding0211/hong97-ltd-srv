import { Injectable, ConflictException, BadRequestException, UnauthorizedException, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, AuthProvider } from '../../schemas/user.schema';
import { LocalRegisterDto, PhoneRegisterDto, OAuthRegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user.response.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LocalLoginDto, PhoneLoginDto, OAuthLoginDto } from './dto/login.dto';
import { LoginType } from './dto/login.dto';
import { RegisterDto, RegisterType } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { type, credentials } = registerDto;

    switch (type) {
      case RegisterType.LOCAL:
        return this.registerWithLocal(credentials as LocalRegisterDto);
      case RegisterType.PHONE:
        return this.registerWithPhone(credentials as PhoneRegisterDto);
      case RegisterType.OAUTH:
        return this.registerWithOAuth(credentials as OAuthRegisterDto);
      default:
        throw new BadRequestException('Invalid register type');
    }
  }

  private async registerWithLocal(credentials: LocalRegisterDto) {
    const { email, phoneNumber, password, profile } = credentials;

    if (!email && !phoneNumber) {
      throw new BadRequestException('Email or phone number is required');
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await this.userModel.findOne({
        'authData.local.email': email,
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // 检查手机号是否已存在
    if (phoneNumber) {
      const existingPhone = await this.userModel.findOne({
        'authData.local.phoneNumber': phoneNumber,
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      userId: uuidv4(),
      profile,
      authProviders: [AuthProvider.LOCAL],
      authData: {
        [AuthProvider.LOCAL]: {
          email,
          phoneNumber,
          passwordHash: hashedPassword,
        },
      },
      isActive: true,
    });

    await user.save();
    return this.mapUserToResponse(user);
  }

  private async registerWithPhone(credentials: PhoneRegisterDto) {
    throw new NotImplementedException('Phone registration is not implemented');
  }

  private async registerWithOAuth(credentials: OAuthRegisterDto) {
    throw new NotImplementedException('OAuth registration is not implemented');
  }

  async login(loginDto: LoginDto) {
    const { type, credentials } = loginDto;

    switch (type) {
      case LoginType.LOCAL:
        return this.loginWithLocal(credentials as LocalLoginDto);
      case LoginType.PHONE:
        return this.loginWithPhone(credentials as PhoneLoginDto);
      case LoginType.OAUTH:
        return this.loginWithOAuth(credentials as OAuthLoginDto);
      default:
        throw new BadRequestException('Invalid login type');
    }
  }

  private mapUserToResponse(user: UserDocument): UserResponseDto {
    if (!user.profile?.name) {
      throw new UnauthorizedException('User profile name is required');
    }

    return {
      userId: user.userId,
      profile: {
        name: user.profile.name,
        avatar: user.profile?.avatar,
        bio: user.profile?.bio,
      },
      lastLoginAt: user.lastLoginAt,
      settings: user.settings,
    };
  }

  private async loginWithLocal(credentials: LocalLoginDto) {
    const { email, phoneNumber, password } = credentials;

    if (!email && !phoneNumber) {
      throw new BadRequestException('Email or phone number is required');
    }

    // 构建查询条件
    const query = email 
      ? { 'authData.local.email': email }
      : { 'authData.local.phoneNumber': phoneNumber };

    const user = await this.userModel.findOne(query);

    if (!user || !user.authData?.local?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.authData.local.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    return this.mapUserToResponse(user);
  }

  private async loginWithPhone(credentials: PhoneLoginDto) {
    throw new NotImplementedException('Phone login is not implemented');
  }

  private async loginWithOAuth(credentials: OAuthLoginDto) {
    throw new NotImplementedException('OAuth login is not implemented');
  }
} 