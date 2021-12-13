import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {PaginateQuery} from 'src/shared/interface';
import {JoinPoolStatusEnum} from '../pool-participants.enum';

export class CreateJoinPoolHistory {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  user_address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  pool_address: string;

  @ApiProperty()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  participant_address?: string;
}

export class UpdateJoinPoolHistoryStatus {
  @ApiProperty()
  @IsEnum(JoinPoolStatusEnum)
  status: JoinPoolStatusEnum;
}

export class IndexJoinPoolHistoryFilter extends PaginateQuery {
  @ApiPropertyOptional()
  @IsString()
  user_address?: string;

  @ApiPropertyOptional()
  @IsString()
  pool_address?: string;
}
