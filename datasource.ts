import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './src/users/entities/user.entity';
import { Url } from './src/urls/entities/url.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'url_shortener',
  entities: [User, Url],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
