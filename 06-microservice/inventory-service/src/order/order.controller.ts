import { Controller, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller('order')
export class OrderController {
  @Inject('KAFKA_PRODUCER')
  client: ClientKafka;

  
}
