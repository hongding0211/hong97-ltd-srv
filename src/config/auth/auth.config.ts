import { registerAs } from '@nestjs/config'

export default registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || 30 * 24 * 60 * 60,
  },
  ignore: ['/auth/login', '/auth/register'],
}))
