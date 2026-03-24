import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PaymentSchema from '../../schemas/Payment.model';
import { PaymentResolver } from './payment.resolver';
import { PaymentService } from './payment.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Payment',
        schema: PaymentSchema,
      },
    ]),
    AuthModule,
  ],
  providers: [PaymentResolver, PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
