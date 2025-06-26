import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from './supabase.service';
import { LoginDto, RegisterDto, CreateUserDto } from '../dto/auth.dto';
import { UserRole } from '../enums/user-role.enum';
import { JwtPayload, User, AuthUser } from '../interfaces/user.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: User; token: string }> {
    const existingUser = await this.supabaseService.getUserByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const userData = {
      id: this.generateId(),
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || UserRole.USER,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const user = await this.supabaseService.createUser(userData);
    const token = this.generateToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user as any;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    try {
      console.log('🔐 Attempting login for:', loginDto.email);

      const user = await this.supabaseService.getUserByEmail(loginDto.email);
      console.log('📊 User found:', user ? 'Yes' : 'No');

      if (!user || !user.is_active) {
        console.log('❌ User not found or inactive');
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('🔍 Checking password...');
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        console.log('❌ Invalid password');
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('✅ Password valid, generating token...');
      const token = this.generateToken(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user as any;

      console.log('✅ Login successful for:', loginDto.email);
      return { user: userWithoutPassword as User, token };
    } catch (error) {
      console.error('❌ Login error:', error.message);
      throw error;
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.supabaseService.getUserByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const userData = {
      id: this.generateId(),
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const user = await this.supabaseService.createUser(userData);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user as any;

    return userWithoutPassword as User;
  }

  async validateUser(payload: JwtPayload): Promise<AuthUser | null> {
    try {
      const user = await this.supabaseService.getUserById(payload.sub);

      if (!user || !user.is_active) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      return null;
    }
  }

  async getUsers(): Promise<User[]> {
    const users = await this.supabaseService.getUsers();
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user as any;
      return userWithoutPassword as User;
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.supabaseService.deleteUser(id);
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const userData = {
      role,
      updated_at: new Date().toISOString(),
    };

    const user = await this.supabaseService.updateUser(id, userData);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user as any;

    return userWithoutPassword as User;
  }

  private generateToken(user: any): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  private generateId(): string {
    return (
      'user_' +
      Math.random().toString(36).substr(2, 9) +
      Date.now().toString(36)
    );
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.supabaseService.getUserById(id);

    if (!user) return null;

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user as any;
    return userWithoutPassword as User;
  }
}
