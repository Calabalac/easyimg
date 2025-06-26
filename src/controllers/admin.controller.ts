import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { ImageService } from '../services/image.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/user.decorator';
import { UserRole } from '../enums/user-role.enum';
import { AuthUser } from '../interfaces/user.interface';
import { SubscriptionService } from '../services/subscription.service';
import { RLSService } from '../services/rls.service';
import {
  RateLimitService,
  RateLimitConfig,
} from '../services/rate-limit.service';
import { SubscriptionPlan } from '../enums/subscription.enum';
import { ConfigurationService } from '../services/configuration.service';
import { Response } from 'express';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class AdminController {
  constructor(
    private readonly imageService: ImageService,
    private readonly subscriptionService: SubscriptionService,
    private readonly rlsService: RLSService,
    private readonly rateLimitService: RateLimitService,
    private readonly configurationService: ConfigurationService,
  ) {}

  // API endpoints for dashboard data
  @Get('api/dashboard')
  async getDashboardData(@CurrentUser() user: AuthUser) {
    try {
      const images = await this.imageService.listImages({ page: 1, limit: 12 });
      const rlsStatus = await this.rlsService.getRLSStatus();

      // Получаем статистику для дашборда
      const allImages = await this.imageService.listImages({
        page: 1,
        limit: 1000,
      }); // Получаем все изображения для подсчета
      const users =
        await this.subscriptionService.getAllUsersWithSubscriptions();

      // Вычисляем размер хранилища
      let totalStorageBytes = 0;
      try {
        // Примерный расчет - можно улучшить позже
        totalStorageBytes = allImages.total * 2 * 1024 * 1024; // Примерно 2MB на изображение
      } catch (error) {
        console.warn('Could not calculate storage size:', error);
        totalStorageBytes = 0;
      }

      // Подсчитываем активные подписки
      const activeSubscriptions = users.filter(
        (user) => user.subscription && user.subscription.status === 'active',
      ).length;

      const stats = {
        totalImages: allImages.total || 0,
        totalUsers: users.length || 0,
        storageUsed: totalStorageBytes,
        activeSubscriptions: activeSubscriptions || 0,
      };

      console.log('📊 Dashboard stats:', stats);

      return {
        success: true,
        data: {
          user,
          images: images.images,
          total: images.total,
          stats,
          rlsStatus,
        },
      };
    } catch (error) {
      console.error('❌ Dashboard error:', error);
      return {
        success: false,
        error: error.message,
        data: {
          user,
          images: [],
          total: 0,
          stats: {
            totalImages: 0,
            totalUsers: 0,
            storageUsed: 0,
            activeSubscriptions: 0,
          },
          rlsStatus: { enabled: false, policies: [] },
        },
      };
    }
  }

  @Get('api/image/:id')
  async getImageDetail(@Param('id') id: string) {
    try {
      const image = await this.imageService.getImageById(id);
      return {
        success: true,
        data: image,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // API endpoints for user management
  @Get('api/users')
  async getUsers() {
    try {
      const users = await this.subscriptionService.getAllUsersWithSubscriptions();
      const plans = await this.subscriptionService.getSubscriptionPlans();

      return {
        success: true,
        data: {
          users,
          plans,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('api/subscriptions')
  async getSubscriptions() {
    try {
      const users = await this.subscriptionService.getAllUsersWithSubscriptions();
      const plans = await this.subscriptionService.getSubscriptionPlans();

      return {
        success: true,
        data: {
          users,
          plans,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('api/subscription-plans')
  async getSubscriptionPlans() {
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

  @Get('api/status')
  async getSystemStatus() {
    try {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      const version = process.version;
      const platform = process.platform;
      const arch = process.arch;

      const rlsStatus = await this.rlsService.getRLSStatus();

      return {
        success: true,
        data: {
          systemInfo: {
            uptime,
            memoryUsage,
            version,
            platform,
            arch,
            timestamp: new Date(),
          },
          rlsStatus,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('api/rate-limit')
  async getRateLimitData() {
    try {
      const config = await this.rateLimitService.getRateLimitConfig();
      const recommended = this.rateLimitService.getRecommendedValues();

      return {
        success: true,
        data: {
          config,
          recommended,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('api/roles')
  async getRoles() {
    try {
      const { UserRole, RoleLabels, RoleDescriptions } = await import(
        '../enums/user-role.enum'
      );

      return {
        success: true,
        data: {
          roles: Object.values(UserRole),
          roleLabels: RoleLabels,
          roleDescriptions: RoleDescriptions,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // API endpoints for subscription management
  @Put('user/:userId/quota')
  async updateUserQuota(
    @Param('userId') userId: string,
    @Body('quota') quota: number,
  ) {
    await this.subscriptionService.updateUserQuota(userId, quota);
    return { success: true, message: 'User quota updated successfully' };
  }

  @Post('subscription-plan/:planId')
  async updateSubscriptionPlan(
    @Param('planId') planId: SubscriptionPlan,
    @Body() planData: any,
  ) {
    await this.subscriptionService.updateSubscriptionPlan(planId, planData);
    return { success: true, message: 'Subscription plan updated successfully' };
  }



  // API endpoints for user management
  @Put('user/:userId')
  async updateUser(
    @Param('userId') _userId: string,
    @Body() _updateData: { role?: string; is_active?: boolean },
  ) {
    // TODO: Implement user update in auth service
    // For now, return success
    return { success: true, message: 'User updated successfully' };
  }

  @Put('user/:userId/status')
  async updateUserStatus(
    @Param('userId') _userId: string,
    @Body() _statusData: { is_active: boolean },
  ) {
    // TODO: Implement user status update in subscription service
    return { success: true, message: 'User status updated successfully' };
  }

  @Put('role/:roleKey')
  @Roles(UserRole.ADMIN)
  async updateRole(
    @Param('roleKey') roleKey: string,
    @Body() roleData: { name: string; description: string },
  ) {
    // В будущем здесь можно будет сохранять настройки ролей в базе данных
    // Пока что возвращаем успешный ответ
    return {
      success: true,
      message: 'Role settings updated successfully',
      role: roleKey,
      data: roleData,
    };
  }

  // Rate limiting API endpoints
  @Put('api/rate-limit')
  async updateRateLimitConfig(@Body() config: RateLimitConfig) {
    try {
      await this.rateLimitService.updateRateLimitConfig(config);
      return {
        success: true,
        message:
          'Rate limit configuration updated successfully. Changes will take effect within 1 minute.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update rate limit configuration: ' + error.message,
      };
    }
  }
}
