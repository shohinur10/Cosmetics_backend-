import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { ConfigModule } from '@nestjs/config';
import { BatchController } from './batch.controller';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import ProductSchema from 'apps/cosmetics-api/src/schemas/Product.model';
import MemberSchema from 'apps/cosmetics-api/src/schemas/Member.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
  ],
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
