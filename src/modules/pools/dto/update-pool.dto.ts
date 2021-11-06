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

export class UpdateEarlyJoinPoolPhaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Min(0)
  max_total_alloc?: number;
}

export class UpdatePublicPhaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_individual_alloc?: number;
}

export class UpdatePoolCampaignDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  max_allocation_all_phases?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  claim_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEarlyJoinPoolPhaseDto)
  early_join_phase?: UpdateEarlyJoinPoolPhaseDto;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => UpdateEarlyJoinPoolPhaseDto)
  @ValidateNested()
  public_phase?: UpdatePublicPhaseDto;
}

export class UpdateOnchainPoolInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  join_pool_start?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  join_pool_end?: string;

  @ApiPropertyOptional({
    type: UpdatePoolCampaignDto,
  })
  @Type(() => UpdatePoolCampaignDto)
  @ValidateNested()
  campaign?: UpdatePoolCampaignDto;

  @ApiPropertyOptional({
    type: Number,
    example: mockPool.token_ratio,
  })
  @IsNumber()
  @IsPositive()
  token_ratio?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  early_join_duration?: number;
}

export class UpdateTokenDto {
  @ApiPropertyOptional({
    type: String,
    example: mockPool.token_name,
  })
  @IsNotEmpty()
  token_name?: string;

  @ApiProperty({
    type: String,
    example: mockPool.token_symbol,
  })
  @ApiPropertyOptional()
  token_symbol?: string;
}

export class UpdateOffchainPoolInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  pool_start?: string;

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

  @ApiPropertyOptional({
    type: String,
    example: mockPool.name,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: mockPool.website,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateTokenDto)
  token?: UpdateTokenDto;

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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  audit_link?: string;

  @ApiPropertyOptional()
  @IsOptional()
  liquidity_percentage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  claimable_percentage?: number
}

export class ChangePoolAdminInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  new_root_admin: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pool_id: string;
}
