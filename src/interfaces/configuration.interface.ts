import { DatabaseSystemSetting } from '../types/database.types';

export interface AppConfiguration {
  supabaseUrl: string;
  supabaseServiceKey: string;
  supabaseAnonKey: string;
  supabaseJwtSecret: string;
  jwtSecret: string;
  siteName: string;
  domain: string;
}
