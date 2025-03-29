import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('Testando conexão com o banco de dados...');
  console.log('Configurações:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
  });

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    await dataSource.initialize();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    await dataSource.destroy();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
}

testConnection();
