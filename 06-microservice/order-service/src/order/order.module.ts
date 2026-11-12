import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SagaModule } from '../saga/saga.module';
import { OrderController } from './order.controller';
import { Order } from './order.entity';
import { OrderService } from './order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), SagaModule],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
