import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { OAuth2Client } from 'google-auth-library'
import { randomBytes, timingSafeEqual } from 'crypto'
import * as argon2 from 'argon2'
import { Repository } from 'typeorm'
import { User } from '../models/user.entity'
import { type Auth } from './auth.types'

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password'
const ADMIN_SETUP_UNAVAILABLE_MESSAGE = 'Initial administrator setup is unavailable'

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client()
  private readonly dummyPasswordHash = argon2.hash(randomBytes(32).toString('hex'))

  constructor (
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) { }

  public async validateUser (email: string, pass: string): Promise<Partial<User> | null> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.password')
      .addSelect('user')
      .where('email = :email', { email })
      .getOne()

    if (user == null) {
      await argon2.verify(await this.dummyPasswordHash, pass)
      return null
    }

    if (!(await argon2.verify(user.password, pass))) {
      return null
    }

    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  public async login ({ email, password }: Auth.LoginRequest): Promise<Auth.LoginResponse> {
    const user = await this.validateUser(email, password)

    if (
      user == null ||
      user.type === 'banned' ||
      typeof user.id !== 'number' ||
      typeof user.email !== 'string'
    ) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE)
    }

    return {
      user,
      access_token: this.jwtService.sign({
        email: user.email,
        id: user.id
      })
    }
  }

  public async setupFirstAdmin (
    request: Auth.AdminSetupRequest
  ): Promise<Auth.LoginResponse> {
    if (!this.matchesAdminSetupSecret(request.setupSecret)) {
      throw new ForbiddenException(ADMIN_SETUP_UNAVAILABLE_MESSAGE)
    }

    const existingAdmin = await this.usersRepository.findOne({
      where: { type: 'admin' },
      withDeleted: true
    })
    if (existingAdmin != null) {
      throw new ConflictException(ADMIN_SETUP_UNAVAILABLE_MESSAGE)
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: request.email },
      withDeleted: true
    })
    if (existingUser != null) {
      throw new ConflictException(ADMIN_SETUP_UNAVAILABLE_MESSAGE)
    }

    const admin = this.usersRepository.create({
      email: request.email,
      password: await argon2.hash(request.password),
      firstName: request.firstName,
      lastName: request.lastName,
      gender: request.gender,
      type: 'admin'
    })
    const createdAdmin = await this.usersRepository.save(admin)
    const { password, ...user } = createdAdmin

    return {
      user,
      access_token: this.jwtService.sign({
        email: createdAdmin.email,
        id: createdAdmin.id
      })
    }
  }

  async googleLogin (token: string): Promise<Auth.LoginResponse> {
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (clientId == null || clientId.length === 0) {
      throw new UnauthorizedException('Google sign-in is unavailable')
    }

    let payload
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: clientId
      })
      payload = ticket.getPayload()
    } catch {
      throw new UnauthorizedException('Google sign-in failed')
    }

    if (payload?.email == null || payload.email_verified !== true) {
      throw new UnauthorizedException('Google sign-in failed')
    }

    let user = await this.usersRepository.findOneBy({ email: payload.email })
    if (user == null) {
      const nameParts = payload.name?.trim().split(/\s+/) ?? []
      const familyName = nameParts.slice(1).join(' ')
      const generatedPassword = await argon2.hash(randomBytes(32).toString('hex'))
      user = await this.usersRepository.save(this.usersRepository.create({
        email: payload.email,
        firstName: payload.given_name ?? nameParts[0] ?? 'Google',
        lastName: payload.family_name ?? (familyName.length > 0 ? familyName : 'User'),
        gender: 'male',
        password: generatedPassword
      }))
    }

    if (user.type === 'banned') {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE)
    }

    const { password, ...userWithoutPassword } = user
    return {
      user: userWithoutPassword,
      access_token: this.jwtService.sign({
        email: user.email,
        id: user.id
      })
    }
  }

  private matchesAdminSetupSecret (providedSecret: string): boolean {
    const configuredSecret = process.env.ADMIN_SETUP_SECRET
    if (
      configuredSecret == null ||
      Buffer.byteLength(configuredSecret, 'utf8') < 32
    ) {
      return false
    }

    const expected = Buffer.from(configuredSecret, 'utf8')
    const provided = Buffer.from(providedSecret, 'utf8')
    return expected.length === provided.length && timingSafeEqual(expected, provided)
  }
}
