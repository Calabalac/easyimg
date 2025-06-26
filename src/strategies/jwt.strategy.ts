import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services/auth.service';
import { ConfigurationService } from '../services/configuration.service';
import { JwtPayload, AuthUser } from '../interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configurationService: ConfigurationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromExtractors([
          (request) => {
            return request?.cookies?.jwt_token;
          },
        ]),
      ]),
      ignoreExpiration: false,
      secretOrKeyProvider: async (
        request: any,
        rawJwtToken: any,
        done: any,
      ) => {
        try {
          const secret = await configurationService.getJwtSecret();
          done(null, secret);
        } catch (error) {
          const fallbackSecret = 'fallback-jwt-secret-' + Date.now();
          console.warn('Using fallback JWT secret:', error.message);
          done(null, fallbackSecret);
        }
      },
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}
