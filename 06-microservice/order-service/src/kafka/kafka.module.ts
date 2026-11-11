import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KakaConsumer } from './kaka.consumer';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'hero',
            brokers: ['localhost:9092'],
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  providers: [KafkaService],
  controllers: [KakaConsumer],
  exports: [KafkaService],
})
export class KafkaModule {}
