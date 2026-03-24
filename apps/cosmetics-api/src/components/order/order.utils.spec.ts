import { ShippingMethod } from '../../libs/enums/order.enum';
import { estimateDeliveryDate } from './order.utils';

describe('estimateDeliveryDate', () => {
  it('adds 0 days for SAME_DAY shipping', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const result = estimateDeliveryDate({
      shippingMethod: ShippingMethod.SAME_DAY,
      productOrigin: 'seoul',
      customerLocation: 'seoul',
      now,
    });
    expect(result.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('adds extra days for international route', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const result = estimateDeliveryDate({
      shippingMethod: ShippingMethod.EXPRESS,
      productOrigin: 'korea',
      customerLocation: 'japan',
      now,
    });
    expect(result.toISOString()).toBe('2026-01-06T00:00:00.000Z');
  });
});
