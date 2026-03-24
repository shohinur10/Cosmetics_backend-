import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { NotificationModule } from './notification/notification.module';
import { DeliveryModule } from './delivery/delivery.module';
import { NoticeModule } from './notice/notice.module';
import { PaymentModule } from './payment/payment.module';
import { ReviewModule } from './review/review.module';
import { SupportChatModule } from './support-chat/support-chat.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    MemberModule,
    AuthModule,
    ProductModule,
    BoardArticleModule,
    LikeModule,
    ViewModule,
    CommentModule, // ✅ Comment logic included through this
    FollowModule,
    InquiryModule,
    NotificationModule,
    DeliveryModule,
    NoticeModule,
    PaymentModule,
    ReviewModule,
    SupportChatModule,
    OrderModule,
  ],
})
export class ComponentsModule {}
