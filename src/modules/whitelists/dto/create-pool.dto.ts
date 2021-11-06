import {ApiProperty} from '@nestjs/swagger';
import {IsDateString} from 'class-validator';
// import { IWhitelist } from '../whitelists.interface';
// import { WhitelistDocument } from '../whitelists.schema';

export class CreateEarlyJoinPoolPhaseDto {
  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  max_total_alloc: number;

  @ApiProperty()
  @IsDateString()
  start_at: string;

  @ApiProperty()
  @IsDateString()
  end_at: string;
}

export class CreatePublicPhaseDto {
  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  max_individual_alloc: number;

  @ApiProperty()
  @IsDateString()
  start_at: string;

  @ApiProperty()
  @IsDateString()
  end_at: string;
}

export class CreatePoolCampaignDto {
  @ApiProperty()
  max_allocation_all_phases: number;

  @ApiProperty()
  @IsDateString()
  claim_at: string;

  @ApiProperty()
  early_join_phase: CreateEarlyJoinPoolPhaseDto;

  @ApiProperty()
  public_phase: CreatePublicPhaseDto;
}

export class CreatePoolInput {}
