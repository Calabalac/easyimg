import { Module } from '@nestjs/common';
import { AdminController } from '../controllers/admin.controller';
import { SupabaseModule } from './supabase.module';
import { ImageModule } from './image.module';
import { SubscriptionModule } from './subscription.module';
import { ConfigurationModule } from './configuration.module';
import { AuthModule } from './auth.module';
import { RLSService } from '../services/rls.service';
import { RateLimitService } from '../services/rate-limit.service';

@Module({
  imports: [
    SupabaseModule,
    ImageModule,
    SubscriptionModule,
    ConfigurationModule,
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [RLSService, RateLimitService],
  exports: [RLSService, RateLimitService],
})
export class AdminModule {}
