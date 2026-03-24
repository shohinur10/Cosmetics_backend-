import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { Direction } from '../../enums/common.enum';
import { SupportRoomStatus } from '../../enums/support-chat.enum';

@InputType()
export class SupportRoomCreateInput {
  @IsOptional()
  @Length(3, 200)
  @Field(() => String, { nullable: true })
  subject?: string;

  @IsNotEmpty()
  @Length(1, 5000)
  @Field(() => String)
  firstMessage: string;
}

@InputType()
export class SupportMessageSendInput {
  @IsNotEmpty()
  @Field(() => String)
  roomId: string;

  @IsNotEmpty()
  @Length(1, 5000)
  @Field(() => String)
  messageText: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  attachments?: string[];
}

@InputType()
class SupportRoomsSearch {
  @IsOptional()
  @Field(() => SupportRoomStatus, { nullable: true })
  status?: SupportRoomStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  customerId?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  assignedSellerId?: string;
}

@InputType()
export class SupportRoomsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'lastMessageAt'])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsOptional()
  @Field(() => SupportRoomsSearch, { nullable: true })
  search?: SupportRoomsSearch;
}

@InputType()
export class SupportMessagesInquiry {
  @IsNotEmpty()
  @Field(() => String)
  roomId: string;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;
}
