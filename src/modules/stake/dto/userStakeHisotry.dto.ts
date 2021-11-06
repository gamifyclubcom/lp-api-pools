import {ApiProperty} from '@nestjs/swagger';
import {IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';
import {UserStakeActionType} from '../constants';

export class CreateUserStakeHistory {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  user_address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  stake_member_acount?: string;

  @ApiProperty({enum: UserStakeActionType})
  @IsEnum(UserStakeActionType)
  action_type: UserStakeActionType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  stake_account: string;
}
