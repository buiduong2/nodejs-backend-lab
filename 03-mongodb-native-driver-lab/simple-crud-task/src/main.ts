import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnvFile } from 'node:process';

async function bootstrap() {
  loadEnvFile('.env');
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
