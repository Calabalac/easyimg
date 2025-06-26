import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationService } from './services/configuration.service';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;

  beforeAll(async () => {
    const mockConfigurationService = {
      isSupabaseConfigured: jest.fn().mockResolvedValue(true),
      isInstalled: jest.fn().mockResolvedValue(true),
    };

    const mockAppService = {
      getHello: jest.fn().mockReturnValue('Hello World!'),
    };

    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
        {
          provide: ConfigurationService,
          useValue: mockConfigurationService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('should return title, message and URLs', async () => {
      const result = await appController.getHello();
      expect(result).toEqual({
        title: 'EasyImg - Professional Image Management',
        message: 'Hello World!',
        loginUrl: '/auth/login',
        registerUrl: '/auth/register',
      });
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      const result = appController.healthCheck();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('service', 'EasyImg');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('healthCheckCoolify', () => {
    it('should return simple health status for Coolify', () => {
      const result = appController.healthCheckCoolify();
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('ping', () => {
    it('should return pong', () => {
      const result = appController.ping();
      expect(result).toEqual({ pong: true });
    });
  });
});
