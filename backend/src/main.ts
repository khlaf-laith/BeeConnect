import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { GlobalErrorFilter } from './chat/exception.filter'
import { ValidationPipe } from '@nestjs/common'
import * as express from 'express'
import { rateLimit } from 'express-rate-limit'
import { join, resolve } from 'path'
// import { ValidationPipe } from '@nestjs/common'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule)
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
  const uploadDirectory = resolve(
    process.env.UPLOAD_DIRECTORY ?? join(__dirname, '..', 'uploads')
  )
  app.use('/uploads', express.static(uploadDirectory))
  process.env.NODE_ENV !== 'development'
    ? app.enableCors({
      origin: allowedOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204
    })
    : app.enableCors()

  app.use('/auth/login', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: 'Too many sign-in attempts. Please try again later.'
    }
  }))
  app.use('/auth/register', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: 'Too many registration attempts. Please try again later.'
    }
  }))
  app.use('/auth/google/redirect', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: 'Too many sign-in attempts. Please try again later.'
    }
  }))
  app.use('/auth/admin/setup', rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: 'Too many setup attempts. Please try again later.'
    }
  }))

  const config = new DocumentBuilder()
    .setTitle(`${process.env.APP_NAME ?? 'BeeConnect'} API`)
    .setDescription(
      `The ${process.env.APP_NAME ?? 'BeeConnect'} API description`
    )
    .setVersion(process.env.APP_VERSION ?? 'dev')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  app.useGlobalFilters(new GlobalErrorFilter())

  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.APP_PORT ?? 8080)
}
void bootstrap()
