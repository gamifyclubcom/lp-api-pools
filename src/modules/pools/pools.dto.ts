import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {mockPool} from '../../shared/testGlobals';
import {PoolsSectionFilter, PoolsVotingFilter} from './pools.enum';
import {
  IPoolCampaign,
  IPoolContractData,
  IPoolFullInfo,
  IPoolPhase,
  IToken,
} from './pools.interface';
import {PoolDocument} from './pools.schema';

export class PaginationOptions {
  @ApiPropertyOptional({type: Number})
  page?: number;
  @ApiPropertyOptional({type: Number})
  limit?: number;
}

export class PoolsFilterInput extends PaginationOptions {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PoolsSectionFilter)
  section?: PoolsSectionFilter;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  walletAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  poolProgramId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exceptPoolProgramId?: string;
}

export class PoolsVotingFilterInput extends PaginationOptions {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PoolsVotingFilter)
  section?: PoolsVotingFilter;
}

export class VerifySignatureInput {
  @ApiPropertyOptional()
  @IsOptional()
  signature?: any;

  @ApiPropertyOptional()
  @IsOptional()
  publicKey?: any;
}
export class IndexPoolsOutput {
  @ApiPropertyOptional()
  docs: PoolDocument[];

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

export class TokenDto implements IToken {
  @ApiProperty({
    type: String,
    example: mockPool.token_address,
  })
  @IsNotEmpty()
  token_address: string;

  @ApiProperty({
    type: Number,
    example: mockPool.token_decimals,
  })
  @IsNotEmpty()
  token_decimals: number;

  @ApiProperty({
    type: String,
    example: mockPool.token_name,
  })
  @IsNotEmpty()
  token_name: string;

  @ApiProperty({
    type: String,
    example: mockPool.token_symbol,
  })
  @IsNotEmpty()
  token_symbol: string;

  @ApiProperty({
    type: Number,
    example: mockPool.token_total_supply,
  })
  token_total_supply: string;
}

export class PoolPhaseDto implements IPoolPhase {
  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  max_total_alloc: number;

  @ApiProperty()
  max_individual_alloc: number;

  @ApiProperty()
  sold_allocation: number;

  @ApiProperty()
  number_joined_user: number;

  @ApiProperty()
  start_at: Date;

  @ApiProperty()
  end_at: Date;
}

export class PoolCampaignDto implements IPoolCampaign {
  @ApiProperty()
  max_allocation_all_phases: number;

  @ApiProperty()
  number_whitelisted_user: number;

  @ApiProperty({type: Date})
  claim_at: Date;

  @ApiProperty()
  early_join_phase: PoolPhaseDto;

  @ApiProperty()
  public_phase: PoolPhaseDto;
}

export class PoolDto implements IPoolFullInfo {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  root_admin: string;

  @ApiProperty()
  pool_start: Date;

  @ApiProperty({
    type: String,
    example: mockPool.logo,
  })
  logo?: string;

  @ApiProperty({
    type: String,
    example: mockPool.thumbnail,
  })
  thumbnail?: string;

  @ApiProperty({
    type: String,
    example: mockPool.name,
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    example: mockPool.website,
  })
  website?: string;

  @ApiProperty()
  token: TokenDto;

  @ApiProperty({
    type: String,
    example: mockPool.token_economic,
  })
  token_economic?: string;

  @ApiProperty({
    type: String,
    example: mockPool.twitter,
  })
  twitter?: string;

  @ApiProperty({
    type: String,
    example: mockPool.telegram,
  })
  telegram?: string;

  @ApiProperty({
    type: String,
    example: mockPool.medium,
  })
  medium?: string;

  @ApiProperty({
    type: String,
    example: mockPool.description,
  })
  description?: string;

  @ApiProperty({
    type: String,
    example: mockPool.contract_address,
  })
  contract_address: string;

  @ApiProperty({
    type: String,
    example: '',
  })
  contract_address_secret?: string;

  @ApiProperty({
    type: String,
    example: mockPool.token_to,
  })
  token_to: string;

  @ApiProperty({
    type: String,
    example: mockPool.slug,
  })
  slug?: string;

  @ApiProperty({
    type: Number,
    example: mockPool.token_ratio,
  })
  token_ratio: number;

  @ApiProperty({
    type: Object,
  })
  data: IPoolContractData;
}

export class PoolEntity extends PoolDto {
  @Exclude()
  contract_address_secret: string;

  constructor(partial: Partial<PoolEntity>) {
    super();
    Object.assign(this, partial);
  }
}

export class CreatePoolResponse extends PoolEntity {}

export class PoolOutput extends PoolDto {}

// export class UpdatePoolInput extends PartialType(PoolDto) {}
export class UpdatePoolResponse extends PoolDto {}

export class UserVoteDto {
  @ApiProperty()
  total_vote_up: number;

  @ApiProperty()
  total_vote_down: number;
}
