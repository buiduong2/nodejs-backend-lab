import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { SagaModule } from '../saga/saga.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), SagaModule],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
