/**
 * Types for Request and Respose
 */

import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  MinLength
} from 'class-validator'

import { App } from '../app.types'
import { User } from '../models/user.entity'

export namespace Auth {
  export class LoginRequest {
    @ApiProperty()
    @IsEmail()
      email: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(128)
      password: string
  }

  export class LoginResponse extends App.WithStatus {
    @ApiProperty({ type: User })
      user: User | Partial<User> | null

    @ApiProperty()
      access_token: string
  }

  export class RegisterRequest extends LoginRequest {
    @ApiProperty()
    @IsString()
    @MinLength(12)
    @MaxLength(128)
      password: string

    @Length(2, 50)
    @ApiProperty()
      firstName: string

    @Length(2, 50)
    @ApiProperty()
      lastName: string

    @ApiProperty({ examples: ['male', 'female'] })
    @IsIn(['male', 'female'])
      gender: 'male' | 'female'
  }

  export class AdminSetupRequest {
    @ApiProperty()
    @IsEmail()
      email: string

    @ApiProperty()
    @IsString()
    @MinLength(12)
    @MaxLength(128)
      password: string

    @ApiProperty()
    @IsString()
    @Length(2, 50)
      firstName: string

    @ApiProperty()
    @IsString()
    @Length(2, 50)
      lastName: string

    @ApiProperty({ examples: ['male', 'female'] })
    @IsIn(['male', 'female'])
      gender: 'male' | 'female'

    @ApiProperty()
    @IsString()
    @MinLength(32)
    @MaxLength(256)
      setupSecret: string
  }

  export interface GoogleToken {
    'iss': string
    'nbf': number
    'aud': string
    'sub': string
    'email': string
    'email_verified': boolean
    'azp': string
    'name': string
    'picture': string
    'given_name': string
    'family_name': string
    'iat': number
    'exp': number
    'jti': string
  }
}
