import { Get, Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';
import { ConfigurationService } from './services/configuration.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configurationService: ConfigurationService,
  ) {}

  @Get('health')
  @Public()
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('healthz')
  @Public()
  healthCheckCoolify() {
    // Простой endpoint для Coolify/Kubernetes health check
    return { status: 'ok' };
  }

  @Get('ping')
  @Public()
  ping() {
    return { pong: true };
  }
}
