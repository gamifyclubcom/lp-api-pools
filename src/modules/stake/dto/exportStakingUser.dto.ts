import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';

export class ExportStakingUsersDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  stake_account?: string;
}
