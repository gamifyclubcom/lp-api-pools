import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsDateString, IsNotEmpty, IsString} from 'class-validator';

export class CreateClaimTokenHistoryDto {
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
  @IsString()
  token_address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  claimed_at: string;

  @ApiProperty({default: true})
  @IsNotEmpty()
  @IsBoolean()
  is_claimed: boolean;
}

export class ClaimTokenHistoryDto {
  @ApiProperty()
  user_address: string;

  @ApiProperty()
  pool_address: string;

  @ApiProperty()
  token_address: string;

  @ApiProperty()
  claimed_at: string;

  @ApiProperty({default: true})
  is_claimed: boolean;
}

export class GetClaimTokenHistoryDto {
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
  @IsString()
  token_address: string;
}
