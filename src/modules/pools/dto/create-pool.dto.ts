import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {mockPool} from '../../../shared/testGlobals';
import {TokenDto} from '../pools.dto';

export class CreateEarlyJoinPoolPhaseDto {
  @ApiProperty()
  is_active: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  max_total_alloc?: number;
}

export class CreatePublicPhaseDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  max_individual_alloc: number;
}

export class CreatePoolCampaignDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  max_allocation_all_phases: number;

  @ApiProperty()
  @IsDateString()
  claim_at: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateEarlyJoinPoolPhaseDto)
  early_join_phase: CreateEarlyJoinPoolPhaseDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreatePublicPhaseDto)
  public_phase: CreatePublicPhaseDto;
}

export class InitPoolOffchainData {
  @ApiProperty()
  @IsDateString()
  pool_start: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => TokenDto)
  token: TokenDto;

  @ApiPropertyOptional({
    type: String,
    example: mockPool.token_economic,
  })
  @IsOptional()
  @IsString()
  token_economic?: string;

  @ApiPropertyOptional({
    type: String,
    example: mockPool.twitter,
  })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional({
    type: String,
    example: mockPool.telegram,
  })
  @IsOptional()
  @IsString()
  telegram?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  audit_link?: string;

  @ApiPropertyOptional()
  @IsOptional()
  liquidity_percentage ?: string;

  @ApiPropertyOptional({
    type: String,
    example: mockPool.medium,
  })
  @IsOptional()
  @IsString()
  medium?: string;

  @ApiPropertyOptional({
    type: String,
    example: mockPool.description,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    example: mockPool.slug,
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    type: String,
    example: mockPool.description,
  })
  @IsOptional()
  @IsString()
  token_to?: string;

  @ApiPropertyOptional({
    type: String,
    example: mockPool.logo,
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  tag_line?: string;

  @ApiProperty({
    type: String,
    example: mockPool.name,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    type: String,
    example: mockPool.website,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pool_account?: string;


  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pool_account_secret?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  claimable_percentage?: number
}
export class CreatePoolInput extends InitPoolOffchainData {
  @ApiProperty()
  @IsDateString()
  join_pool_start: string;

  @ApiProperty()
  @IsDateString()
  join_pool_end: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  root_admin: string;

  @ApiProperty({
    type: CreatePoolCampaignDto,
  })
  @ValidateNested()
  @Type(() => CreatePoolCampaignDto)
  campaign: CreatePoolCampaignDto;

  @ApiProperty({
    type: Number,
    example: mockPool.token_ratio,
  })
  @IsNumber()
  @IsPositive()
  token_ratio: number;

  @ApiProperty()
  @IsString()
  pool_token_x: string;

  @ApiProperty()
  @IsString()
  pool_token_y: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  early_join_duration?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  payer: string;

  @ApiProperty()
  @IsString()
  pool_account_secret: string;
}

export class CommitInitPoolDto extends InitPoolOffchainData {}
