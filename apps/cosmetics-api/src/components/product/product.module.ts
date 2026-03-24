import { Module } from '@nestjs/common';
import { ProductResolver } from './product.resolver';
import { ProductController } from './product.controller';
import { ProductSeoCacheService } from './product-seo-cache.service';
import { ProductService } from './product.service';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import ProductSchema from '../../schemas/Product.model';
import { MongooseModule } from '@nestjs/mongoose';
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    AuthModule,
    ViewModule,
    MemberModule,
    LikeModule,
    NotificationModule,
  ],
  controllers: [ProductController],
  providers: [ProductResolver, ProductSeoCacheService, ProductService],
  exports: [ProductService],
})
export class ProductModule {}
