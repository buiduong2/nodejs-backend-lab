import { Injectable } from '@nestjs/common';
import {
  ReservationResult,
  ReserveInventoryCommand,
} from '../order/order.type';
import { EntityManager, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import {
  ProductReservation,
  ReservationStatus,
} from './product-reservation.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async handlerReserveInventory(
    message: ReserveInventoryCommand,
  ): Promise<ReservationResult> {
    return this.productRepository.manager.transaction(async (tx) => {
      // idempotency
      const existing = await tx.findOne(ProductReservation, {
        where: { orderId: message.orderId },
      });

      if (existing) {
        if (
          existing.sagaId !== message.sagaId ||
          existing.status !== ReservationStatus.RESERVED
        ) {
          throw new Error('Reservation conflict');
        }

        return {
          success: true,
          reservationId: existing.id,
        };
      }

      const result = await this.validateOrderItems(tx, message.payload);

      if (!result.success) {
        return {
          success: result.success,
          reason: result.reason,
        };
      }

      const productReservation = await this.reverseInventory(
        tx,
        message,
        result.products,
      );

      return {
        success: true,
        reservationId: productReservation.id,
      };
    });
  }

  async validateOrderItems(
    tx: EntityManager,
    payload: ReserveInventoryCommand['payload'],
  ): Promise<ValidateResult> {
    const productIds = payload.items.map((item) => item.productId);

    const products = await tx
      .createQueryBuilder(Product, 'p')
      .where('p.id IN (:...productIds)', { productIds })
      .orderBy('p.id', 'ASC')
      .setLock('pessimistic_write')
      .getMany();

    // validate Product
    if (products.length !== productIds.length) {
      return {
        success: false,
        reason: 'PRODUCT_NOT_FOUND',
      };
    }

    // Validate Quantity
    const mapRequestQuantity = new Map(
      payload.items.map((i) => [i.productId, i.quantity]),
    );

    if (
      products.some(
        (p) => p.quantity - p.reservedQuantity < mapRequestQuantity.get(p.id)!,
      )
    ) {
      return {
        success: false,
        reason: 'OUT_OF_STOCK',
      };
    }

    return { success: true, products };
  }

  async reverseInventory(
    tx: EntityManager,
    { orderId, sagaId, payload }: ReserveInventoryCommand,

    products: Product[],
  ): Promise<ProductReservation> {
    const mapRequestQuantity = new Map(
      payload.items.map((i) => [i.productId, i.quantity]),
    );

    products.forEach((p) => {
      const requestedQuantity: number = mapRequestQuantity.get(p.id)!;
      p.reservedQuantity = p.reservedQuantity + requestedQuantity;
    });

    const reservation = tx.create(ProductReservation, {
      items: payload.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      orderId,
      sagaId,
      status: ReservationStatus.RESERVED,
    });

    const [_, savedReservation] = await Promise.all([
      tx.save(products),
      tx.save(reservation),
    ]);

    return savedReservation;
  }
}

type ValidateResult =
  | {
      success: false;
      reason: 'PRODUCT_NOT_FOUND' | 'OUT_OF_STOCK';
    }
  | {
      success: true;
      products: Product[];
    };
