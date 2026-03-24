import { Field, InputType, Int } from '@nestjs/graphql';
import { MemberType, MemberAuthType, MemberStatus } from '../enums/member.enum';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { availableSellerSorts, availableMemberSorts } from '../config';
import { Direction } from '../enums/common.enum';

@InputType()
export class MemberInput {
  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  memberNick: string;

  @IsNotEmpty()
  @Length(5, 12)
  @Field(() => String)
  memberPassword: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberPhone?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberEmail?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberTelegramId?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberFaceId?: string;

  @IsNotEmpty()
  @Field(() => MemberType, { nullable: true })
  memberType?: MemberType;

  @IsNotEmpty()
  @Field(() => MemberAuthType)
  memberAuthType: MemberAuthType;
}

@InputType()
export class LoginInput {
  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  memberNick: string;

  @IsNotEmpty()
  @Length(5, 12)
  @Field(() => String)
  memberPassword: string;
}

@InputType()
export class AISearch {
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  text?: string;
}
@InputType()
export class SellersInquiry {
  @IsNotEmpty()
  @Field(() => Int) // <-- use Int for number, not String
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableSellerSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true }) // Change from String to Direction here
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => AISearch)
  search: AISearch;
}

@InputType()
export class MISearch {
  @IsOptional()
  @Field(() => MemberStatus, { nullable: true })
  memberStatus?: MemberStatus;

  @IsOptional()
  @Field(() => MemberType, { nullable: true })
  memberType?: MemberType;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}
@InputType()
export class MembersInquiry {
  @IsNotEmpty()
  @Field(() => Int) // <-- use Int for number, not String
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableMemberSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true }) // Change from String to Direction here
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => MISearch)
  search: MISearch;
}
