import { OrderService } from './order.service';
import { ShippingMethod } from '../../libs/enums/order.enum';

function createMockModel() {
  const session = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };
  return {
    db: { startSession: jest.fn().mockResolvedValue(session) },
    __session: session,
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    updateOne: jest.fn().mockReturnThis(),
    updateMany: jest.fn().mockReturnThis(),
    insertMany: jest.fn(),
    create: jest.fn(),
    lean: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    aggregate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };
}

describe('OrderService', () => {
  it('creates order and deducts inventory', async () => {
    const orderModel = createMockModel();
    const productModel = createMockModel();
    const deliveryModel = createMockModel();
    const paymentModel = createMockModel();
    const memberModel = createMockModel();
    const notificationService = { createSystemNotification: jest.fn() };

    const service = new OrderService(
      orderModel as any,
      productModel as any,
      deliveryModel as any,
      paymentModel as any,
      memberModel as any,
      notificationService as any,
    );

    const memberId = '65f000000000000000000001' as any;
    const productId = '65f000000000000000000010';
    productModel.exec
      .mockResolvedValueOnce([
        {
          _id: productId,
          productTitle: 'Toner',
          productPrice: 10000,
          productStock: 8,
          productOrigin: 'korea',
        },
      ])
      .mockResolvedValueOnce([]);
    productModel.updateOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) });
    memberModel.findById.mockReturnValue({
      lean: () => ({ exec: async () => ({ memberNick: 'hana', memberEmail: 'h@x.com' }) }),
    } as any);
    orderModel.findOne.mockReturnValue({
      lean: () => ({ exec: async () => null }),
    } as any);
    orderModel.create.mockResolvedValue([
      { _id: 'order1', memberId, totalAmount: 20000 },
    ]);
    paymentModel.create.mockResolvedValue({});
    deliveryModel.insertMany.mockResolvedValue([]);
    memberModel.find.mockReturnValue({
      select: () => ({ lean: () => ({ exec: async () => [] }) }),
    } as any);

    const created = await service.createOrder(memberId, {
      items: [{ productId, quantity: 2 }],
      shippingAddress: 'Seoul Gangnam',
      customerLocation: 'korea',
      shippingMethod: ShippingMethod.STANDARD,
      idempotencyKey: 'idem-12345678',
    });

    expect(created.totalAmount).toBe(20000);
    expect(productModel.updateOne).toHaveBeenCalled();
    expect(deliveryModel.insertMany).toHaveBeenCalled();
    expect(orderModel.__session.commitTransaction).toHaveBeenCalled();
  });

  it('throws for insufficient stock', async () => {
    const orderModel = createMockModel();
    const productModel = createMockModel();
    const deliveryModel = createMockModel();
    const paymentModel = createMockModel();
    const memberModel = createMockModel();
    const notificationService = { createSystemNotification: jest.fn() };

    const service = new OrderService(
      orderModel as any,
      productModel as any,
      deliveryModel as any,
      paymentModel as any,
      memberModel as any,
      notificationService as any,
    );
    orderModel.findOne.mockReturnValue({
      lean: () => ({ exec: async () => null }),
    } as any);
    productModel.exec.mockResolvedValue([
      { _id: 'p1', productTitle: 'Cream', productPrice: 20000, productStock: 1 },
    ]);

    await expect(
      service.createOrder('m1' as any, {
        items: [{ productId: 'p1', quantity: 2 }],
        shippingAddress: 'Busan',
      }),
    ).rejects.toThrow('INSUFFICIENT_STOCK');
    expect(orderModel.__session.abortTransaction).toHaveBeenCalled();
  });

  it('returns existing order for same idempotency key', async () => {
    const orderModel = createMockModel();
    const productModel = createMockModel();
    const deliveryModel = createMockModel();
    const paymentModel = createMockModel();
    const memberModel = createMockModel();
    const notificationService = { createSystemNotification: jest.fn() };

    const service = new OrderService(
      orderModel as any,
      productModel as any,
      deliveryModel as any,
      paymentModel as any,
      memberModel as any,
      notificationService as any,
    );

    const existingOrder = { _id: 'ord-existing', totalAmount: 12345 };
    orderModel.findOne.mockReturnValue({
      lean: () => ({ exec: async () => existingOrder }),
    } as any);

    const result = await service.createOrder('m1' as any, {
      items: [{ productId: 'p1', quantity: 1 }],
      shippingAddress: 'Seoul',
      idempotencyKey: 'idem-same-key',
    });

    expect(result).toEqual(existingOrder);
    expect(productModel.updateOne).not.toHaveBeenCalled();
  });
});
