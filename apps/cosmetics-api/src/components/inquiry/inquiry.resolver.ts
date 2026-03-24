import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { UseGuards } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import {
  Inquiries,
  Inquiry,
  SupportAiStats,
} from '../../libs/dto/inquiry/inquiry';
import {
  InquiriesInquiry,
  InquiryInput,
} from '../../libs/dto/inquiry/inquiry.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class InquiryResolver {
  constructor(private readonly inquiryService: InquiryService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Inquiry)
  public async createInquiry(
    @Args('input') input: InquiryInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Inquiry> {
    return await this.inquiryService.createInquiry(memberId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Inquiries)
  public async getAllInquiriesByAdmin(
    @Args('input') input: InquiriesInquiry,
  ): Promise<Inquiries> {
    return await this.inquiryService.getAllInquiriesByAdmin(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => SupportAiStats)
  public async getSupportAiStatsAllTime(): Promise<SupportAiStats> {
    return await this.inquiryService.getSupportAiStatsAllTime();
  }
}
