import { Module } from '@nestjs/common';
import { SubscriptionController } from '../controllers/subscription.controller';
import { SubscriptionService } from '../services/subscription.service';
import { SupabaseModule } from './supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
