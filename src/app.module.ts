import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// import * as cookieParser from 'cookie-parser';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtCookieMiddleware } from './middleware/jwt-cookie.middleware';
import { DynamicRateLimitMiddleware } from './middleware/dynamic-rate-limit.middleware';
import { MenuMiddleware } from './middleware/menu.middleware';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { ConfigurationModule } from './modules/configuration.module';
import { AuthModule } from './modules/auth.module';
import { ImageModule } from './modules/image.module';
import { SubscriptionModule } from './modules/subscription.module';
import { AdminModule } from './modules/admin.module';
import { SupabaseModule } from './modules/supabase.module';
import { UtilsModule } from './modules/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static',
    }),
    UtilsModule,
    ConfigurationModule,
    SupabaseModule,
    AuthModule,
    ImageModule,
    SubscriptionModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtCookieMiddleware).forRoutes('*');

    consumer.apply(DynamicRateLimitMiddleware).forRoutes('*');

    consumer.apply(MenuMiddleware).forRoutes('*');
  }
}
