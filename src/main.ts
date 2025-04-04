import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  // 添加 cookie-parser 中间件
  app.use(cookieParser())

  // 获取配置
  const appConfig = configService.get('app')
  const corsConfig = configService.get('app.cors')

  // 配置 CORS
  if (corsConfig.enabled) {
    app.enableCors({
      origin: corsConfig.origin,
      credentials: true,
    })
  }

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )

  // 启动服务器
  const port = appConfig.port
  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
}
bootstrap()
