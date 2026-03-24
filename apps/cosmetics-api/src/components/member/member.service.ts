import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Member, Members } from '../../libs/dto/member';
import {
  SellersInquiry,
  LoginInput,
  MemberInput,
  MembersInquiry,
} from '../../libs/dto/member.input';
import MemberSchema from '../../schemas/Member.model';
import {
  MemberAuthType,
  MemberStatus,
  MemberType,
} from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member.update';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { exec } from 'child_process';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeService } from '../like/like.service';
import { MeLiked, Like } from '../../libs/dto/like/like';
import { Follower, Following, MeFollowed } from '../../libs/dto/follow/follow';
import { lookupAuthMemberLiked } from '../../libs/config';
import { NotificationService } from '../notification/notification.service';
import {
  NotificationGroup,
  NotificationType,
} from '../../libs/enums/notification.enum';
@Injectable()
export class MemberService {
  constructor(
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    @InjectModel('Follow')
    private readonly followModel: Model<Follower | Following>,
    private authService: AuthService,
    private viewService: ViewService, // Inject ViewService if needed for member-related views
    private likeService: LikeService,
    private readonly notificationService: NotificationService,
  ) {}

  public async signup(input: MemberInput): Promise<Member> {
    if (input.memberAuthType === MemberAuthType.PHONE && !input.memberPhone) {
      throw new BadRequestException('Phone is required for PHONE signup');
    }
    if (input.memberAuthType === MemberAuthType.EMAIL && !input.memberEmail) {
      throw new BadRequestException('Email is required for EMAIL signup');
    }
    if (
      input.memberAuthType === MemberAuthType.TELEGRAM_BOT &&
      !input.memberTelegramId
    ) {
      throw new BadRequestException(
        'Telegram ID is required for TELEGRAM_BOT signup',
      );
    }
    if (
      input.memberAuthType === MemberAuthType.FACE_ID &&
      !input.memberFaceId
    ) {
      throw new BadRequestException('Face ID is required for FACE_ID signup');
    }

    //TODO:HASH PASSWORD
    input.memberPassword = await this.authService.hashPassword(
      input.memberPassword,
    );

    try {
      const result = await this.memberModel.create(input);
      //TODO: Authentication logic here
      result.accessToken = await this.authService.createToken(result); // Assuming createToken is a method in AuthService that generates a token for the member
      return result; // Return the Member object directly
    } catch (err) {
      console.error('Error, Service.model:', err.message);
      throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE); // Handle the error appropriately
    }
  }
  public async login(input: LoginInput): Promise<Member> {
    const { memberNick, memberPassword } = input;
    const response = await this.memberModel
      .findOne({
        memberNick: input.memberNick,
      })
      .select('+memberPassword')
      .exec(); // Ensure password is included in the result

    if (!response) {
      throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
    }

    if (!response || response.memberStatus === MemberStatus.DEACTIVATED) {
      throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
    } else if (
      response.memberStatus === MemberStatus.BANNED ||
      response.memberStatus === MemberStatus.SUSPENDED
    ) {
      throw new InternalServerErrorException(Message.MEMBER_BLOCKED);
    }
    //TODO:  compare  password verification logic here

    if (!response.memberPassword) {
      throw new InternalServerErrorException(Message.WRONG_PASSWORD);
    }
    const isMatch = await this.authService.comparePassword(
      input.memberPassword,
      response.memberPassword,
    ); // Replace with actual password comparison logic
    if (!isMatch)
      throw new InternalServerErrorException(Message.WRONG_PASSWORD);
    // delete response.memberPassword; // Remove password from the response
    response.accessToken = await this.authService.createToken(response); // Assuming createToken is a method in AuthService that generates a token for the member
    return response;
  }
  public async updateMember(
    memberId: ObjectId | null,
    input: MemberUpdate,
  ): Promise<Member> {
    const result = await this.memberModel
      .findOneAndUpdate(
        {
          _id: memberId,
          memberStatus: MemberStatus.ACTIVE,
        },
        input,
        { new: true },
      )
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATED_FAILED);

    result.accessToken = await this.authService.createToken(result);
    return result; // Return the Member object directly
  }

  public async getMember(
    memberId: ObjectId | null,
    targetId: ObjectId,
  ): Promise<Member> {
    const search: T = {
      _id: targetId,
      memberStatus: {
        $in: [MemberStatus.ACTIVE, MemberStatus.SUSPENDED],
      },
    };
    const targetMember: any = await this.memberModel
      .findOne(search)
      .lean()
      .exec();
    if (!targetMember)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput = {
        memberId: memberId,
        viewRefId: targetId,
        viewGroup: ViewGroup.MEMBER,
      };
      const newView = await this.viewService.recordView(viewInput);
      if (newView) {
        await this.memberModel
          .findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true })
          .exec();
        targetMember.memberViews++;
      }

      // meLiked
      const likeInput = {
        memberId: memberId,
        likeRefId: targetId,
        likeGroup: LikeGroup.MEMBER,
      };
      targetMember.meLiked =
        await this.likeService.checkLikeExistence(likeInput);

      // meFollowed
      targetMember.meFollowed = await this.checkSubscription(
        memberId,
        targetId,
      );
    }
    return targetMember;
  }

  public async getSellers(
    memberId: ObjectId,
    input: SellersInquiry,
  ): Promise<Members> {
    const { text } = input.search;

    const match: T = {
      memberType: MemberType.SELLER,
      memberStatus: MemberStatus.ACTIVE,
    };

    const sortDirection =
      input.direction === Direction.ASC
        ? 1
        : input.direction === Direction.DESC
          ? -1
          : -1;
    const sort: T = { [input.sort ?? 'createdAt']: sortDirection };

    if (text) {
      match.memberNick = { $regex: new RegExp(text, 'i') };
    }

    console.log('match:', match);
    console.log('sort:', sort);

    const result = await this.memberModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupAuthMemberLiked(memberId, '$_id'),
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) {
      throw new InternalServerErrorException('No data found');
    }

    return result[0];
  }

  public async likeTargetMember(
    memberId: ObjectId,
    likeRefId: ObjectId,
  ): Promise<Member> {
    const target = await this.memberModel
      .findOne({ _id: likeRefId, memberStatus: MemberStatus.ACTIVE })
      .exec();

    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.MEMBER,
    };

    // LIKE TOGGLE via like modules
    const modifier: number = await this.likeService.toggleLike(input);
    const result = await this.memberStatsEditor({
      _id: likeRefId,
      targetKey: 'memberLikes',
      modifier: modifier,
    });

    if (modifier > 0 && String(likeRefId) !== String(memberId)) {
      await this.notificationService.createSystemNotification({
        authorId: memberId,
        receiverId: likeRefId,
        notificationType: NotificationType.LIKE,
        notificationGroup: NotificationGroup.MEMBER,
        notificationTitle: 'New like on your profile',
        notificationDesc: 'A user liked your profile.',
      });
    }

    if (!result)
      throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

    return result;
  }

  public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
    const { text, memberStatus, memberType } = input.search; // distructure search properties

    const match: T = {};
    const sortDirection = input.direction === Direction.DESC ? -1 : 1;
    const sort: T = { [input.sort ?? 'createdAt']: sortDirection };

    if (memberStatus) match.memberStatus = memberStatus; // also fix this: should be 'memberStatus' not 'MemberStatus'
    if (memberType) match.memberType = memberType;

    if (text) {
      match.memberNick = { $regex: new RegExp(text, 'i') }; //i flag – katta-kichik harflarga e’tibor bermaslik.
    } // $regex => MongoDB'da bu matnga mos keluvchi qiymatlarni topadi => { memberNick: { $regex: /ali/i } }

    console.log('match:', match);
    console.log('sort:', sort);

    const result = await this.memberModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            //$facet – MongoDB’da parallel (bir vaqtda) ikki xil natijani olishga imkon beradi.
            list: [
              { $skip: (input.page - 1) * input.limit }, //list: sahifalash uchun (masalan, 2-sahifa uchun 10 ta ma’lumot)
              { $limit: input.limit }, //metaCounter: umumiy nechta hujjat borligini sanaydi
            ],
            metaCounter: [{ $count: 'total' }], //etaCounter → mos keladigan jami foydalanuvchilar sonini hisoblaydi
          },
        },
      ])
      .exec();

    if (!result.length) {
      throw new InternalServerErrorException('No data found');
    }
    return result[0]; // [0] – bu yerda 0 indeksi orqali faqatgina birinchi elementni olishimiz mumkin, chunki $facet operatori ikkita massiv qaytaradi: biri ro'yxat (list), ikkinchisi esa metaCounter.
  }

  private async checkSubscription(
    followerId: ObjectId,
    followingId: ObjectId,
  ): Promise<MeFollowed[]> {
    const result = await this.followModel
      .findOne({ followerId: followerId, followingId: followingId })
      .exec();
    return result
      ? [
          {
            followerId: followerId,
            followingId: followingId,
            myFollowing: true,
          },
        ]
      : [];
  }

  public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
    const { _id, ...updateData } = input;

    if (!_id || !Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const result = await this.memberModel
      .findOneAndUpdate({ _id }, updateData, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException(`No member found with ID: ${_id}`);
    }

    return result;
  }

  public async memberStatsEditor(input: StatisticModifier): Promise<Member> {
    console.log('executed');
    const { _id, targetKey, modifier } = input;
    const result = await this.memberModel
      .findByIdAndUpdate(
        _id,
        {
          $inc: {
            [targetKey]: modifier,
          },
        },
        { new: true },
      )
      .exec();

    if (!result) {
      throw new NotFoundException(`No member found with ID: ${_id}`);
    }

    return result;
  }
}
