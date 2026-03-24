import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import DeliverySchema from '../../schemas/Delivery.model';
import { DeliveryResolver } from './delivery.resolver';
import { DeliveryService } from './delivery.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Delivery',
        schema: DeliverySchema,
      },
    ]),
    AuthModule,
  ],
  providers: [DeliveryResolver, DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
