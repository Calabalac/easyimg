import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { ConfigurationModule } from './configuration.module';
import { ConfigurationService } from '../services/configuration.service';
import { SupabaseModule } from './supabase.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      useFactory: async (configurationService: ConfigurationService) => {
        try {
          const secret = await configurationService.getJwtSecret();
          return {
            secret,
            signOptions: {
              expiresIn: '7d',
            },
          };
        } catch (error) {
          console.warn(
            'Failed to get JWT secret from configuration, using fallback:',
            error.message,
          );
          return {
            secret: 'fallback-jwt-secret-' + Date.now(),
            signOptions: {
              expiresIn: '7d',
            },
          };
        }
      },
      inject: [ConfigurationService],
    }),
    ConfigurationModule,
    SupabaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
