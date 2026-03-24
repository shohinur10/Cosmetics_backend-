import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportChatResolver } from './support-chat.resolver';
import { SupportChatService } from './support-chat.service';
import SupportChatRoomSchema from '../../schemas/SupportChatRoom.model';
import SupportChatMessageSchema from '../../schemas/SupportChatMessage.model';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SupportChatRoom', schema: SupportChatRoomSchema },
      { name: 'SupportChatMessage', schema: SupportChatMessageSchema },
      { name: 'Member', schema: MemberSchema },
    ]),
    AuthModule,
  ],
  providers: [SupportChatResolver, SupportChatService],
  exports: [SupportChatService],
})
export class SupportChatModule {}
