import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseGuards,
  Patch,
  Res,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto, CreateUserDto } from '../dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/user.decorator';
import { UserRole } from '../enums/user-role.enum';
import { AuthUser } from '../interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // API логин
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(loginDto);

      console.log(
        '🔐 Успешный вход:',
        result.user.email,
        'роль:',
        result.user.role,
      );

      // Устанавливаем JWT в httpOnly cookie
      res.cookie('jwt_token', result.token, {
        httpOnly: true,
        secure: false, // Будет управляться из конфигурации
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
        sameSite: 'lax',
      });

      return res.json({
        success: true,
        user: result.user,
        redirectUrl: this.getRedirectUrl(result.user.role),
      });
    } catch (error) {
      console.log('❌ Ошибка входа:', error.message);
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  // API регистрация
  @Public()
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res() res: Response,
    @Req() _req: Request,
  ) {
    try {
      const result = await this.authService.register(registerDto);

      console.log(
        '🎉 Пользователь создан:',
        result.user.email,
        'роль:',
        result.user.role,
      );

      // Устанавливаем JWT в httpOnly cookie для автоматического входа
      res.cookie('jwt_token', result.token, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
        sameSite: 'lax',
      });

      return res.json({
        success: true,
        user: result.user,
        redirectUrl: this.getRedirectUrl(result.user.role),
      });
    } catch (error) {
      console.log('❌ Ошибка регистрации:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Выход
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('jwt_token');
    return res.json({ success: true, redirectUrl: '/auth/login' });
  }

  // Получить профиль текущего пользователя
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@CurrentUser() user: AuthUser) {
    return { user };
  }

  // Получить всех пользователей
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getUsers() {
    return await this.authService.getUsers();
  }

  // Создать пользователя
  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
  }

  // Удалить пользователя
  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async deleteUser(@Param('id') id: string) {
    return await this.authService.deleteUser(id);
  }

  // Изменить роль пользователя (только админ)
  @Patch('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return await this.authService.updateUserRole(id, role);
  }

  private getRedirectUrl(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
      case UserRole.MANAGER:
        return '/admin';
      default:
        return '/';
    }
  }
}
