import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { getJwtSecret } from './jwt-secret'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor () {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret()
    })
  }

  async validate (
    payload: Record<string, string>
  ): Promise<{ id: string, email: string }> {
    return { id: payload.id, email: payload.email }
  }
}
