import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Direction, ErrorCode } from '../../libs/enums/common.enum';
import {
  DeliveryStatusTransition,
  Order,
  OrderStatusTransition,
  OrderTransitionMatrix,
  Orders,
} from '../../libs/dto/order/order';
import {
  ConfirmPaymentWebhookInput,
  CreateOrderInput,
  OrdersInquiry,
  UpdateOrderStatusInput,
  UpdateShippingInput,
} from '../../libs/dto/order/order.input';
import { Product } from '../../libs/dto/product/product';
import { Delivery } from '../../libs/dto/delivery/delivery';
import { Payment } from '../../libs/dto/payment/payment';
import { Member } from '../../libs/dto/member';
import { T } from '../../libs/types/common';
import { DeliveryStatus } from '../../libs/enums/delivery.enum';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';
import { NotificationService } from '../notification/notification.service';
import { OrderStatus, ShippingMethod } from '../../libs/enums/order.enum';
import { PaymentStatus } from '../../libs/enums/payment.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { estimateDeliveryDate } from './order.utils';
import { ProductStatus } from '../../libs/enums/product.enum';
import { MemberType } from '../../libs/enums/member.enum';

@Injectable()
export class OrderService {
  private readonly LOW_STOCK_THRESHOLD = 5;
  private readonly orderTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };
  private readonly deliveryTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
    [DeliveryStatus.PREPARING]: [DeliveryStatus.SHIPPED, DeliveryStatus.FAILED, DeliveryStatus.RETURNED],
    [DeliveryStatus.SHIPPED]: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED, DeliveryStatus.FAILED, DeliveryStatus.RETURNED],
    [DeliveryStatus.IN_TRANSIT]: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED, DeliveryStatus.RETURNED],
    [DeliveryStatus.DELIVERED]: [],
    [DeliveryStatus.FAILED]: [DeliveryStatus.RETURNED],
    [DeliveryStatus.RETURNED]: [],
  };

  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @InjectModel('Delivery') private readonly deliveryModel: Model<Delivery>,
    @InjectModel('Payment') private readonly paymentModel: Model<Payment>,
    @InjectModel('Member') private readonly memberModel: Model<any>,
    @InjectModel('OrderAudit') private readonly orderAuditModel: Model<any>,
    private readonly notificationService: NotificationService,
  ) {}

  public async createOrder(memberId: ObjectId, input: CreateOrderInput): Promise<Order> {
    if (input.idempotencyKey) {
      const existing = await this.orderModel
        .findOne({
          memberId,
          idempotencyKey: input.idempotencyKey,
          isDeleted: false,
        })
        .lean()
        .exec();
      if (existing) return existing as Order;
    }

    const session = await this.orderModel.db.startSession();
    session.startTransaction();
    try {
    const ids = input.items.map((i) => shapeIntoMongoObjectId(i.productId));
    const products = await this.productModel
      .find({ _id: { $in: ids }, productStatus: ProductStatus.ACTIVE, isDeleted: false })
      .session(session)
      .lean()
      .exec();
    if (products.length !== input.items.length) {
      throw new InternalServerErrorException(ErrorCode.NO_DATA_FOUND);
    }

    const productMap = new Map(products.map((p: any) => [String(p._id), p]));
    const orderItems = input.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new InternalServerErrorException(ErrorCode.NO_DATA_FOUND);
      if ((product.productStock ?? 0) < item.quantity) {
        throw new InternalServerErrorException(ErrorCode.INSUFFICIENT_STOCK);
      }
      const unitPrice = Number(product.productPrice ?? 0);
      return {
        productId: shapeIntoMongoObjectId(item.productId),
        quantity: item.quantity,
        unitPrice,
        subtotal: unitPrice * item.quantity,
      };
    });

    for (const item of orderItems) {
      const stockUpdated = await this.productModel
        .updateOne(
          { _id: item.productId, productStock: { $gte: item.quantity } },
          { $inc: { productStock: -item.quantity } },
        )
        .session(session)
        .exec();
      if (!stockUpdated.modifiedCount) {
        throw new InternalServerErrorException(ErrorCode.INSUFFICIENT_STOCK);
      }
    }

    const member: any = await this.memberModel
      .findById(memberId)
      .session(session)
      .lean()
      .exec();
    const shippingMethod = input.shippingMethod ?? ShippingMethod.STANDARD;
    const firstOrigin = products[0]?.productOrigin;
    const expectedDeliveryDate = estimateDeliveryDate({
      shippingMethod,
      productOrigin: firstOrigin,
      customerLocation: input.customerLocation,
    });
    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    const orderDocs = await this.orderModel.create([{
      memberId,
      customerName: member?.memberFullName || member?.memberNick || 'Customer',
      customerEmail: member?.memberEmail,
      customerPhone: member?.memberPhone,
      orderItems,
      totalAmount,
      currency: 'KRW',
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
      shippingMethod,
      shippingAddress: input.shippingAddress,
      customerLocation: input.customerLocation,
      idempotencyKey: input.idempotencyKey,
      orderDate: new Date(),
      expectedDeliveryDate,
      trackingHistory: [{ status: OrderStatus.PENDING, description: 'Order placed' }],
    }], { session });
    const order = orderDocs[0];

    await this.paymentModel.create([{
      orderId: order._id,
      memberId,
      amount: totalAmount,
      currency: 'KRW',
      status: PaymentStatus.PENDING,
    }], { session });

    const deliveryDocs = orderItems.map((item) => ({
      orderId: order._id,
      memberId,
      productId: item.productId,
      status: DeliveryStatus.PREPARING,
      deliveryAddress: input.shippingAddress,
      expectedDeliveryDate,
    }));
    await this.deliveryModel.insertMany(deliveryDocs, { session });

    await this.notificationService.createSystemNotification({
      authorId: memberId,
      receiverId: memberId,
      notificationType: NotificationType.ORDER_CREATED,
      notificationGroup: NotificationGroup.ORDER,
      notificationTitle: 'Order created successfully',
      notificationDesc: `Order total: ${totalAmount} KRW`,
    });

    await session.commitTransaction();
    await this.notifyLowStockProducts(orderItems.map((i) => i.productId));
    await this.writeOrderAudit(order._id, {
      actorId: memberId,
      actorRole: 'USER',
      action: 'ORDER_CREATED',
      after: { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus },
    });
    return order;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  public async getMyOrders(memberId: ObjectId, input: OrdersInquiry): Promise<Orders> {
    const match: T = { memberId, isDeleted: false };
    if (input?.search?.orderStatus) match.orderStatus = input.search.orderStatus;
    return await this.findOrders(match, input);
  }

  public async getOrderById(memberId: ObjectId, orderId: ObjectId): Promise<Order> {
    const order = await this.orderModel
      .findOne({ _id: orderId, memberId, isDeleted: false })
      .lean()
      .exec();
    if (!order) throw new InternalServerErrorException(ErrorCode.NO_DATA_FOUND);
    return order as Order;
  }

  public async getAllOrdersByAdmin(input: OrdersInquiry): Promise<Orders> {
    const match: T = { isDeleted: false };
    if (input?.search?.orderStatus) match.orderStatus = input.search.orderStatus;
    if (input?.search?.memberId)
      match.memberId = shapeIntoMongoObjectId(input.search.memberId);
    return await this.findOrders(match, input);
  }

  public async updateOrderStatusByAdmin(
    input: UpdateOrderStatusInput,
  ): Promise<Order> {
    const orderId = shapeIntoMongoObjectId(input.orderId);
    const current = await this.orderModel.findById(orderId).lean().exec();
    if (!current) throw new InternalServerErrorException(ErrorCode.NO_DATA_FOUND);
    this.ensureValidOrderTransition(current.orderStatus as OrderStatus, input.status);

    const updateDoc: T = {
      orderStatus: input.status,
      $push: {
        trackingHistory: {
          status: input.status,
          location: input.location,
          description: input.description ?? `Status changed to ${input.status}`,
          at: new Date(),
        },
      },
    };
    if (input.status === OrderStatus.DELIVERED) updateDoc.deliveredAt = new Date();
    if (input.status === OrderStatus.CANCELLED)
      updateDoc.paymentStatus = PaymentStatus.CANCELLED;

    const updated = await this.orderModel
      .findByIdAndUpdate(orderId, updateDoc, { new: true })
      .exec();
    if (!updated) throw new InternalServerErrorException(ErrorCode.UPDATE_FAILED);

    await this.syncDeliveryStatus(orderId, input.status, input.location);
    await this.notificationService.createSystemNotification({
      authorId: updated.memberId as any,
      receiverId: updated.memberId as any,
      notificationType:
        input.status === OrderStatus.DELIVERED
          ? NotificationType.ORDER_COMPLETED
          : input.status === OrderStatus.CANCELLED
            ? NotificationType.ORDER_CANCELLED
            : NotificationType.SYSTEM,
      notificationGroup: NotificationGroup.ORDER,
      notificationTitle: `Order ${input.status}`,
      notificationDesc: input.description ?? `Your order is now ${input.status}.`,
    });
    await this.writeOrderAudit(updated._id, {
      actorRole: 'ADMIN',
      action: 'ORDER_STATUS_UPDATED',
      before: { orderStatus: current.orderStatus },
      after: { orderStatus: updated.orderStatus },
      reason: input.description,
      meta: { location: input.location },
    });
    return updated;
  }

  public async updateShippingByAdmin(input: UpdateShippingInput): Promise<Order> {
    const orderId = shapeIntoMongoObjectId(input.orderId);
    const patch: T = {};
    if (input.shippingAddress) patch.shippingAddress = input.shippingAddress;
    if (input.expectedDeliveryDate) patch.expectedDeliveryDate = input.expectedDeliveryDate;

    const updated = await this.orderModel
      .findByIdAndUpdate(orderId, patch, { new: true })
      .exec();
    if (!updated) throw new InternalServerErrorException(ErrorCode.UPDATE_FAILED);

    await this.deliveryModel
      .updateMany(
        { orderId },
        {
          deliveryAddress: input.shippingAddress,
          expectedDeliveryDate: input.expectedDeliveryDate,
          courierName: input.courierName,
          trackingNumber: input.trackingNumber,
        },
      )
      .exec();

    await this.writeOrderAudit(updated._id, {
      actorRole: 'ADMIN',
      action: 'ORDER_SHIPPING_UPDATED',
      after: {
        shippingAddress: updated.shippingAddress,
        expectedDeliveryDate: updated.expectedDeliveryDate,
      },
      meta: {
        courierName: input.courierName,
        trackingNumber: input.trackingNumber,
      },
    });
    return updated;
  }

  public async confirmPaymentByWebhook(
    input: ConfirmPaymentWebhookInput,
  ): Promise<Order> {
    const orderId = shapeIntoMongoObjectId(input.orderId);
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) throw new InternalServerErrorException(ErrorCode.NO_DATA_FOUND);

    let payment = await this.paymentModel.findOne({ orderId }).exec();
    if (!payment) {
      payment = await this.paymentModel.create({
        orderId,
        memberId: order.memberId,
        amount: order.totalAmount,
        currency: order.currency,
        status: PaymentStatus.PENDING,
      });
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return order;
    }

    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(
        payment._id,
        {
          status: PaymentStatus.SUCCESS,
          transactionId: input.transactionId,
          paymentMethod: input.paymentMethod,
          paidAt: new Date(),
          notes: input.gatewayRawStatus,
        },
        { new: true },
      )
      .exec();

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        {
          paymentStatus: PaymentStatus.SUCCESS,
          orderStatus: OrderStatus.PAID,
          $push: {
            trackingHistory: {
              status: OrderStatus.PAID,
              description: 'Payment confirmed by gateway webhook',
              at: new Date(),
            },
          },
        },
        { new: true },
      )
      .exec();
    if (!updatedPayment || !updatedOrder) {
      throw new InternalServerErrorException(ErrorCode.UPDATE_FAILED);
    }

    await this.writeOrderAudit(orderId, {
      action: 'PAYMENT_CONFIRMED_WEBHOOK',
      after: {
        paymentStatus: updatedOrder.paymentStatus,
        orderStatus: updatedOrder.orderStatus,
      },
      meta: {
        transactionId: input.transactionId,
        paymentMethod: input.paymentMethod,
        gatewayRawStatus: input.gatewayRawStatus,
      },
    });
    return updatedOrder;
  }

  public getStatusTransitionMatrix(): OrderTransitionMatrix {
    const orderTransitions: OrderStatusTransition[] = Object.entries(
      this.orderTransitions,
    ).map(([from, to]) => ({
      from: from as OrderStatus,
      to,
    }));

    const deliveryTransitions: DeliveryStatusTransition[] = Object.entries(
      this.deliveryTransitions,
    ).map(([from, to]) => ({
      from,
      to,
    }));

    return {
      orderTransitions,
      deliveryTransitions,
    };
  }

  private async findOrders(match: T, input: OrdersInquiry): Promise<Orders> {
    const sortDirection: 1 | -1 = input?.direction === Direction.ASC ? 1 : -1;
    const sort: Record<string, 1 | -1> = {
      [input?.sort ?? 'createdAt']: sortDirection,
    };
    const result = await this.orderModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length) return { list: [], metaCounter: [{ total: 0 }] };
    return result[0];
  }

  private async syncDeliveryStatus(
    orderId: ObjectId,
    status: OrderStatus,
    location?: string,
  ): Promise<void> {
    const statusMap: Record<OrderStatus, DeliveryStatus | null> = {
      [OrderStatus.PENDING]: DeliveryStatus.PREPARING,
      [OrderStatus.PAID]: DeliveryStatus.PREPARING,
      [OrderStatus.PROCESSING]: DeliveryStatus.PREPARING,
      [OrderStatus.SHIPPED]: DeliveryStatus.SHIPPED,
      [OrderStatus.IN_TRANSIT]: DeliveryStatus.IN_TRANSIT,
      [OrderStatus.DELIVERED]: DeliveryStatus.DELIVERED,
      [OrderStatus.CANCELLED]: DeliveryStatus.RETURNED,
    };
    const mapped = statusMap[status];
    if (!mapped) return;

    const patch: T = { status: mapped };
    if (status === OrderStatus.DELIVERED) patch.deliveredAt = new Date();
    if (status === OrderStatus.CANCELLED) patch.returnedAt = new Date();
    if (location) patch.notes = `Last update location: ${location}`;
    await this.deliveryModel.updateMany({ orderId }, patch).exec();
  }

  private async notifyLowStockProducts(productIds: ObjectId[]): Promise<void> {
    const lowStockProducts = await this.productModel
      .find({ _id: { $in: productIds }, productStock: { $lte: this.LOW_STOCK_THRESHOLD } })
      .lean()
      .exec();
    if (!lowStockProducts.length) return;

    const admins = await this.memberModel
      .find({ memberType: MemberType.ADMIN })
      .select('_id')
      .lean()
      .exec();
    for (const admin of admins) {
      for (const product of lowStockProducts) {
        await this.notificationService.createSystemNotification({
          authorId: admin._id as any,
          receiverId: admin._id as any,
          notificationType: NotificationType.RESTOCK,
          notificationGroup: NotificationGroup.PRODUCT,
          notificationTitle: 'Low stock alert',
          notificationDesc: `${product.productTitle} is low on stock (${product.productStock}).`,
          productId: product._id as any,
        });
      }
    }
  }

  private ensureValidOrderTransition(
    from: OrderStatus,
    to: OrderStatus,
  ): void {
    if (from === to) return;
    const allowed = this.orderTransitions[from] ?? [];
    if (!allowed.includes(to)) {
      throw new InternalServerErrorException(
        ErrorCode.INVALID_ORDER_STATUS_TRANSITION,
      );
    }
  }

  private async writeOrderAudit(
    orderId: ObjectId,
    payload: {
      actorId?: ObjectId;
      actorRole?: string;
      action: string;
      before?: T;
      after?: T;
      reason?: string;
      meta?: T;
    },
  ): Promise<void> {
    await this.orderAuditModel.create({ orderId, ...payload });
  }
}
