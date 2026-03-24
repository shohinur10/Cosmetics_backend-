import { ShippingMethod } from '../../libs/enums/order.enum';

export function estimateDeliveryDate(input: {
  shippingMethod: ShippingMethod;
  productOrigin?: string;
  customerLocation?: string;
  now?: Date;
}): Date {
  const { shippingMethod, productOrigin, customerLocation } = input;
  const baseDate = input.now ? new Date(input.now) : new Date();

  let days = 4;
  if (shippingMethod === ShippingMethod.EXPRESS) days = 2;
  if (shippingMethod === ShippingMethod.SAME_DAY) days = 0;

  const origin = (productOrigin ?? '').toLowerCase();
  const location = (customerLocation ?? '').toLowerCase();
  const isInternational =
    origin.length > 0 && location.length > 0 && !location.includes(origin);
  if (isInternational) days += 3;

  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
}
