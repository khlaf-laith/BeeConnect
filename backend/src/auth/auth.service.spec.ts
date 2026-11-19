import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { Repository } from 'typeorm'
import { User } from '../models/user.entity'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  const passwordHash = '$argon2id$v=19$m=65536,t=3,p=4$BSSdSR/bWwEtdxRgCtFB2w$GuVOU23vhrL9xbzlRFOKd+N7pyhlFVOItnGHXs7MoO4'
  const savedUser = {
    id: 1,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    gender: 'female' as const,
    type: 'admin' as const,
    password: passwordHash
  }
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn()
  }
  const repository = {
    createQueryBuilder: jest.fn(() => queryBuilder),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn((user: Partial<User>) => ({ ...user })),
    save: jest.fn()
  }
  const jwtService = {
    sign: jest.fn(() => 'signed-access-token')
  }
  let service: AuthService
  const originalSetupSecret = process.env.ADMIN_SETUP_SECRET

  beforeEach(() => {
    jest.clearAllMocks()
    service = new AuthService(
      jwtService as unknown as JwtService,
      repository as unknown as Repository<User>
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
    if (originalSetupSecret == null) {
      delete process.env.ADMIN_SETUP_SECRET
    } else {
      process.env.ADMIN_SETUP_SECRET = originalSetupSecret
    }
  })

  it('validates a password and omits the stored hash', async () => {
    queryBuilder.getOne.mockResolvedValue(savedUser)
    jest.spyOn(argon2, 'verify').mockResolvedValue(true)

    await expect(service.validateUser(savedUser.email, 'password'))
      .resolves.toEqual({
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        gender: savedUser.gender,
        type: savedUser.type
      })
  })

  it('returns the same generic error for unknown emails and incorrect passwords', async () => {
    const verify = jest.spyOn(argon2, 'verify').mockResolvedValue(false)
    queryBuilder.getOne.mockResolvedValue(null)
    await expect(service.login({ email: 'missing@example.com', password: 'bad-password' }))
      .rejects.toThrow(new UnauthorizedException('Invalid email or password'))

    queryBuilder.getOne.mockResolvedValue(savedUser)
    await expect(service.login({ email: savedUser.email, password: 'bad-password' }))
      .rejects.toThrow(new UnauthorizedException('Invalid email or password'))
    expect(verify).toHaveBeenCalledTimes(2)
  })

  it('signs in admins with an access token', async () => {
    queryBuilder.getOne.mockResolvedValue(savedUser)
    jest.spyOn(argon2, 'verify').mockResolvedValue(true)

    await expect(service.login({ email: savedUser.email, password: 'password' }))
      .resolves.toMatchObject({
        user: { type: 'admin' },
        access_token: 'signed-access-token'
      })
  })

  it('rejects admin setup when the secret is invalid', async () => {
    process.env.ADMIN_SETUP_SECRET = 'a'.repeat(32)

    await expect(service.setupFirstAdmin({
      email: 'new-admin@example.com',
      password: 'strong-password-123',
      firstName: 'New',
      lastName: 'Admin',
      gender: 'female',
      setupSecret: 'b'.repeat(32)
    })).rejects.toThrow(ForbiddenException)
    expect(repository.save).not.toHaveBeenCalled()
  })

  it('does not allow setup after an admin already exists', async () => {
    process.env.ADMIN_SETUP_SECRET = 'a'.repeat(32)
    repository.findOne.mockResolvedValue(savedUser)

    await expect(service.setupFirstAdmin({
      email: 'new-admin@example.com',
      password: 'strong-password-123',
      firstName: 'New',
      lastName: 'Admin',
      gender: 'female',
      setupSecret: 'a'.repeat(32)
    })).rejects.toThrow(ConflictException)
    expect(repository.save).not.toHaveBeenCalled()
  })

  it('does not reuse an email that belongs to another account', async () => {
    process.env.ADMIN_SETUP_SECRET = 'a'.repeat(32)
    repository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...savedUser, type: 'user' })

    await expect(service.setupFirstAdmin({
      email: 'admin@example.com',
      password: 'strong-password-123',
      firstName: 'New',
      lastName: 'Admin',
      gender: 'female',
      setupSecret: 'a'.repeat(32)
    })).rejects.toThrow(ConflictException)
    expect(repository.save).not.toHaveBeenCalled()
  })

  it('creates a password-free admin response after one-time setup', async () => {
    process.env.ADMIN_SETUP_SECRET = 'a'.repeat(32)
    const createdAdmin = { ...savedUser, id: 2 }
    repository.findOne.mockResolvedValue(null)
    repository.create.mockReturnValue(createdAdmin)
    repository.save.mockResolvedValue(createdAdmin)
    jest.spyOn(argon2, 'hash').mockResolvedValue(passwordHash)

    const response = await service.setupFirstAdmin({
      email: 'new-admin@example.com',
      password: 'strong-password-123',
      firstName: 'New',
      lastName: 'Admin',
      gender: 'female',
      setupSecret: 'a'.repeat(32)
    })

    expect(response.user?.type).toBe('admin')
    expect(response.user).not.toHaveProperty('password')
    expect(response).toHaveProperty('access_token', 'signed-access-token')
  })
})
