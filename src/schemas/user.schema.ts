import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum AuthProvider {
  LOCAL = 'local',
  GITHUB = 'github',
  GOOGLE = 'google',
  PHONE = 'phone',
}

@Schema({ timestamps: true })
export class UserProfile {
  @Prop()
  name?: string;

  @Prop()
  avatar?: string;

  @Prop()
  birthday?: Date;

  @Prop()
  gender?: string;

  @Prop()
  bio?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop()
  password?: string;

  @Prop({ type: UserProfile })
  profile: UserProfile;

  @Prop({ type: [{ type: String, enum: AuthProvider }] })
  authProviders: AuthProvider[];

  @Prop({ type: Object })
  authData: {
    [AuthProvider.LOCAL]?: {
      email?: string;
      passwordHash?: string;
    };
    [AuthProvider.GITHUB]?: {
      githubId: string;
      accessToken?: string;
    };
    [AuthProvider.GOOGLE]?: {
      googleId: string;
      accessToken?: string;
    };
    [AuthProvider.PHONE]?: {
      phoneNumber: string;
      isVerified: boolean;
      lastVerificationTime?: Date;
    };
  };

  @Prop({ type: [{ type: Types.ObjectId, ref: 'App' }] })
  apps: Types.ObjectId[];

  @Prop({ type: Date, default: null })
  lastLoginAt: Date;

  @Prop({ type: Object })
  settings: {
    emailNotifications?: boolean;
    twoFactorEnabled?: boolean;
    language?: string;
    timezone?: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User); 