import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {IsNumber, IsOptional, IsString} from 'class-validator';
import {WhitelistDocument} from './whitelists.schema';

export class PaginationOptions {
  @ApiPropertyOptional({type: Number})
  page?: number;
  @ApiPropertyOptional({type: Number})
  limit?: number;
}

export class WhitelistsFilterInput extends PaginationOptions {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userAccount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  poolId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;
}

export class VerifySignatureInput {
  @ApiPropertyOptional()
  @IsOptional()
  signature?: any;

  @ApiPropertyOptional()
  @IsOptional()
  publicKey?: any;
}
export class IndexWhitelistsOutput {
  @ApiPropertyOptional()
  docs: WhitelistDocument[];

  @ApiPropertyOptional()
  totalDocs: number;

  @ApiPropertyOptional()
  limit: number;

  @ApiPropertyOptional()
  totalPages: number;

  @ApiPropertyOptional()
  page: number;

  @ApiPropertyOptional()
  pagingCounter: number;

  @ApiPropertyOptional()
  hasPrevPage: boolean;

  @ApiPropertyOptional()
  hasNextPage: boolean;

  @ApiPropertyOptional()
  prevPage: number;

  @ApiPropertyOptional()
  nextPage: number;

  @ApiPropertyOptional()
  meta?: any;
}
export class WhitelistDto {}

export class WhitelistEntity extends WhitelistDto {
  @Exclude()
  contract_address_secret: string;

  constructor(partial: Partial<WhitelistEntity>) {
    super();
    Object.assign(this, partial);
  }
}

export class SetWhitelistUserDto {
  @ApiProperty()
  poolId: string;

  @ApiProperty()
  userAccount: string[];
}

export class RemoveWhitelistUserDto {
  @ApiProperty()
  poolId: string;

  @ApiProperty()
  userAccounts: string[];
}

export class VerifyWhitelistUserDto {
  @ApiProperty()
  poolId: string;

  @ApiProperty()
  userAccount: string;
}
