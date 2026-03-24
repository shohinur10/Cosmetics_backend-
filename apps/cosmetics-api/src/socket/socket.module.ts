import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { AuthModule } from '../components/auth/auth.module';
import { SupportChatModule } from '../components/support-chat/support-chat.module';

@Module({
  imports: [AuthModule, SupportChatModule],
  providers: [SocketGateway],
})
export class SocketModule {}
