import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/user.decorator';
import { UserRole } from '../enums/user-role.enum';
import { AuthUser } from '../interfaces/user.interface';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionPlan } from '../enums/subscription.enum';

@Controller('subscription')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  // Get all available plans (API)
  @Get('plans')
  @Public()
  async getPlans() {
    try {
      const plans = await this.subscriptionService.getSubscriptionPlans();
      return {
        success: true,
        data: plans,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get current user subscription
  @Get('current')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.MANAGER)
  async getCurrentSubscription(@CurrentUser() user: AuthUser) {
    const subscription = await this.subscriptionService.getUserSubscription(
      user.id,
    );
    const usage = await this.subscriptionService.getSubscriptionUsage(user.id);

    return {
      subscription,
      usage,
    };
  }

  // Subscribe to a plan
  @Post('subscribe/:plan')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.MANAGER)
  async subscribeToPlan(
    @Param('plan') plan: SubscriptionPlan,
    @CurrentUser() user: AuthUser,
  ) {
    const subscription = await this.subscriptionService.createUserSubscription(
      user.id,
      plan,
    );

    return {
      success: true,
      subscription,
      message: 'Successfully subscribed to plan',
    };
  }

  // Get subscription usage
  @Get('usage')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.MANAGER)
  async getUsage(@CurrentUser() user: AuthUser) {
    return await this.subscriptionService.getSubscriptionUsage(user.id);
  }
}
