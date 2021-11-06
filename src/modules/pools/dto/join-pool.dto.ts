import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsOptional, IsString} from 'class-validator';

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

export class JoinPoolHistoryDto {
  @IsNotEmpty()
  @IsString()
  user_address: string;

  @IsNotEmpty()
  @IsString()
  pool_address: string;

  @IsString()
  pool_id?: string;

  @IsString()
  @IsOptional()
  participant_address?: string;
}
