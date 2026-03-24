import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import InquirySchema from '../../schemas/Inquiry.model';
import { InquiryResolver } from './inquiry.resolver';
import { InquiryService } from './inquiry.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import MemberSchema from '../../schemas/Member.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Inquiry',
        schema: InquirySchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: 'Member',
        schema: MemberSchema,
      },
    ]),
    AuthModule,
    NotificationModule,
  ],
  providers: [InquiryResolver, InquiryService],
  exports: [InquiryService],
})
export class InquiryModule {}
