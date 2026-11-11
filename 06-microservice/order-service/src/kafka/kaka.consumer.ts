import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';

type KillDragonMessage = {
  message: string;
  id: string;
};

@Controller()
export class KakaConsumer {
  @Inject('KAFKA_PRODUCER')
  client: ClientKafka;

  @Post()
  sendMessage(@Body() msg: { msg: string }) {
    this.client.emit('hero.kill.dragon', msg);
    console.log('send message successfull');
  }

  @EventPattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage, @Ctx() context: unknown) {
    const kafkaContext = context as KafkaContext;

    const originalMessage = kafkaContext.getMessage();
    const partition = kafkaContext.getPartition();

    console.log(message);
    console.log(originalMessage);
    console.log(partition);
  }
}
