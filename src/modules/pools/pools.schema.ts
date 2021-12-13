import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import * as MongooseFuzzySearching from 'mongoose-fuzzy-searching';
import {EmbeddedDocument} from '../../shared/base.document';
import {IToken} from './pools.interface';

export type PoolDocument = Pool & Document;

@Schema({_id: false})
export class Phase extends EmbeddedDocument {
  @Prop({required: true})
  is_active: boolean;

  @Prop({required: true})
  max_total_alloc: number;

  @Prop({required: true})
  max_individual_alloc: number;

  @Prop({required: true})
  sold_allocation: number;

  @Prop({required: true})
  number_joined_user: number;

  @Prop({required: true})
  start_at: Date;

  @Prop({required: true})
  end_at: Date;
}

@Schema({_id: false})
export class FcfsStakerPhase extends EmbeddedDocument {
  @Prop({required: true})
  is_active: boolean;

  @Prop({required: true})
  max_total_alloc: number;

  @Prop({required: true})
  multiplication_rate: number;

  @Prop({required: true})
  sold_allocation: number;

  @Prop({required: true})
  number_joined_user: number;

  @Prop({required: true})
  start_at: Date;

  @Prop({required: true})
  end_at: Date;
}

@Schema({_id: false})
export class PoolWeight extends EmbeddedDocument {
  @Prop({required: true})
  is_active: boolean;

  @Prop({required: true})
  weight: number;

  @Prop({required: true})
  max_individual_amount: number;

  @Prop({required: true})
  number_of_users: number;
}

@Schema({_id: false})
export class ExclusivePhase extends EmbeddedDocument {
  @Prop({required: true})
  is_active: boolean;

  @Prop({required: true})
  max_total_alloc: number;

  @Prop({required: true})
  sold_allocation: number;

  @Prop({required: true})
  number_joined_user: number;

  @Prop({required: true})
  start_at: Date;

  @Prop({required: true})
  end_at: Date;

  @Prop({required: true, type: PoolWeight.schema})
  level1: PoolWeight;

  @Prop({required: true, type: PoolWeight.schema})
  level2: PoolWeight;

  @Prop({required: true, type: PoolWeight.schema})
  level3: PoolWeight;

  @Prop({required: true, type: PoolWeight.schema})
  level4: PoolWeight;

  @Prop({required: true, type: PoolWeight.schema})
  level5: PoolWeight;

  @Prop()
  snapshot_at?: Date;
}

@Schema({_id: false})
export class Campaign extends EmbeddedDocument {
  @Prop({required: true})
  max_allocation_all_phases: number;

  @Prop({required: true})
  number_whitelisted_user: number;

  @Prop({required: true})
  claimed_allocation: number;

  @Prop({required: true, type: Phase.schema})
  early_join_phase: Phase;

  @Prop({required: true, type: Phase.schema})
  public_phase: Phase;

  @Prop({type: ExclusivePhase.schema})
  exclusive_phase?: ExclusivePhase;

  @Prop({required: true})
  claim_at: Date;

  @Prop({type: FcfsStakerPhase.schema})
  fcfs_stake_phase?: FcfsStakerPhase;

  @Prop()
  owner_withdrawed_amount?: number;

  @Prop()
  super_admin_withdrawed_amount?: number;
}

@Schema({_id: false})
export class Admins extends EmbeddedDocument {
  @Prop({required: true})
  root_admin: string;
}

@Schema({_id: false})
export class Fees extends EmbeddedDocument {
  @Prop({required: true})
  denominator: number;

  @Prop({required: true})
  numerator: number;
}

@Schema({_id: false})
export class VotingPhase extends EmbeddedDocument {
  @Prop({required: true})
  is_active: boolean;

  @Prop({required: true})
  total_vote_up: number;

  @Prop({required: true})
  total_vote_down: number;

  @Prop({required: true})
  required_absolute_vote: number;

  @Prop({required: true})
  token_voting_power_rate: number;

  @Prop({required: true})
  start_at: Date;

  @Prop({required: true})
  end_at: Date;

  @Prop({required: true})
  total_users_vote_up: number;

  @Prop({required: true})
  total_users_vote_down: number;

  @Prop({required: true})
  max_voting_days: number;
}

@Schema({_id: false})
export class Onchain extends EmbeddedDocument {
  @Prop({required: true})
  is_initialized: boolean;

  @Prop()
  version?: number;

  @Prop({required: true})
  nonce: number;

  @Prop({required: true})
  id: string;

  @Prop({required: true})
  token_x: string;

  @Prop({required: true})
  token_y: string;

  @Prop({required: true})
  rate: number;

  @Prop({required: true})
  fees: number;

  @Prop({required: true, type: Campaign.schema})
  campaign: Campaign;

  @Prop({required: true})
  is_active: boolean;

  @Prop({required: true})
  platform: string;

  @Prop({required: true, type: Admins.schema})
  admins: Admins;

  @Prop()
  stake_account?: string;

  @Prop()
  common_setting_account?: string;

  @Prop({type: VotingPhase.schema})
  voting: VotingPhase;
}

@Schema({_id: false})
export class Token extends EmbeddedDocument implements IToken {
  @Prop({required: true})
  token_address: string;

  @Prop({required: true})
  token_name: string;

  @Prop({required: true})
  token_symbol: string;

  @Prop({required: true})
  token_decimals: number;

  @Prop({required: true})
  token_total_supply: string;
}

@Schema({_id: false})
export class Flags {
  /**
   * Check pool ready join or not
   * got this from pool version 4 or greater
   * by pass if pool voting time is already ended and absolute vote (total vote up - total vote down > min vote)
   */
  @Prop({type: Boolean})
  is_ready: boolean;

  /**
   * Check pool is finalize participants or not
   */
  @Prop({type: Boolean, default: false})
  is_finalize_participants: boolean;

  /**
   * Check cron finalize participants is running or not
   */
  @Prop({type: Boolean, default: false})
  is_cron_running: boolean;
}

@Schema({timestamps: true})
export class Pool {
  @Prop()
  logo?: string;

  @Prop()
  thumbnail?: string;

  @Prop({required: true})
  name: string;

  @Prop({required: true})
  contract_address: string;

  @Prop({required: true})
  program_id: string;

  @Prop()
  website?: string;

  @Prop()
  token_economic?: string;

  @Prop()
  twitter?: string;

  @Prop()
  tag_line?: string;

  @Prop()
  telegram?: string;

  @Prop()
  medium?: string;

  @Prop({required: true, type: Token.schema})
  token: Token;

  @Prop()
  description: string;

  @Prop({required: true})
  token_to: string;

  @Prop()
  token_to_decimal: number;

  @Prop({required: true})
  pool_start: Date;

  @Prop({required: true})
  join_pool_start: Date;

  @Prop({required: true})
  join_pool_end: Date;

  @Prop({required: true})
  slug: string;

  @Prop({type: Onchain.schema})
  data: Onchain;

  @Prop()
  audit_link?: string;

  @Prop()
  liquidity_percentage?: string;

  @Prop({default: 100})
  claimable_percentage?: number;

  // Flag check pool
  @Prop({type: Flags})
  flags?: Flags;
}

export const PoolSchema = SchemaFactory.createForClass(Pool)
  .plugin(MongooseFuzzySearching, {
    fields: ['name', 'token_symbol', 'slug'],
  })
  .index(
    {name: 1, token_symbol: 1, token_address: 1, contract_address: 1, slug: 1},
    {unique: true},
  );
