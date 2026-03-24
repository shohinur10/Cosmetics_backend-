import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import OrderSchema from '../../schemas/Order.model';
import ProductSchema from '../../schemas/Product.model';
import DeliverySchema from '../../schemas/Delivery.model';
import PaymentSchema from '../../schemas/Payment.model';
import MemberSchema from '../../schemas/Member.model';
import OrderAuditSchema from '../../schemas/OrderAudit.model';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'Delivery', schema: DeliverySchema },
      { name: 'Payment', schema: PaymentSchema },
      { name: 'Member', schema: MemberSchema },
      { name: 'OrderAudit', schema: OrderAuditSchema },
    ]),
    AuthModule,
    NotificationModule,
  ],
  providers: [OrderResolver, OrderService],
  exports: [OrderService],
})
export class OrderModule {}
