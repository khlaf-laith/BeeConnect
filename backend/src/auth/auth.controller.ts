import { Body, ConflictException, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { ConnectionsService } from '../users/connections/connections.service'
import { User } from '../models/user.entity'
import { UsersService } from '../users/users.service'
import { AuthUser, BearerPayload } from '../util/util'
import { AuthService } from './auth.service'
import { Auth } from './auth.types'
import { JwtAuthGuard } from './jwt-auth.guard'

export class TokenDto {
  @IsNotEmpty()
  @IsString()
    token: string
}

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor (
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly connectionsService: ConnectionsService
  ) { }

  // login endpoint for user
  @Post('login')
  @ApiResponse({ type: Auth.LoginResponse })
  public async login (@Body() body: Auth.LoginRequest): Promise<Auth.LoginResponse> {
    return await this.authService.login(body)
  }

  // register and then login endpoint for user
  @Post('register')
  @ApiResponse({ type: Auth.LoginResponse })
  public async register (@Body() body: Auth.RegisterRequest): Promise<Auth.LoginResponse> {
    const existingUser = await this.userService.findOneByEmail(body.email)
    if (existingUser != null) {
      throw new ConflictException('Unable to register with the provided details')
    }

    await this.userService.create(body)
    return await this.authService.login(body)
  }

  @Post('admin/setup')
  @ApiResponse({ type: Auth.LoginResponse })
  public async setupFirstAdmin (
    @Body() body: Auth.AdminSetupRequest
  ): Promise<Auth.LoginResponse> {
    return await this.authService.setupFirstAdmin(body)
  }

  @Post('google/redirect')
  // @UseGuards(AuthGuard('google'))
  async googleAuthRedirect (@Body() tokenDto: TokenDto): Promise<Auth.LoginResponse> {
    const { token } = tokenDto
    return await this.authService.googleLogin(token)
  }

  // get user info endpoint
  @Get('me')
  @ApiResponse({ type: User })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  public async me (@AuthUser() authedUser: BearerPayload): Promise<User> {
    const user: User = (await authedUser.getUser([
      'educations',
      'workExperiences',
      'volunteeringExperience',
      'skills',
      'recommendationsReceived',
      'recommendationsGiven',
      'courses',
      'projects',
      'awards',
      'languages'
    ])) as User

    return user
  }
}
