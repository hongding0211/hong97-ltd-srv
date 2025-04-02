import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { AuthProvider, User, UserDocument } from '../../schemas/user.schema'
import { UserService } from '../user/user.service'
import { LoginDto } from './dto/login.dto'
import { LocalLoginDto, OAuthLoginDto, PhoneLoginDto } from './dto/login.dto'
import { LoginType } from './dto/login.dto'
import {
  LocalRegisterDto,
  OAuthRegisterDto,
  PhoneRegisterDto,
} from './dto/register.dto'
import { RegisterDto, RegisterType } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { type, credentials } = registerDto

    switch (type) {
      case RegisterType.LOCAL:
        return this.registerWithLocal(credentials as LocalRegisterDto)
      case RegisterType.PHONE:
        return this.registerWithPhone(credentials as PhoneRegisterDto)
      case RegisterType.OAUTH:
        return this.registerWithOAuth(credentials as OAuthRegisterDto)
      default:
        throw new BadRequestException('Invalid register type')
    }
  }

  private async registerWithLocal(credentials: LocalRegisterDto) {
    const { email, phoneNumber, password, profile } = credentials

    if (!email && !phoneNumber) {
      throw new BadRequestException('Email or phone number is required')
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await this.userModel.findOne({
        'authData.local.email': email,
      })
      if (existingEmail) {
        throw new ConflictException('Email already exists')
      }
    }

    // 检查手机号是否已存在
    if (phoneNumber) {
      const existingPhone = await this.userModel.findOne({
        'authData.local.phoneNumber': phoneNumber,
      })
      if (existingPhone) {
        throw new ConflictException('Phone number already exists')
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
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
    })

    await user.save()
    return this.userService.mapUserToResponse(user)
  }

  private async registerWithPhone(_credentials: PhoneRegisterDto) {
    throw new NotImplementedException('Phone registration is not implemented')
  }

  private async registerWithOAuth(_credentials: OAuthRegisterDto) {
    throw new NotImplementedException('OAuth registration is not implemented')
  }

  async login(loginDto: LoginDto) {
    const { type, credentials } = loginDto

    switch (type) {
      case LoginType.LOCAL:
        return this.loginWithLocal(credentials as LocalLoginDto)
      case LoginType.PHONE:
        return this.loginWithPhone(credentials as PhoneLoginDto)
      case LoginType.OAUTH:
        return this.loginWithOAuth(credentials as OAuthLoginDto)
      default:
        throw new BadRequestException('Invalid login type')
    }
  }

  private async generateTokens(user: UserDocument): Promise<string> {
    if (!user.userId) {
      throw new UnauthorizedException('User ID not found')
    }

    const payload = { sub: user.userId }
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<number>('auth.jwt.expiresIn'),
    })

    return accessToken
  }

  private async loginWithLocal(credentials: LocalLoginDto) {
    const { email, phoneNumber, password } = credentials

    if (!email && !phoneNumber) {
      throw new BadRequestException('Email or phone number is required')
    }

    // 构建查询条件
    const query = email
      ? { 'authData.local.email': email }
      : { 'authData.local.phoneNumber': phoneNumber }

    const user = await this.userModel.findOne(query)

    if (!user || !user.authData?.local?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.authData.local.passwordHash,
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date()
    await user.save()

    return {
      token: await this.generateTokens(user),
    }
  }

  private async loginWithPhone(_: PhoneLoginDto) {
    throw new NotImplementedException('Phone login is not implemented')
  }

  private async loginWithOAuth(_: OAuthLoginDto) {
    throw new NotImplementedException('OAuth login is not implemented')
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }

  async info(userId: string) {
    const user = await this.userModel.findOne({ userId })
    if (!user) {
      throw new UnauthorizedException('User not found')
    }
    return this.userService.mapUserToResponse(user)
  }

  async refreshToken(userId: string) {
    const user = await this.userModel.findOne({ userId })
    if (!user) {
      throw new UnauthorizedException('User not found')
    }
    return {
      token: await this.generateTokens(user),
    }
  }
}
