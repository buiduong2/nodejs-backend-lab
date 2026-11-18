import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: config.getOrThrow<string>('KAFKA_CLIENT_ID'),
          brokers: config.getOrThrow<string>('KAFKA_BROKERS').split(','),
        },
        consumer: {
          groupId: config.getOrThrow<string>('KAFKA_GROUP_ID'),
        },
        subscribe: {
          fromBeginning: true,
        },
      },
    },
    { inheritAppConfig: true },
  );

  await app.listen(Number(config.getOrThrow<string>('PORT')));
  await app.startAllMicroservices();
}
void bootstrap();
